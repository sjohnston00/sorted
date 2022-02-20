import React from "react";
import {
  ActionFunction,
  Form,
  json,
  useActionData,
  useTransition,
  useSearchParams,
  LoaderFunction,
  redirect,
  Link
} from "remix";
import {
  createUserSession,
  getUserId,
  loginUser,
  requireUserId
} from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) {
    return redirect("/habits");
  }
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const username = formData.get("username")?.toString();
  const password = formData.get("password")?.toString();
  const redirectTo = formData.get("redirectTo")?.toString() || "/habits";

  if (!username || !password || !redirectTo) {
    return {
      errors: {
        username: "Please provide a username",
        password: "Please provide a password"
      }
    };
  }

  const user = await loginUser(username, password);

  if (user?.errors) {
    return json(user, 400);
  }

  console.log(typeof user._id);

  return createUserSession(user._id, redirectTo);
};

export default function Login() {
  const [searchParams] = useSearchParams();
  const actionData = useActionData();
  const transition = useTransition();

  const submitting = transition.state === "submitting";
  return (
    <>
      <h1 className='text-4xl'>Login</h1>
      <Form method='post' className='auth-form'>
        <small className='text-red-400'>{actionData?.errors}&nbsp;</small>
        <label htmlFor='username'>
          Username <span className='text-red-600'>*</span>
        </label>
        <input
          type='text'
          name='username'
          id='username'
          autoComplete='username'
          minLength={3}
          maxLength={20}
          required
        />
        <label htmlFor='password'>
          Password <span className='text-red-600'>*</span>
        </label>
        <input
          type='password'
          name='password'
          id='password'
          autoComplete='password'
          minLength={6}
          maxLength={64}
          required
        />
        <button
          type='submit'
          className='btn btn-submit mt-2  mr-2'
          disabled={submitting}>
          {submitting ? "Loging in... " : "Login"}
        </button>
        <input
          type='hidden'
          name='redirectTo'
          value={searchParams.get("redirectTo") ?? undefined}
        />
        <Link to={"/register"} className='link'>
          Don't have an account? Create one
        </Link>
      </Form>
    </>
  );
}
