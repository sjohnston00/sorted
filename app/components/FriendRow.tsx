import React from "react"
import { HiX } from "react-icons/hi"
import { useFetcher } from "remix"
import type { MongoDocument } from "~/types"
import type { User as UserType } from "~/types/user.server"

type FriendRowProps = {
  friend: MongoDocument<UserType>
}

export function FriendRow({ friend }: FriendRowProps) {
  const fetcher = useFetcher()
  const submitting = fetcher.state === "submitting"
  return (
    <div
      className={`flex gap-2 justify-between transition-all ${
        fetcher.submission ? "opacity-50" : ""
      }`}
    >
      <div className="flex gap-2 items-center">
        <img
          src={friend.gravatarURL}
          className="rounded-full"
          width={36}
          height={36}
        />
        <span>{friend.username}</span>
      </div>
      <fetcher.Form method="post">
        <input type="hidden" name="friendId" id="friendId" value={friend._id} />
        <input
          type="hidden"
          name="_action"
          id="_action"
          value="remove-friend"
        />
        <button type="submit" className={``}>
          <HiX
            className={`h-8 w-8 transition-all ${
              submitting ? "" : "opacity-70"
            }`}
          />
        </button>
      </fetcher.Form>
    </div>
  )
}
