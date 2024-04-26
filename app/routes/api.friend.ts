import { ActionFunctionArgs, json } from "@remix-run/node";
import { z } from "zod";
import { prisma } from "~/db.server";
import { authenticator } from "~/services/auth.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    return json(
      {
        error: "Not logged in",
      },
      401
    );
  }

  const formData = await request.formData();
  if (
    request.method === "DELETE" &&
    formData.get("_action")?.toString() === "removeFriend"
  ) {
    console.log("removeFriend");

    const { friendRowId } = z
      .object({
        friendRowId: z.string(),
        _action: z.string(),
      })
      .parse(Object.fromEntries(formData));

    const friendRowToUpdate = await prisma.userFriends.findUnique({
      where: {
        id: friendRowId,
      },
    });

    if (!friendRowToUpdate) {
      return json(
        {
          message: "Friend Row not found",
        },
        400
      );
    }

    await prisma.userFriends.delete({
      where: {
        id: friendRowId,
      },
    });

    return {
      message: "Friends updated",
    };
  }

  return {
    error: "TODO: action not implemented",
  };
};
