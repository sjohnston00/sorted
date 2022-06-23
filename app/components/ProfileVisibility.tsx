import React from "react"
import { useFetcher } from "remix"

type ProfileVisibilityProps = {
  visibility: "public" | "private"
}

export default function ProfileVisibility({
  visibility,
}: ProfileVisibilityProps) {
  const fetcher = useFetcher()
  return (
    <fetcher.Form
      className="flex justify-around"
      onChange={(e) => {
        const formData = new FormData(e.currentTarget)
        fetcher.submit(formData, {
          action: "/profile",
          method: "post",
          encType: "application/x-www-form-urlencoded",
        })
      }}
    >
      <label
        className="flex gap-2 items-center"
        htmlFor="profile-visibility-public"
      >
        <input
          type={"radio"}
          name="visibility"
          defaultChecked={visibility === "public"}
          id="profile-visibility-public"
          value={"public"}
        />
        Public
      </label>
      <label
        className="flex gap-2 items-center"
        htmlFor="profile-visibility-private"
      >
        <input
          type={"radio"}
          name="visibility"
          defaultChecked={visibility === "private"}
          id="profile-visibility-private"
          value={"private"}
        />
        Private
      </label>
      <input
        type={"hidden"}
        value="update-visibility"
        name="_action"
        id="_action"
      />
    </fetcher.Form>
  )
}
