import { useUser } from "@clerk/remix";
import { Habit, MarkedHabit } from "@prisma/client";
import {
  ActionFunctionArgs,
  redirect,
  type LoaderFunctionArgs,
  type MetaFunction,
  json,
} from "@remix-run/node";
import { useLoaderData, useRouteLoaderData } from "@remix-run/react";
import { format } from "date-fns";
import Calendar from "~/components/Calendar";
import FriendsRow from "~/components/FriendsRow";
import ScrollingCalendar from "~/components/ScrollingCalendar";
import { prisma } from "~/db.server";
import { RootLoaderData } from "~/root";
import { getClerkUser } from "~/utils";
import { getUser } from "~/utils/auth.server";
import {
  CHILDREN_FEATURE_FLAGS,
  FEATURE_FLAGS,
  FORM_ACTIONS,
  SCROLLING_CALENDAR_MONTHS_NEXT_DEFAULT,
  SCROLLING_CALENDAR_MONTHS_PREVIOUS_DEFAULT,
} from "~/utils/constants";
import {
  getChildrenFeatureFlagValueWithDefaultValue,
  getFeatureFlagEnabledWithDefaultValue,
} from "~/utils/featureFlags";
import {
  HabitQueries,
  MarkedHabitQueries,
  UserFeatureFlagQueries,
  UserFriendQueries,
} from "~/utils/queries.server";
import {
  MarkedHabitSchemas,
  URLSearchParamsSchemas,
} from "~/utils/schemas.server";

type LoaderData = {
  markedHabits: (MarkedHabit & {
    habit: Habit;
  })[];
  habits: Habit[];
  isLoadingFriendsHabits: boolean;
};

export type IndexLoaderData = typeof loader;
export const loader = async (args: LoaderFunctionArgs) => {
  let now = Date.now();

  const { userId } = await getUser(args, "/sign-in");

  console.log({
    timeToGetUser: Date.now() - now,
  });

  const url = new URL(args.request.url);
  const { friend } = URLSearchParamsSchemas.friend(
    Object.fromEntries(url.searchParams)
  );

  if (friend) {
    const friendData = await getClerkUser(friend);
    if (!friendData) {
      throw redirect("/");
    }

    const userFriend = await UserFriendQueries.getUserFriend(
      userId,
      friendData.id
    ).catch(() => {
      console.log("users are not friends");
      throw redirect("/");
    });

    const userFriendId =
      userFriend.friendIdFrom === userId
        ? userFriend.friendIdTo
        : userFriend.friendIdFrom;

    const [friendsMarkedHabits, friendsHabits] = await Promise.all([
      MarkedHabitQueries.getUserPublicMarkedHabits(userFriendId),
      HabitQueries.getUserPublicHabits(userFriendId),
    ]);

    return json({
      markedHabits: friendsMarkedHabits,
      habits: friendsHabits,
      isLoadingFriendsHabits: true,
    });
  }

  const userFeatureFlags = await UserFeatureFlagQueries.getUsersFeatureFlags(
    userId
  );
  const showPrivateHabits = getFeatureFlagEnabledWithDefaultValue({
    featureFlagId: FEATURE_FLAGS.VIEW_PRIVATE_HABITS_BY_DEFAULT,
    flags: userFeatureFlags,
    defaultValue: false,
  });

  now = Date.now();

  const markedHabits = await (showPrivateHabits
    ? MarkedHabitQueries.getUserAllMarkedHabits(userId)
    : MarkedHabitQueries.getUserPublicMarkedHabits(userId));

  console.log({
    timeToMarkedHabits: Date.now() - now,
  });

  now = Date.now();

  const habits = await (showPrivateHabits
    ? HabitQueries.getUserAllHabits(userId)
    : HabitQueries.getUserPublicHabits(userId));

  console.log({
    timeToHabits: Date.now() - now,
  });

  return json({ markedHabits, habits, isLoadingFriendsHabits: false });
};

