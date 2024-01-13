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

export const loader = async (args: LoaderFunctionArgs) => {
  const loggedIn = await isLoggedIn(args);
  if (loggedIn) {
    throw redirect("/");
  }
  return null;
};

export const action = async (args: ActionFunctionArgs) => {
  const loggedIn = await isLoggedIn(args);
  if (loggedIn) {
    throw redirect("/");
  }

  const formData = await args.request.formData();
  const data = Object.fromEntries(formData);

  await new Promise((resolve) => setTimeout(resolve, 300));
  if (1 === 2) {
    throw redirect("/", {
      headers: {
        "Set-Cookie": "some-cookie=some-value",
      },
    });
  }

  return {
    error: "Something went wrong",
  };
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
      <Form
        method="POST"
        className="w-full"
        onSubmit={(e) => e.currentTarget.reset()}
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
