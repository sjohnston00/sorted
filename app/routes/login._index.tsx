import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  MetaFunction,
  useActionData,
  useNavigation,
} from "@remix-run/react";
import Button from "~/components/Button";
import ErrorAlert from "~/components/ErrorAlert";
import Input from "~/components/Input";
import LinkButton from "~/components/LinkButton";
import Spinner from "~/components/icons/Spinner";
import { authenticator, webAuthnStrategy } from "~/services/auth.server";
import { sessionStorage } from "~/services/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
  return webAuthnStrategy.generateOptions(request, sessionStorage, user);
};

export const action = async ({
  request,
}: ActionFunctionArgs): Promise<{ error?: string }> => {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
  try {
    return await authenticator.authenticate("form", request, {
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
  const isNavigating = navigation.state === "submitting";

  return (
    <div className="flex flex-col items-center min-h-svh justify-center max-w-md px-4 mx-auto sm:px-7 md:px-6">
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
          <Form action="/login/google" method="post">
            <Button className="btn-block mt-4 bg-white text-black">
              Login with Google
            </Button>
          </Form>
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
