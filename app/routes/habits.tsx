import { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLocation, useNavigation } from "@remix-run/react";
import LinkButton from "~/components/LinkButton";
import { getUser } from "~/utils/auth.server";

export const loader = async (args: LoaderFunctionArgs) => {
  await getUser(args);
  return {};
};

export default function Habits() {
  const location = useLocation();
  const navigation = useNavigation();
  const navagating =
    navigation.state === "loading" || navigation.state === "submitting";
  return (
    <div className="pt-16">
      <div className="max-w-md px-4 mx-auto sm:px-7 md:max-w-4xl md:px-6 mb-8">
        <div className="flex gap-4 items-center">
          <h1 className="font-bold text-3xl tracking-tight">Habits</h1>
          {navagating ? (
            <span className="loading loading-spinner text-primary"></span>
          ) : null}
        </div>
        <div className="my-4 flex gap-4">
          <LinkButton to={"/"} variant="neutral">
            Home
          </LinkButton>
          {location.pathname.toLowerCase() !== "/habits" &&
          location.pathname.toLowerCase() !== "/habits/" ? (
            <LinkButton to={"/habits"} variant="primary">
              Back
            </LinkButton>
          ) : null}
          {location.pathname.toLowerCase() !== "/habits/new" &&
          location.pathname.toLowerCase() !== "/habits/new/" ? (
            <LinkButton to={"/habits/new"} variant="secondary">
              New
            </LinkButton>
          ) : null}
        </div>
        <Outlet />
      </div>
    </div>
  );
}
