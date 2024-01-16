import { type PassKeyAuthenticator } from "@prisma/client";
import { prisma } from "~/db.server";

export async function getAuthenticatorById(id: string) {
  const authenticator = await prisma.passKeyAuthenticator.findFirst({
    where: {
      credentialID: id,
    },
  });

  return {
    ...authenticator!,
    credentialBackedUp: Number(authenticator?.credentialBackedUp),
  };
}
export async function getUsersAuthenticators(
  userId?: string | null
): Promise<PassKeyAuthenticator[]> {
  if (!userId) return [];

  return await prisma.passKeyAuthenticator.findMany({
    where: {
      userId: String(userId),
    },
  });
}
export async function getUserByUsername(username: string) {
  return await prisma.user.findUnique({
    where: {
      username,
    },
    include: {
      passKeyAuthenticators: true,
    },
  });
}
export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: {
      id: String(id),
    },
    include: {
      passKeyAuthenticators: true,
    },
  });
}
export async function createAuthenticator(
  authenticator: Omit<PassKeyAuthenticator, "userId" | "id">,
  userId: string
) {
  await prisma.passKeyAuthenticator.create({
    data: {
      ...authenticator,
      userId: String(userId),
    },
  });
}

export async function createUser(username: string) {
  return await prisma.user.create({
    data: {
      username,
      password: "test",
    },
  });
}
