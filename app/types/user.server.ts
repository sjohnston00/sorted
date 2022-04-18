export type User = {
  username: string;
  email: string;
  password: string;
};

export type UserWithId = User & {
  _id: string;
};
