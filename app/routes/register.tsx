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
import { AuthActionData } from "~/types/actions";
import {
  emailExists,
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

export const action: ActionFunction = async ({
  request
}): Promise<AuthActionData | Response> => {
  const formData = await request.formData();
  const email = formData.get("email");
  const username = formData.get("username");
  const password = formData.get("password");
  const redirectTo = formData.get("redirectTo") || "/habits";

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    typeof redirectTo !== "string" ||
    typeof email !== "string"
  ) {
    return {
      errors: {
        message: "Please provide a username and password"
      }
    };
  }

  const validPassword = isValidPassword(password);
  if (!validPassword) {
    return {
      errors: {
        message:
          "Please provide a password that is at least 8 characters long, 1 uppercase, 1 number and 1 special character"
      }
    };
  }

  const usernameTaken = await usernameExists(username);
  if (usernameTaken) {
    return {
      errors: {
        message: "This username has already been taken, please try another one"
      }
    };
  }
  const emailTaken = await emailExists(email);
  if (emailTaken) {
    return {
      errors: {
        message: "This email has already been taken, please try another one"
      }
    };
  }

  const user = await registerUser(username, email, password);

  return createUserSession(user._id, redirectTo);
};

export default function Register() {
  const [searchParams] = useSearchParams();
  const actionData = useActionData<AuthActionData>();
  const transition = useTransition();

  const submitting = transition.state === "submitting";
  return (
    <>
      <h1 className='text-4xl'>Register</h1>
      <Form method='post' className='auth-form'>
        <small className='my-1 block text-red-400'>
          {actionData?.errors.message}&nbsp;
        </small>
        <div className='mb-1'>
          <label htmlFor='email'>
            Email <span className='text-red-600'>*</span>
          </label>
          <input
            type='email'
            name='email'
            id='email'
            autoComplete='email'
            className='input'
            required
          />
        </div>
        <div className='mb-1'>
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
        </div>
        <div className='mb-1'>
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
        </div>
        <input
          type='hidden'
          name='redirectTo'
          value={searchParams.get("redirectTo") ?? undefined}
        />
        <div className='flex items-center gap-2 my-2'>
          <button
            type='submit'
            className='btn btn-primary'
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
