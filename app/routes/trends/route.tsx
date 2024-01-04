import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  getWeek,
  setWeek,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { z } from "zod";
import LinkButton from "~/components/LinkButton";
import { prisma } from "~/db.server";
import { getUser } from "~/utils/auth.server";
import { FEATURE_FLAGS } from "~/utils/constants";
import { getFeatureFlagEnabledWithDefaultValue } from "~/utils/featureFlags";
import { UserFeatureFlagQueries } from "~/utils/queries.server";

export const loader = async (args: LoaderFunctionArgs) => {
  const { userId } = await getUser(args);

  const url = new URL(args.request.url);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const currentWeekInYear = getWeek(new Date(), { weekStartsOn: 1 });
  const urlSearchSchema = z
    .object({
      tab: z.literal("month").default("month"),
      month: z.coerce
        .number()
        .min(1)
        .max(12)
        .optional()
        .default(currentMonth)
        .catch(currentMonth),
      year: z.coerce
        .number()
        .min(0)
        .max(3000)
        .optional()
        .default(currentYear)
        .catch(currentYear),
    })
    .or(
      z.object({
        tab: z.literal("all-time").default("all-time"),
      })
    )
    .or(
      z.object({
        tab: z.literal("week").default("week"),
        week: z.coerce
          .number()
          .min(1)
          .max(53)
          .optional()
          .default(currentWeekInYear)
          .catch(currentWeekInYear),
        year: z.coerce
          .number()
          .min(0)
          .max(3000)
          .optional()
          .default(currentYear)
          .catch(currentYear),
      })
    )
    .or(
      z.object({
        tab: z.literal("year").default("year"),
        year: z.coerce
          .number()
          .min(0)
          .max(3000)
          .optional()
          .default(currentYear)
          .catch(currentYear),
      })
    )
    .default({
      tab: "month",
      month: currentMonth,
      year: currentYear,
    });

  const parsedURL = urlSearchSchema.parse(Object.fromEntries(url.searchParams));

  const userFeatureFlags = await UserFeatureFlagQueries.getUsersFeatureFlags(
    userId
  );
  const showPrivateHabits = getFeatureFlagEnabledWithDefaultValue({
    featureFlagId: FEATURE_FLAGS.VIEW_PRIVATE_HABITS_BY_DEFAULT,
    flags: userFeatureFlags,
    defaultValue: false,
  });

  let beginDate: Date | undefined;
  let endDate: Date | undefined;

  if (parsedURL.tab === "month") {
    const date = new Date(parsedURL.year, parsedURL.month - 1, 1);
    beginDate = startOfMonth(date);
    endDate = endOfMonth(date);
  }

  if (parsedURL.tab === "week") {
    const date = setWeek(new Date(), parsedURL.week, { weekStartsOn: 1 });
    beginDate = startOfWeek(date, { weekStartsOn: 1 });
    endDate = endOfWeek(date, { weekStartsOn: 1 });
  }

  if (parsedURL.tab === "year") {
    const date = new Date(parsedURL.year, 0, 1);
    beginDate = startOfYear(date);
    endDate = endOfYear(date);
  }

  const markedHabits = await prisma.markedHabit.findMany({
    select: {
      habitId: true,
    },
    where: {
      userId,
      date: {
        gte: beginDate,
        lte: endDate,
      },
      habit: {
        private: showPrivateHabits ? undefined : false,
        deleted: false,
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  //get the most markedHabit within the current tab
  const markedHabitCountByHabit: { habitId: string; amount: number }[] = [];
  markedHabits.forEach((markedHabit) => {
    const habitId = markedHabit.habitId;
    const index = markedHabitCountByHabit.findIndex(
      (habit) => habit.habitId === habitId
    );
    if (index === -1) {
      markedHabitCountByHabit.push({
        habitId,
        amount: 1,
      });
    } else {
      markedHabitCountByHabit[index].amount += 1;
    }
  });

  //sort the markedHabit by amount desc
  markedHabitCountByHabit.sort((a, b) => b.amount - a.amount);

  const habits = await prisma.habit.findMany({
    where: {
      id: {
        in: markedHabitCountByHabit.map((habit) => habit.habitId),
      },
    },
  });

  const mostTrackedHabitAmount = markedHabitCountByHabit.reduce<
    { habitId: string; amount: number } | undefined
  >((a, b) => (a?.amount || 0 > b.amount ? a : b), undefined);

  const mostTrackedHabit = {
    ...mostTrackedHabitAmount,
    habit: habits.find((habit) => habit.id === mostTrackedHabitAmount?.habitId),
  };

  return {
    markedHabits,
    markedHabitCountByHabit,
    habits,
    mostTrackedHabit,
    parsedURL,
  };
};

type LoaderData = typeof loader;

export default function Route() {
  const { habits, markedHabitCountByHabit, mostTrackedHabit, parsedURL } =
    useLoaderData<LoaderData>();
  const isWeekTab = parsedURL.tab === "week";
  const isMonthTab = parsedURL.tab === "month";
  const isAllTimeTab = parsedURL.tab === "all-time";
  const isYearTab = parsedURL.tab === "year";
  return (
    <div className="mt-8 px-4 mx-auto md:max-w-4xl prose mb-8 lg:prose-xl">
      <h1>Trends</h1>
      <div role="tablist" className="not-prose tabs tabs-boxed">
        <Link
          to={{
            search: "?tab=week",
          }}
          role="tab"
          className={`tab ${isWeekTab ? "tab-active" : ""}`}
        >
          Week
        </Link>
        <Link
          to={{
            search: "?tab=month",
          }}
          role="tab"
          className={`tab ${isMonthTab ? "tab-active" : ""}`}
        >
          Month
        </Link>
        <Link
          to={{
            search: "?tab=year",
          }}
          role="tab"
          className={`tab ${isYearTab ? "tab-active" : ""}`}
        >
          Year
        </Link>
        <Link
          to={{
            search: "?tab=all-time",
          }}
          role="tab"
          className={`tab ${isAllTimeTab ? "tab-active" : ""}`}
        >
          All Time
        </Link>
      </div>
      {isMonthTab ? <MonthPicker /> : null}
      {isWeekTab ? <WeekPicker /> : null}
      {isYearTab ? <YearPicker /> : null}

      {markedHabitCountByHabit.length > 0 ? (
        <div className="flex flex-col lg:items-start lg:flex-row lg:gap-8 gap-4">
          <div className="card bg-base-200 mt-8 not-prose shadow-xl flex-1">
            <div className="card-body">
              <h2 className="card-title text-center">Most Tracked</h2>
              <div
                style={{
                  borderColor: mostTrackedHabit.habit?.colour || "transparent",
                }}
                className="h-40 w-40 border-[1rem] mx-auto my-4 rounded-full bg-transparent flex flex-col items-center justify-center"
              >
                <span className="text-xl font-bold">
                  {mostTrackedHabit.amount}
                </span>
                <span className="text-xs font-semibold">times</span>
              </div>
              <span className="block text-center ">
                {mostTrackedHabit.habit?.private ? (
                  <LockClosedIcon className="text-gray-400 w-4 h-4" />
                ) : null}{" "}
                {mostTrackedHabit.habit?.name}
              </span>
            </div>
          </div>
          <div className="card bg-base-200 mt-8 not-prose shadow-xl flex-1">
            <div className="card-body">
              <div className="overflow-x-auto">
                <table className="table">
                  {/* head */}
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th className="text-end">Marked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {markedHabitCountByHabit.map((mh) => {
                      const habit = habits.find((h) => h.id === mh.habitId);
                      const amount = mh.amount;
                      return (
                        <tr key={mh.habitId}>
                          <td className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full"
                              style={{ backgroundColor: habit?.colour }}
                            ></div>
                            {habit?.private ? (
                              <LockClosedIcon className="text-gray-400 w-4 h-4" />
                            ) : null}{" "}
                            {habit?.name}
                          </td>
                          <td className="text-end">{amount}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <span className="mt-8 block text-center text-gray-500">
          No marked habits
        </span>
      )}
    </div>
  );
}

function MonthPicker() {
  const { parsedURL } = useLoaderData<LoaderData>();
  if (parsedURL.tab !== "month") return null;
  const { month, year } = parsedURL;
  const monthName = format(new Date(year, month - 1, 1), "MMMM");

  const previousMonth = month <= 1 ? 12 : month - 1;
  const previousYear = month <= 1 ? year - 1 : year;

  const nextMonth = month >= 12 ? 1 : month + 1;
  const nextYear = month >= 12 ? year + 1 : year;

  return (
    <div className="mt-8 flex items-center justify-between">
      <LinkButton
        className="btn-ghost btn-sm"
        to={{
          search: `?tab=month&month=${previousMonth}&year=${previousYear}`,
        }}
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </LinkButton>
      <span className="text-sm font-semibold">
        {monthName} {year}
      </span>
      <LinkButton
        className="btn-ghost btn-sm"
        to={{
          search: `?tab=month&month=${nextMonth}&year=${nextYear}`,
        }}
      >
        <ChevronRightIcon className="w-5 h-5" />
      </LinkButton>
    </div>
  );
}

function WeekPicker() {
  const { parsedURL } = useLoaderData<LoaderData>();
  if (parsedURL.tab !== "week") return null;
  const { week, year } = parsedURL;
  const previousWeek = week <= 1 ? 53 : week - 1;
  const previousYear = week <= 1 ? year - 1 : year;

  const nextWeek = week >= 53 ? 1 : week + 1;
  const nextYear = week >= 53 ? year + 1 : year;

  return (
    <div className="mt-8 flex items-center justify-between">
      <LinkButton
        prefetch="intent"
        className="btn-ghost btn-sm"
        to={{
          search: `?tab=week&week=${previousWeek}&year=${previousYear}`,
        }}
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </LinkButton>
      <span className="text-sm font-semibold">
        Week {week} {year}
      </span>
      <LinkButton
        prefetch="intent"
        className="btn-ghost btn-sm"
        to={{
          search: `?tab=week&week=${nextWeek}&year=${nextYear}`,
        }}
      >
        <ChevronRightIcon className="w-5 h-5" />
      </LinkButton>
    </div>
  );
}

function YearPicker() {
  const { parsedURL } = useLoaderData<LoaderData>();
  if (parsedURL.tab !== "year") return null;
  const { year } = parsedURL;
  const previousYear = year <= 1 ? year : year - 1;
  const nextYear = year >= 3000 ? year : year + 1;

  return (
    <div className="mt-8 flex items-center justify-between">
      <LinkButton
        className="btn-ghost btn-sm"
        to={{
          search: `?tab=year&year=${previousYear}`,
        }}
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </LinkButton>
      <span className="text-sm font-semibold">{year}</span>
      <LinkButton
        className="btn-ghost btn-sm"
        to={{
          search: `?tab=year&year=${nextYear}`,
        }}
      >
        <ChevronRightIcon className="w-5 h-5" />
      </LinkButton>
    </div>
  );
}
