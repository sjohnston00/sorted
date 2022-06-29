import mongoose from "mongoose"

const CONNECTION =
  process.env.NODE_ENV === "production"
    ? process.env.MONGO_URI || ""
    : process.env.MONGO_TEST_URI || ""

// const CONNECTION = process.env.MONGO_URI || ""

mongoose.connect(CONNECTION, (err) => {
  if (err) console.error(err)
})

export default mongoose
