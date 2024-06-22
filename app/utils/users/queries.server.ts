import { User } from "@prisma/client";
import { prisma } from "~/db.server";

export async function getUsersByIDs(userIDs: string[]): Promise<User[]> {
  const users = await prisma.user.findMany({
    where: {
      id: {
        in: userIDs,
      },
    },
  });

  return users;
}

export async function getUserById(id: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  return user;
}

export async function searchUsersByUsername(username: string): Promise<User[]> {
  const users = await prisma.user.findMany({
    where: {
      username: {
        contains: username,
        mode: "insensitive",
      },
      enabled: true,
    },
    take: 10,
  });
  return users;
}
