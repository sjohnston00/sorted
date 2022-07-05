import React from "react"
import { IoIosShuffle } from "react-icons/io"

type Props = {
  handleRandomColour: () => void
}

export default function ShuffleColourButton({ handleRandomColour }: Props) {
  return (
    <button
      onClick={handleRandomColour}
      className="bg-neutral-50 rounded p-1 active:opacity-70"
      type={"button"}
      title={"Shuffle Colour"}
    >
      <IoIosShuffle size={"1.5em"} className="text-neutral-900" />
    </button>
  )
}
