import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import { authenticator } from "~/services/auth.server";
import { searchUsersByUsername } from "~/utils/users/queries.server";
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    return json(
      {
        error: "Not logged in",
      },
      401
    );
  }

  const url = new URL(request.url);
  const query = z
    .object({
      search: z.string().optional(),
    })
    .parse(Object.fromEntries(url.searchParams));

  const users = await searchUsersByUsername(query.search || "");

  return {
    users: users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    })),
  };
};
