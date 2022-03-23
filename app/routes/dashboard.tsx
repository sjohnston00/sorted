import { useEffect, useState } from "react";
import {
  LoaderFunction,
  MetaFunction,
  Outlet,
  useCatch,
  useFetcher,
  useLoaderData,
  useNavigate
} from "remix";
import CalendarComponent from "~/components/calendar";
import { requireUserId } from "~/utils/session.server";
import { getHabitsForUser } from "~/utils/habits.server";
import { getMarkedHabitsForUser } from "~/utils/markedHabits.server";
import useIsMount from "~/utils/hooks/useIsMount";

type LoaderData = {
  dates: any;
};

export const meta: MetaFunction = () => {
  return {
    title: `Sorted | Dashboard`
  };
};

export const loader: LoaderFunction = async ({
  request
}): Promise<LoaderData> => {
  const userId = await requireUserId(request);
  const habits = await getHabitsForUser(userId);
  const dates = await getMarkedHabitsForUser(
    userId,
    new Date(0),
    new Date(2100, 0)
  );

  return {
    dates: dates
  };
};

export default function Dashboard() {
  const isMount = useIsMount();
  const { dates } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const [value, onChange] = useState(new Date());
  useEffect(() => {
    if (isMount) {
      //means its th first render
      return;
    }
    navigate(`${value.toISOString().split("T")[0]}`);
  }, [value]);

  return (
    <div className='flex md:flex-row sm:flex-col gap-2'>
      <CalendarComponent
        markedHabits={dates}
        value={value}
        onChange={(newValue) => {
          onChange(newValue);
          return;
        }}
      />
      <Outlet />
    </div>
  );
}
export function CatchBoundary() {
  const error = useCatch();
  console.error(error);
  return <p>Something went wrong</p>;
}
export function ErrorBoundary({ error }: any) {
  console.error(error);
  return <p>Something went wrong</p>;
}
