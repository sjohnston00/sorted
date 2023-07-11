import { LoaderArgs } from "@remix-run/node";
import { Link, Outlet, useLocation, useNavigation } from "@remix-run/react";
import LinkButton from "~/components/LinkButton";
import Spinner from "~/components/icons/Spinner";
import { getUser } from "~/utils/auth";

export const loader = async (args: LoaderArgs) => {
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
          {navagating ? <Spinner /> : null}
        </div>
        <div className="my-4 flex gap-4">
          <LinkButton to={"/"}>Home</LinkButton>
          {location.pathname.toLowerCase() !== "/habits" &&
          location.pathname.toLowerCase() !== "/habits/" ? (
            <LinkButton to={"/habits"} variant="dark">
              Back
            </LinkButton>
          ) : null}
          {location.pathname.toLowerCase() !== "/habits/new" &&
          location.pathname.toLowerCase() !== "/habits/new/" ? (
            <LinkButton
              to={"/habits/new"}
              variant="tertiary"
              className="bg-emerald-500"
            >
              New
            </LinkButton>
          ) : null}
        </div>
        <Outlet />
      </div>
    </div>
  );
}
