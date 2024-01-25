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
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { z } from "zod";
import Button from "~/components/Button";
import ErrorAlert from "~/components/ErrorAlert";
import Input from "~/components/Input";
import Spinner from "~/components/icons/Spinner";
import { isLoggedIn } from "~/utils/auth.server";
import { authenticator, webAuthnStrategy } from "~/services/auth.server";
import { sessionStorage } from "~/services/session.server";
import { handleFormSubmit } from "remix-auth-webauthn";
import LinkButton from "~/components/LinkButton";
import { isClerkAPIResponseError, useSignIn } from "@clerk/remix";

export const loader = async (args: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(args.request);
  return webAuthnStrategy.generateOptions(args.request, sessionStorage, user);

  // const loggedIn = await isLoggedIn(args);
  // if (loggedIn) {
  //   throw redirect("/");
  // }
  // return null;
};

export const action = async (
  args: ActionFunctionArgs
): Promise<{ error: string | null }> => {
  // const loggedIn = await isLoggedIn(args);
  // if (loggedIn) {
  //   throw redirect("/");
  // }

  try {
    return await authenticator.authenticate("form", args.request, {
      successRedirect: "/",
      throwOnError: true,
    });
  } catch (error) {
    if (error instanceof Response && error.status === 302) {
      throw error; //if its a redirect, throw it
    }

    return {
      error: String(error),
    };
  }
};
export const meta: MetaFunction = () => {
  return [
    {
      title: "Login",
    },
  ];
};

export default function Login() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const options = useLoaderData<typeof loader>();
  const { isLoaded, setActive, signIn } = useSignIn();
  const isNavigating = navigation.state === "submitting";

  return (
    <div className="flex flex-col items-center min-h-svh justify-center max-w-md px-4 mx-auto sm:px-7 md:px-6">
      <h1 className="text-5xl font-bold tracking-widest mb-8 ">_sorted</h1>
      {actionData?.error ? (
        <div className="mb-2 w-full">
          <ErrorAlert>{actionData.error}</ErrorAlert>
        </div>
      ) : null}
      <Form
        method="POST"
        // onSubmit={async (e) => {
        //   e.preventDefault();
        //   if (!signIn) return;
        //   const formData = new FormData(
        //     e.currentTarget,
        //     e.currentTarget.querySelector("button:focus") as HTMLElement
        //   );
        //   console.log({
        //     data: Object.fromEntries(formData),
        //   });

        //   const username = formData.get("username") as string;
        //   const password = formData.get("password") as string;
        //   const strategy = formData.get("strategy") as
        //     | "password"
        //     | "oauth_google";
        //   console.log({
        //     username,
        //     password,
        //     strategy,
        //   });
        //   let signInParams;
        //   if (strategy === "password") {
        //     signInParams = {
        //       identifier: username,
        //       password,
        //       strategy,
        //     };
        //   } else {
        //     signInParams = {
        //       identifier: username,
        //       redirectUrl: "/",
        //       strategy,
        //     };
        //   }

        //   try {
        //     const result = await signIn.create(signInParams);
        //     console.log({ result });
        //   } catch (error) {
        //     if (isClerkAPIResponseError(error)) {
        //       console.error("Error signing in: ", error.errors[0]);
        //     }
        //     console.error("Error signing in: ", error);
        //   }
        // }}
        className="w-full"
      >
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
            label="Password"
            type="password"
            name="password"
            id="password"
            minLength={8}
            required
          />
          <div className="flex items-center justify-center gap-4 w-full">
            <Button
              type="submit"
              name="strategy"
              value="password"
              className="flex-1"
            >
              Login
              {isNavigating ? <Spinner /> : null}
            </Button>
            <LinkButton to={"/register"} className="flex-1 btn-ghost">
              Register
            </LinkButton>
          </div>
          {/* <Button
            type="submit"
            name="strategy"
            value="oauth_google"
            className="btn-block mt-4 bg-white text-black"
          >
            Login with Google
          </Button> */}
          <LinkButton
            to={"/login-passkey"}
            className="btn-block mt-4 btn-secondary"
          >
            Login with Passkey
          </LinkButton>
        </fieldset>
      </Form>
    </div>
  );
}
