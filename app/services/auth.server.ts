import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/services/session.server";
import { FormStrategy } from "remix-auth-form";
import { prisma } from "~/db.server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { WebAuthnStrategy } from "remix-auth-webauthn";
import {
  createAuthenticator,
  createUser,
  getAuthenticatorById,
  getUserById,
  getUserByUsername,
  getUsersAuthenticators,
} from "~/utils/authenticatorQueries";
import { User } from "@prisma/client";
import { GoogleStrategy } from "remix-auth-google";

export type AuthenticatorUser = {
  username: string;
  email?: string | null;
  id: string;
  avatarUrl?: string;
};

export let authenticator = new Authenticator<AuthenticatorUser>(sessionStorage);

const formStrategy = new FormStrategy(async ({ form }) => {
  const data = z
    .object({
      username: z
        .string()
        .min(3, "Username must be at least 3 characters long"),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters long"),
    })
    .parse(Object.fromEntries(form));

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        {
          email: data.username,
        },
        {
          username: data.password,
        },
      ],
      enabled: true,
    },
    include: {
      password: true,
    },
  });

  if (!user || !user.password) {
    throw "Username or password incorrect";
  }

  const isPasswordCorrect = await bcrypt.compare(
    data.password,
    user.password.passwordHash
  );

  if (!isPasswordCorrect) {
    throw "Username or password incorrect";
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      lastLogin: new Date(),
    },
  });

  return {
    username: user.username,
    email: user.email,
    id: user.id,
    avatarUrl: user.avatarUrl,
  };
});

export const webAuthnStrategy = new WebAuthnStrategy<AuthenticatorUser>(
  {
    rpName: "_sorted",
    // The hostname of the website, determines where passkeys can be used
    // See https://www.w3.org/TR/webauthn-2/#relying-party-identifier
    // Type: string | (response:Response) => Promise<string> | string
    rpID: (request) => new URL(request.url).hostname,
    // Website URL (or array of URLs) where the registration can occur
    origin: (request) => new URL(request.url).origin,
    // Return the list of authenticators associated with this user. You might
    // need to transform a CSV string into a list of strings at this step.
    getUserAuthenticators: async (user) => {
      const authenticators = await getUsersAuthenticators(user?.id);

      return authenticators.map((authenticator) => ({
        ...authenticator,
        transports: authenticator.transports.split(","),
      }));
    },
    // Transform the user object into the shape expected by the strategy.
    // You can use a regular username, the users email address, or something else.
    getUserDetails: (user) =>
      user
        ? {
            id: user.id.toString(),
            username: user.username,
            displayName: user.username,
          }
        : null,
    // Find a user in the database with their username/email.
    getUserByUsername: (username) => getUserByUsername(username),
    getAuthenticatorById: (id) => getAuthenticatorById(id),
  },
  async function verify({ authenticator, type, username }) {
    let user: User | null = null;
    const savedAuthenticator = await getAuthenticatorById(
      authenticator.credentialID
    );
    if (type === "registration") {
      // Check if the authenticator exists in the database
      if (savedAuthenticator) {
        throw new Error("Authenticator has already been registered.");
      } else {
        // Username is null for authentication verification,
        // but required for registration verification.
        // It is unlikely this error will ever be thrown,
        // but it helps with the TypeScript checking
        if (!username) throw new Error("Username is required.");
        user = await getUserByUsername(username);

        // Don't allow someone to register a passkey for
        // someone elses account.
        if (user) throw new Error("User already exists.");

        // Create a new user and authenticator
        user = await createUser(username);
        await createAuthenticator(
          {
            ...authenticator,
            credentialBackedUp: Boolean(authenticator.credentialBackedUp),
          },
          user.id
        );
      }
    } else if (type === "authentication") {
      if (!savedAuthenticator) throw new Error("Authenticator not found");
      user = await getUserById(savedAuthenticator.userId);
    }

    if (!user) throw new Error("User not found");
    return user;
  }
);

export const googleStrategy = new GoogleStrategy<AuthenticatorUser>(
  {
    clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_OAUTH_SECRET,
    callbackURL: "/login/google/callback",
  },
  async ({ profile }) => {
    console.log({ profile });

    const user = await prisma.user.findFirst({
      where: {
        email: profile.emails[0].value,
      },
    });

    if (user) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          lastLogin: new Date(),
          avatarUrl: profile.photos[0]?.value,
          googleId: profile.id,
        },
      });
    } else {
      throw new Error("User not found");
      //TODO: If user is signing up for first time through google, make sure that they give a username as well
    }

    return {
      id: user.id,
      email: profile.emails[0].value,
      username: profile.displayName,
      avatarUrl: profile.photos[0]?.value,
    };
  }
);

authenticator.use(formStrategy, "form");
authenticator.use(googleStrategy, "google");
authenticator.use(webAuthnStrategy);
