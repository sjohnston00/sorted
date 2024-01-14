import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/services/session.server";
import { FormStrategy } from "remix-auth-form";
import { prisma } from "~/db.server";
import bcrypt from "bcryptjs";
import { z } from "zod";

type AuthenticatorUser = {
  username: string;
  email?: string | null;
  id: number;
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

  const user = await prisma.user.findUnique({
    where: {
      username: data.username,
      enabled: true,
    },
  });

  if (!user) {
    throw "Username or password is incorrect";
  }

  const isPasswordCorrect = await bcrypt.compare(data.password, user.password);

  if (!isPasswordCorrect) {
    throw "Username or password is incorrect";
  }

  return {
    username: user.username,
    email: user.email,
    id: user.id,
  };
});

authenticator.use(formStrategy, "form");
