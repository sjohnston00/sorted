import { Habit } from "@prisma/client";
import { SerializeFrom } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { format } from "date-fns";
import Button from "~/components/Button";
import React from "react";
import { FORM_ACTIONS } from "~/utils/constants";

type HabitButtonProps = {
  habit: SerializeFrom<Habit>;
  selectedDay: Date;
};

export default function HabitButton({ habit, selectedDay }: HabitButtonProps) {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";
  return (
    <fetcher.Form method="post" className="h-full w-full">
      <input type="hidden" name="_action" value={FORM_ACTIONS.MARK_DATE} />
      <input
        type="hidden"
        name="date"
        value={format(selectedDay, "yyyy-MM-dd")}
      />
      <input type="hidden" name="habitName" value={habit.name} />
      <input type="hidden" name="habitColour" value={habit.colour} />
      <Button
        className="min-h-32 w-full py-4 border-2 text-lg"
        style={
          {
            color: habit.colour,
            borderColor: habit.colour,
            backgroundColor: `${habit.colour}20`,
            "--tw-shadow-color": habit.colour,
          } as React.CSSProperties
        }
        type="submit"
        name="habitId"
        value={habit.id}
        disabled={isSubmitting}
      >
        {habit.name}
      </Button>
    </fetcher.Form>
  );
}
