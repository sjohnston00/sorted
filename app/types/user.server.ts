export type User = {
  username: string
  password: string
}

export type UserWithId = User & {
  _id: string
}
