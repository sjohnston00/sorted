import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import {
  Form,
  Link,
  MetaFunction,
  useActionData,
  useNavigation,
} from "@remix-run/react";
import Button from "~/components/Button";
import ErrorAlert from "~/components/ErrorAlert";
import Input from "~/components/Input";
import Spinner from "~/components/icons/Spinner";
import { isLoggedIn } from "~/utils/auth.server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "~/db.server";
import { authenticator } from "~/services/auth.server";

export const loader = async (args: LoaderFunctionArgs) => {
  // return await authenticator.isAuthenticated(args.request, {
  //   successRedirect: "/",
  // })
  const loggedIn = await isLoggedIn(args);
  if (loggedIn) {
    throw redirect("/");
  }
  return null;
};

export const action = async (
  args: ActionFunctionArgs
): Promise<{ error: string }> => {
  const loggedIn = await isLoggedIn(args);
  if (loggedIn) {
    throw redirect("/");
  }

  const request = args.request.clone();
  const formData = await request.formData();

  const data = z
    .object({
      username: z
        .string()
        .min(3, "Username must be at least 3 characters long"),
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

  //check password requirements
  if (data.password.length < 8) {
    return {
      error: "Password must be at least 8 characters long",
    };
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  await prisma.user.create({
    data: {
      username: data.username,
      password: hashedPassword,
    },
  });

  return authenticator.authenticate("form", args.request, {
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
            label="New Password"
            type="password"
            name="password"
            id="password"
            minLength={8}
            required
          />
          <div className="flex items-center justify-center gap-4 w-full">
            <Link to={"/login"} className="flex-1 text-center">
              Login
            </Link>
            <Button type="submit" className="flex-1">
              Register
              {isNavigating ? <Spinner /> : null}
            </Button>
          </div>
        </fieldset>
      </Form>
    </div>
  );
}
