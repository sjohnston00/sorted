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
  Link,
  MetaFunction
} from "remix";
import {
  isValidPassword,
  registerUser,
  usernameExists
} from "~/utils/register.server";
import {
  createUserSession,
  getUserId,
  loginUser,
  requireUserId
} from "~/utils/session.server";

export const meta: MetaFunction = () => {
  return {
    title: "Sorted | Register"
  };
};

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

  const validPassword = isValidPassword(password);
  if (!validPassword) {
    return {
      errors: {
        password:
          "Please provide a password that is at least 8 characters long, 1 uppercase, 1 number and 1 special character"
      }
    };
  }

  const usernameTaken = await usernameExists(username);
  if (usernameTaken) {
    return {
      errors: {
        username: "This username has already been taken, please try another one"
      }
    };
  }

  const user = await registerUser(username, password);

  return createUserSession(user._id, redirectTo);
};

export default function Register() {
  const [searchParams] = useSearchParams();
  const actionData = useActionData();
  const transition = useTransition();

  const submitting = transition.state === "submitting";
  return (
    <>
      <h1 className='text-4xl'>Register</h1>
      <Form method='post' className='auth-form'>
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
          className='input'
          required
        />
        <small className='text-red-600'>
          {actionData?.errors?.username}&nbsp;
        </small>
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
          className='input'
          required
        />
        <small className='text-red-600'>
          {actionData?.errors?.password}&nbsp;
        </small>
        <input
          type='hidden'
          name='redirectTo'
          value={searchParams.get("redirectTo") ?? undefined}
        />
        <div className='flex items-center gap-2'>
          <button
            type='submit'
            className='btn btn-primary mt-2  mr-2'
            disabled={submitting}>
            {submitting ? "Registering... " : "Register"}
          </button>
          <Link to={"/login"} className='link'>
            Already have an account? Login
          </Link>
        </div>
      </Form>
    </>
  );
}
