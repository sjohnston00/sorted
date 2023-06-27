import { LoaderArgs } from "@remix-run/node"
import { Link, Outlet, useLocation, useNavigation } from "@remix-run/react"
import Spinner from "~/components/icons/Spinner"
import { getUser } from "~/utils/auth"

export const loader = async (args: LoaderArgs) => {
  await getUser(args)
  return {}
}

export default function Habits() {
  const location = useLocation()
  const navigation = useNavigation()
  const navagating =
    navigation.state === "loading" || navigation.state === "submitting"
  return (
    <div className="pt-16">
      <div className="max-w-md px-4 mx-auto sm:px-7 md:max-w-4xl md:px-6 mb-8">
        <div className="flex gap-4 items-center">
          <h1 className="font-bold text-3xl tracking-tight">Habits</h1>
          {navagating ? <Spinner /> : null}
        </div>
        <div className="my-4 flex gap-4">
          <Link
            to={"/"}
            className="rounded-2xl border border-sky-400 text-sky-400 py-2 px-4">
            Home
          </Link>
          {location.pathname.toLowerCase() !== "/habits" &&
          location.pathname.toLowerCase() !== "/habits/" ? (
            <Link
              to={"/habits"}
              className="rounded-2xl border border-indigo-400 text-indigo-400 py-2 px-4">
              Back
            </Link>
          ) : null}
          {location.pathname.toLowerCase() !== "/habits/new" &&
          location.pathname.toLowerCase() !== "/habits/new/" ? (
            <Link
              to={"/habits/new"}
              className="rounded-2xl border border-emerald-400 text-emerald-400 py-2 px-4">
              New
            </Link>
          ) : null}
        </div>
        <Outlet />
      </div>
    </div>
  )
}
