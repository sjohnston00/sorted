import React from "react"
import { HiCheck, HiX } from "react-icons/hi"
import { useFetcher } from "remix"
import type { MongoDocument } from "~/types"
import type { FriendRequest as FriendRequestType } from "~/types/friends.server"

type FriendRequestRowProps = {
  friendRequest: MongoDocument<FriendRequestType>
}

export function FriendRequestRow({ friendRequest }: FriendRequestRowProps) {
  const fetcher = useFetcher()
  return (
    <div
      className={`transition-all flex gap-2 items-center ${
        fetcher.submission ? "opacity-50" : ""
      }`}
    >
      From: {friendRequest.from?.username} To: {friendRequest.to?.username}{" "}
      <fetcher.Form method="post">
        <input
          type="hidden"
          name="friendRequestId"
          id="friendRequestId"
          value={friendRequest._id}
        />
        <input type="hidden" name="_action" id="_action" value="add-friend" />
        <div className="flex gap-2 items-center">
          <button
            className="p-0.5"
            type="submit"
            name="friendRequestAction"
            id="friendRequestAction"
            value="1"
          >
            <HiCheck className="h-8 w-8" />
          </button>
          <button
            className="p-0.5"
            type="submit"
            name="friendRequestAction"
            id="friendRequestAction"
            value="0"
          >
            <HiX className="h-8 w-8" />
          </button>
        </div>
      </fetcher.Form>
    </div>
  )
}
