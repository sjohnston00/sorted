import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  MetaFunction,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import Button from "~/components/Button";
import ErrorAlert from "~/components/ErrorAlert";
import Input from "~/components/Input";
import { authenticator, webAuthnStrategy } from "~/services/auth.server";
import { sessionStorage } from "~/services/session.server";
// import { handleFormSubmit } from "remix-auth-webauthn";
import LinkButton from "~/components/LinkButton";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
  return webAuthnStrategy.generateOptions(request, sessionStorage, user);
};

export const action = async ({
  request,
}: ActionFunctionArgs): Promise<{ error: string | null }> => {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
  try {
    await authenticator.authenticate("webauthn", request, {
      successRedirect: "/",
    });
    return { error: null };
  } catch (error) {
    // This allows us to return errors to the page without triggering the error boundary.
    if (error instanceof Response && error.status >= 400) {
      const errorMessage = (await error.json()) as { message: string };
      return { error: errorMessage.message };
    }
    throw error;
  }
};
export const meta: MetaFunction = () => {
  return [
    {
      title: "Login with Passkey",
    },
  ];
};

export default function Login() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const options = useLoaderData<typeof loader>();
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
        // onSubmit={handleFormSubmit(options)}
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
          {/* <button formMethod="GET">Check Username</button> */}
          <div className="flex items-center justify-center gap-4 w-full">
            <Button
              name="intent"
              value="registration"
              className="btn-neutral flex-1"
              disabled={options.usernameAvailable !== true}
            >
              Register with Passkey
            </Button>
            <Button name="intent" value="authentication" className="flex-1">
              Login with Passkey
            </Button>
          </div>
          <LinkButton to={"/login"} className="btn-block mt-4 btn-secondary">
            Login with Username and Password
          </LinkButton>
        </fieldset>
      </Form>
    </div>
  );
}
