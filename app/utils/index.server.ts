import { prisma } from "~/db.server";
import { clerkClient } from "./auth.server";
import { SignedInAuthObject } from "@clerk/remix/api.server";

export async function getClerkUser(search: string) {
  const users = await clerkClient.users.getUserList({
    query: search,
  });

  if (users.length === 0) {
    return undefined;
  }

  const u = users[0];

  return {
    id: u.id,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    imageUrl: u.imageUrl,
    hasImage: u.hasImage,
    username: u.username,
    firstName: u.firstName,
    lastName: u.lastName,
  };
}

export async function getClerkUsersByIDs(userIDs: string[]) {
  const users = await clerkClient.users.getUserList({
    userId: [...userIDs],
  });

  return users.data.map((u) => ({
    id: u.id,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    imageUrl: u.imageUrl,
    hasImage: u.hasImage,
    username: u.username,
    firstName: u.firstName,
    lastName: u.lastName,
  }));
}

export async function getUsersFriendRequests(user: SignedInAuthObject) {
  const friendRequests = await prisma.userFriendRequest.findMany({
    where: {
      OR: [
        {
          friendRequestFrom: user.userId,
        },
        {
          friendRequestTo: user.userId,
        },
      ],
      status: "PENDING",
    },
  });

  const mySentFriendRequests = friendRequests.filter(
    (f) => f.friendRequestFrom === user.userId
  );
  const myReceivedFriendRequests = friendRequests.filter(
    (f) => f.friendRequestTo === user.userId
  );

  const userIDs = new Set([
    ...myReceivedFriendRequests.map((f) => f.friendRequestFrom),
    ...mySentFriendRequests.map((f) => f.friendRequestTo),
  ]);

  const users = await getClerkUsersByIDs([...userIDs]);

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
