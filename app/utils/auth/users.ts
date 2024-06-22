import { authenticator } from "~/services/auth.server";

/**
 * Is the user logged in or not
 */
export async function isUserLoggedIn(request: Request) {
  const user = await authenticator.isAuthenticated(request);

  return !!user;
}

/**
 * Get the logged in user from the request if they are logged in
 */
export async function getRequestUser(request: Request) {
  return await authenticator.isAuthenticated(request);
}

/**
 * Redirect to a different page if a user is NOT logged in
 */
export async function requireRequestUser(
  request: Request,
  redirectTo: string = "/login"
) {
  return await authenticator.isAuthenticated(request, {
    failureRedirect: redirectTo,
  });
}

/**
 * Redirect to a different page if a user is logged in
 */
export async function getRequestUserAndRedirect(
  request: Request,
  redirectTo: string = "/"
) {
  return await authenticator.isAuthenticated(request, {
    successRedirect: redirectTo,
  });
}

/**
 * Redirect to the login page if a user is NOT logged in
 *
 * Redirect to a different page if a user is logged in
 */
export async function requireRequestUserAndRedirect(
  request: Request,
  failureRedirect: string = "/login",
  successRedirect: string = "/"
) {
  return await authenticator.isAuthenticated(request, {
    successRedirect,
    failureRedirect,
  });
}
