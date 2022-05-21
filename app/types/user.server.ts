export type User = {
  username: string
  email: string
  password: string
  visibility: "public" | "private"
  gravatarURL: string
  friends: Array<User>
}

export type UserWithId = User & {
  _id: string
}
