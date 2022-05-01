export type User = {
  username: string
  email: string
  password: string
  visibility: "public" | "private"
  friends: Array<User>
}

export type UserWithId = User & {
  _id: string
}
