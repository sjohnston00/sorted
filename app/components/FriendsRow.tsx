import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import {
  Link,
  useLoaderData,
  useRouteLoaderData,
  useSearchParams,
} from "@remix-run/react";
import { twMerge } from "tailwind-merge";
import { RootLoaderData } from "~/root";
import { IndexLoaderData } from "~/routes/_index";

export default function FriendsRow() {
  const rootLoaderData = useRouteLoaderData<RootLoaderData>("root");
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoadingFriendsHabits } = useLoaderData<IndexLoaderData>();
  const buttonClassName =
    "h-24 w-16 flex flex-col justify-end gap-1 items-center";

  return (
    <div className="mb-8 flex items-end gap-4">
      {isLoadingFriendsHabits ? (
        <Link
          to={"/"}
          className={twMerge(buttonClassName, "text-base-content")}
          preventScrollReset
          replace
        >
          <div className="bg-base-200 flex justify-center items-center h-16 rounded-full w-full shadow-sm">
            <ArrowLeftIcon className="w-5 h-5" />
          </div>
          <div className="text-xs">Back</div>
        </Link>
      ) : null}
      {rootLoaderData?.friends && rootLoaderData.friends.length > 0
        ? rootLoaderData.friends.map((f) => {
            const friend =
              f.friendIdFrom === rootLoaderData.user.id ? f.userTo : f.userFrom;
            const searchParamSameFriend =
              searchParams.get("friend") === friend?.username;
            return (
              <Link
                className={twMerge(
                  buttonClassName,
                  searchParamSameFriend ? "animate-pulse" : ""
                )}
                key={f.id}
                to={{
                  search: searchParamSameFriend
                    ? ""
                    : `friend=${friend?.username}`,
                }}
              >
                <img
                  // src={friend?.imageUrl}
                  src={""}
                  alt="user profile image"
                  className={`box-content relative rounded-full w-full shadow-sm`}
                />
                <span
                  className={`text-xs w-full text-center overflow-ellipsis font-medium text-gray-400`}
                >
                  {friend?.username}
                </span>
              </Link>
            );
          })
        : null}
    </div>
  );
}
