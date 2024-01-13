import { SignIn } from "@clerk/remix";
import { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [{ title: `Sorted | Sign In` }];
};

export default function SignInPage() {
  return (
    <div className="flex justify-center items-center my-4">
      <SignIn routing={"path"} path={"/sign-in"} />
    </div>
  );
}
