import { prisma } from "~/db.server";
import { getUsersByIDs } from "../users/queries.server";

export async function getUsersFriendRequests(userId: string) {
  const friendRequests = await prisma.userFriendRequest.findMany({
    where: {
      OR: [
        {
          friendRequestFrom: userId,
        },
        {
          friendRequestTo: userId,
        },
      ],
      status: "PENDING",
    },
  });

  const mySentFriendRequests = friendRequests.filter(
    (f) => f.friendRequestFrom === userId
  );
  const myReceivedFriendRequests = friendRequests.filter(
    (f) => f.friendRequestTo === userId
  );

  const userIDs = new Set([
    ...myReceivedFriendRequests.map((f) => f.friendRequestFrom),
    ...mySentFriendRequests.map((f) => f.friendRequestTo),
  ]);

  const users = await getUsersByIDs([...userIDs]);

  return {
    friendRequests,
    myReceivedFriendRequests: myReceivedFriendRequests.map((f) => ({
      ...f,
      user: users.find((u) => u.id === f.friendRequestFrom),
    })),
    mySentFriendRequests: mySentFriendRequests.map((f) => ({
      ...f,
      user: users.find((u) => u.id === f.friendRequestTo),
    })),
  };
}
