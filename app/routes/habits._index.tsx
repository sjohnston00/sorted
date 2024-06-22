import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";
import { authenticator } from "~/services/auth.server";
import { getUser } from "~/utils/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const habits = await prisma.habit.findMany({
    where: {
      userId: user.id,
      deleted: false,
    },
  });
  return { habits };
};

export const meta: MetaFunction = () => [{ title: "Sorted | My Habits" }];

export default function Habits() {
  const { habits } = useLoaderData<typeof loader>();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {habits.map((h) => (
        <Link
          key={h.id}
          to={`/habits/${h.id}`}
          className="py-4 px-2 rounded shadow text-center border-2 font-semibold text-lg tracking-wide disabled:opacity-30 disabled:cursor-not-allowed active:opacity-70 active:scale-90 transition"
          style={
            {
              color: h.colour,
              borderColor: h.colour,
              backgroundColor: `${h.colour}20`,
              "--tw-shadow-color": h.colour,
            } as React.CSSProperties
          }
        >
          {h.name}
        </Link>
      ))}
    </div>
  );
}
