import { clerkClient } from './auth.server'

export function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}

export async function getClerkUser(search: string) {
  const users = await clerkClient.users.getUserList({
    query: search
  })

  if (users.length === 0) {
    return undefined
  }

  const u = users[0]

  return {
    id: u.id,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    imageUrl: u.imageUrl,
    hasImage: u.hasImage,
    username: u.username,
    firstName: u.firstName,
    lastName: u.lastName
  }
}

export async function getClerkUsersByIDs(userIDs: string[]) {
  const users = await clerkClient.users.getUserList({
    userId: [...userIDs]
  })

  return users.map((u) => ({
    id: u.id,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    imageUrl: u.imageUrl,
    hasImage: u.hasImage,
    username: u.username,
    firstName: u.firstName,
    lastName: u.lastName
  }))
}
