import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  MetaFunction,
  useActionData,
  useNavigation,
} from "@remix-run/react";
import bcrypt from "bcryptjs";
import { z } from "zod";
import Button from "~/components/Button";
import ContinueWithGoogleButton from "~/components/ContinueWithGoogleButton";
import ErrorAlert from "~/components/ErrorAlert";
import Input from "~/components/Input";
import LinkButton from "~/components/LinkButton";
import Spinner from "~/components/icons/Spinner";
import { prisma } from "~/db.server";
import { authenticator } from "~/services/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
  return null;
};

export const action = async ({
  request,
}: ActionFunctionArgs): Promise<{ error: string }> => {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });

  const clonedRequest = request.clone();
  const formData = await request.formData();

  const data = z
    .object({
      username: z
        .string()
        .min(3, "Username must be at least 3 characters long"),
      email: z
        .string()
        .email("Invalid email address")
        .min(3, "Email must be at least 3 characters long"),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters long"),
    })
    .parse(Object.fromEntries(formData));

  const foundUsersWithSameUsername = await prisma.user.count({
    where: {
      username: data.username,
    },
  });

  if (foundUsersWithSameUsername > 0) {
    return {
      error: "Username is taken",
    };
  }

  const foundUsersWithSameEmail = await prisma.user.count({
    where: {
      email: data.email,
    },
  });

  if (foundUsersWithSameEmail > 0) {
    return {
      error: "Email is taken",
    };
  }

  //check password requirements
  if (data.password.length < 8) {
    return {
      error: "Password must be at least 8 characters long",
    };
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const { id } = await prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
    },
    select: {
      id: true,
    },
  });

  const { id: passwordId } = await prisma.userPassword.create({
    data: {
      userId: id,
      passwordHash: hashedPassword,
    },
  });

  await prisma.user.update({
    where: {
      id,
    },
    data: {
      userPasswordId: passwordId,
    },
  });

  return authenticator.authenticate("form", clonedRequest, {
    successRedirect: "/",
    failureRedirect: "/register",
  });
};
export const meta: MetaFunction = () => {
  return [
    {
      title: "Register",
    },
  ];
};

export default function Register() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isNavigating = navigation.state === "submitting";

  return (
    <div className="flex flex-col items-center min-h-screen justify-center max-w-md px-4 mx-auto sm:px-7 md:px-6">
      <h1 className="text-5xl font-bold tracking-widest mb-8 ">_sorted</h1>
      {actionData?.error ? (
        <div className="mb-2 w-full">
          <ErrorAlert>{actionData.error}</ErrorAlert>
        </div>
      ) : null}
      <Form method="POST" className="w-full">
        <fieldset disabled={isNavigating}>
          <Input
            label="Username"
            type="text"
            name="username"
            id="username"
            minLength={3}
            required
          />
          <Input
            label="Email"
            type="email"
            name="email"
            id="email"
            minLength={3}
            required
          />
          <Input
            label="New Password"
            type="password"
            name="password"
            id="password"
            minLength={8}
            required
          />
          <div className="flex items-center justify-center gap-4 w-full">
            <LinkButton to={"/login"} className="flex-1 btn-ghost">
              Login
            </LinkButton>
            <Button type="submit" className="flex-1">
              Register
              {isNavigating ? <Spinner /> : null}
            </Button>
          </div>
          <Form action="/login/google" method="post" className="w-full mt-4">
            <ContinueWithGoogleButton />
          </Form>
          <LinkButton
            to={"/login-passkey"}
            className="btn-block mt-4 btn-secondary"
          >
            Register with Passkey
          </LinkButton>
        </fieldset>
      </Form>
    </div>
  );
}
