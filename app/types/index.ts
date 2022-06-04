export type MongoDocument<T> = {
  _id: string
  createdAt: string
  updatedAt: string
} & T
