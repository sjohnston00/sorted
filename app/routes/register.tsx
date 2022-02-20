import React from "react";
import {
  ActionFunction,
  Form,
  json,
  Link,
  redirect,
  useActionData,
  useTransition
} from "remix";
import { registerUser } from "~/utils/register.server";
import { createUserSession } from "~/utils/session.server";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const username = formData.get("username")?.toString();
  const password = formData.get("password")?.toString();

  if (!username || !password) {
    return {
      errors: {
        username: "Please provide a username",
        password: "Please provide a password"
      }
    };
  }

  const user = await registerUser(username, password);
  if (!user) {
    return json(
      {
        errors: {
          username: "Please provide a username",
          password: "Please provide a password"
        }
      },
      400
    );
  }

  return createUserSession(user._id, "/habits");
};

export default function Register() {
  const actionData = useActionData();
  const transition = useTransition();

  const submitting = transition.state === "submitting";

  return (
    <>
      <h1 className='text-4xl'>Register</h1>
      <Form method='post' className='auth-form'>
        <small className='text-red-400'>{actionData?.errors}&nbsp;</small>

        <label htmlFor='username'>
          Username <span className='text-red-600'>*</span>
        </label>
        <input
          type='text'
          name='username'
          id='username'
          autoComplete='off'
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
          autoComplete='off'
          minLength={6}
          maxLength={64}
          required
        />

        <button
          type='submit'
          className='btn btn-submit mt-2 mr-2'
          disabled={submitting}>
          {submitting ? "Registering... " : "Register"}
        </button>
        <Link to={"/login"} className='link'>
          Already have an account? Login
        </Link>
      </Form>
    </>
  );
}
