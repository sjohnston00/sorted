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
import { authenticator } from "~/services/auth.server";
import { getUserById } from "~/utils/users/queries.server";
import { requireRequestUser } from "~/utils/auth/users";

type LoaderData = {
  markedHabits: (MarkedHabit & {
    habit: Habit;
  })[];
  habits: Habit[];
  isLoadingFriendsHabits: boolean;
};

export type IndexLoaderData = typeof loader;
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireRequestUser(request);

  const url = new URL(request.url);
  const { friend: friendId } = URLSearchParamsSchemas.friend(
    Object.fromEntries(url.searchParams)
  );

  if (friendId) {
    const friendData = await getUserById(friendId);
    if (!friendData) {
      throw redirect("/");
    }

    const userFriend = await UserFriendQueries.getUserFriend(
      user.id,
      friendData.id
    ).catch(() => {
      console.log("users are not friends");
      throw redirect("/");
    });

    const userFriendId =
      userFriend.friendIdFrom === user.id
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
    user.id
  );
  const showPrivateHabits = getFeatureFlagEnabledWithDefaultValue({
    featureFlagId: FEATURE_FLAGS.VIEW_PRIVATE_HABITS_BY_DEFAULT,
    flags: userFeatureFlags,
    defaultValue: false,
  });

  const markedHabits = await (showPrivateHabits
    ? MarkedHabitQueries.getUserAllMarkedHabits(user.id)
    : MarkedHabitQueries.getUserPublicMarkedHabits(user.id));

  const habits = await (showPrivateHabits
    ? HabitQueries.getUserAllHabits(user.id)
    : HabitQueries.getUserPublicHabits(user.id));

  return json({ markedHabits, habits, isLoadingFriendsHabits: false });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const formData = await request.formData();
  if (formData.get("_action") === FORM_ACTIONS.MARK_DATE) {
    const { date, habitId } = MarkedHabitSchemas.addMarkedHabit(formData);
    await prisma.markedHabit.create({
      data: {
        date: new Date(`${date}T${format(new Date(), "HH:mm")}`),
        userId: user.id,
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
  // const { isLoaded, isSignedIn } = useUser();
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

  // if (!isLoaded || !isSignedIn) {
  //   return null;
  // }

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
