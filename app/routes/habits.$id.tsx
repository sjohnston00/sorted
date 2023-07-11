import { ActionArgs, LoaderArgs, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import Button from "~/components/Button";
import { prisma } from "~/db.server";
import { getUser } from "~/utils/auth";

export const loader = async (args: LoaderArgs) => {
  const { userId } = await getUser(args);
  const { id } = args.params;

  const habit = await prisma.habit.findUnique({
    where: {
      id,
    },
  });

  if (!habit || habit.deleted) {
    throw new Response("Not Found", {
      status: 404,
    });
  }

  if (habit.userId !== userId) {
    throw new Response("Not Authorized", {
      status: 401,
    });
  }
  return { habit };
};

export const action = async (args: ActionArgs) => {
  const { userId } = await getUser(args);
  const { id } = args.params;

  const habit = await prisma.habit.findUnique({
    where: {
      id,
    },
  });

  if (!habit || habit.deleted) {
    throw new Response("Not Found", {
      status: 404,
    });
  }

  if (habit.userId !== userId) {
    throw new Response("Not Authorized", {
      status: 401,
    });
  }
  await prisma.habit.update({
    data: {
      deleted: true,
      deletedAt: new Date(),
    },
    where: {
      id,
    },
  });

  throw redirect("/habits");
};

export default function Habit() {
  const { habit } = useLoaderData<typeof loader>();
  return (
    <div className="">
      <button
        type="button"
        className="py-4 px-2 rounded shadow text-center border-2 font-semibold text-lg tracking-wide disabled:opacity-30 disabled:cursor-not-allowed active:opacity-70 active:scale-90 transition"
        style={
          {
            color: habit.colour,
            borderColor: habit.colour,
            backgroundColor: `${habit.colour}20`,
            "--tw-shadow-color": habit.colour,
          } as React.CSSProperties
        }
      >
        {habit.name}
      </button>
      <span className="text-sm text-center text-gray-400 mt-4 mb-2 block">
        Tracking days selected
      </span>
      <div className="max-w-md mx-auto grid grid-cols-7 gap-1 md:gap-3 justify-items-center my-4">
        {[
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ].map((d, i) => (
          <label
            htmlFor={`days-${d}`}
            key={d}
            title={d}
            className="scale-95 min-h-[2rem] h-full w-full aspect-square flex justify-center items-center rounded-full relative text-center transition select-none z-[2] toggle-label border-2 text-sky-500 border-sky-500"
          >
            {d.substring(0, 1)}
            <input
              type="checkbox"
              name="days"
              defaultChecked={habit.days.includes(d)}
              disabled
              id={`days-${d}`}
              value={d}
              className="appearance-none cursor-pointer absolute inset-0 rounded-full toggle-checkbox z-[1]"
            />
          </label>
        ))}
      </div>
      <Form method="post">
        <Button type="submit" variant="danger">
          Delete
        </Button>
      </Form>
    </div>
  );
}
