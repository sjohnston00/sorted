import { SignUp } from "@clerk/remix"
import { V2_MetaFunction } from "@remix-run/node"

export const meta: V2_MetaFunction = () => {
  return [{ title: `Sorted | Sign Up` }]
}

export default function SignUpPage() {
  return (
    <div className="flex justify-center items-center my-4">
      <SignUp routing={"path"} path={"/sign-up"} />
    </div>
  )
}