export const action = async (args: ActionFunctionArgs) => {
  const { userId } = await getUser(args);

  const formData = await args.request.formData();
  if (formData.get("_action") === FORM_ACTIONS.MARK_DATE) {
    const { date, habitId } = MarkedHabitSchemas.addMarkedHabit(formData);
    await prisma.markedHabit.create({
      data: {
        date: new Date(`${date}T${format(new Date(), "HH:mm")}`),
        userId,
        habitId,
      },
    });
    return null;
  }

  if (formData.get("_action") === FORM_ACTIONS.REMOVE_MARKED_HABIT) {
    const { markedHabitId } = MarkedHabitSchemas.removeMarkedHabit(formData);
    await prisma.markedHabit.delete({
      where: {
        id: markedHabitId,
      },
    });
    return null;
  }

  return { error: "Action not implemented" };
};

export const meta: MetaFunction = () => {
  return [{ title: "Sorted" }];
};

export default function Index() {
  const { isLoaded, isSignedIn } = useUser();
  const { markedHabits, habits, isLoadingFriendsHabits } =
    useLoaderData<typeof loader>();
  const loggedInUser = useRouteLoaderData<RootLoaderData>("root");

  // const useScrollingCalendarFeature = loggedInUser?.userFeatureFlags.some(
  //   (uf) => uf.featureFlagId === FEATURE_FLAGS.SCROLLING_CALENDAR && uf.enabled
  // );

  const scrollingCalendarEnabled = getFeatureFlagEnabledWithDefaultValue({
    flags: loggedInUser?.userFeatureFlags,
    featureFlagId: FEATURE_FLAGS.SCROLLING_CALENDAR,
    defaultValue: false,
  });

  const monthsPrevious = Number(
    getChildrenFeatureFlagValueWithDefaultValue({
      flags: loggedInUser?.userChildrenFeatureFlag,
      featureFlagId: CHILDREN_FEATURE_FLAGS.SCROLLING_CALENDAR_MONTHS_PREVIOUS,
      defaultValue: SCROLLING_CALENDAR_MONTHS_PREVIOUS_DEFAULT,
    })
  );

  const monthsNext = Number(
    getChildrenFeatureFlagValueWithDefaultValue({
      flags: loggedInUser?.userChildrenFeatureFlag,
      featureFlagId: CHILDREN_FEATURE_FLAGS.SCROLLING_CALENDAR_MONTHS_NEXT,
      defaultValue: SCROLLING_CALENDAR_MONTHS_NEXT_DEFAULT,
    })
  );

  // const monthsPrevious = Number(
  //   loggedInUser?.userChildrenFeatureFlag.find(
  //     (ucf) =>
  //       ucf.childrenFeatureFlagId ===
  //       CHILDREN_FEATURE_FLAGS.SCROLLING_CALENDAR_MONTHS_PREVIOUS
  //   )?.value || SCROLLING_CALENDAR_MONTHS_PREVIOUS_DEFAULT
  // );

  // const monthsNext = Number(
  //   loggedInUser?.userChildrenFeatureFlag.find(
  //     (ucf) =>
  //       ucf.childrenFeatureFlagId ===
  //       CHILDREN_FEATURE_FLAGS.SCROLLING_CALENDAR_MONTHS_NEXT
  //   )?.value || SCROLLING_CALENDAR_MONTHS_NEXT_DEFAULT
  // );

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <div>
      <div className="mt-8">
        <div className="max-w-md px-4 mx-auto sm:px-7 md:max-w-4xl md:px-6 mb-8">
          <h2 className="text-lg font-bold tracking-tight mb-4">Friends</h2>
          <FriendsRow />

          {scrollingCalendarEnabled ? (
            <ScrollingCalendar
              indicators={markedHabits}
              isLoadingFriendsHabits={isLoadingFriendsHabits}
              markedHabits={markedHabits}
              habits={habits}
              startWeekMonday
              monthsPrevious={monthsPrevious}
              monthsNext={monthsNext}
            />
          ) : (
            <Calendar
              isLoadingFriendsHabits={isLoadingFriendsHabits}
              markedHabits={markedHabits}
              habits={habits}
              startWeekMonday
            />
          )}
        </div>
      </div>
    </div>
  );
}
