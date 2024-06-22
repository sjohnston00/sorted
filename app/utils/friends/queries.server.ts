import { prisma } from "~/db.server";
import { getUsersByIDs } from "../users/queries.server";

export async function getUsersFriends(userId: string) {
  const friends = await prisma.userFriends.findMany({
    where: {
      OR: [
        {
          friendIdFrom: userId,
        },
        {
          friendIdTo: userId,
        },
      ],
    },
  });

  const userIDs = new Set([
    ...friends.map((f) => f.friendIdFrom),
    ...friends.map((f) => f.friendIdTo),
  ]);

  const users = await getUsersByIDs([...userIDs]);

  const populatedFriendsArray = friends.map((f) => ({
    ...f,
    userFrom: users.find((u) => u.id === f.friendIdFrom),
    userTo: users.find((u) => u.id === f.friendIdTo),
  }));

  return populatedFriendsArray;
}
