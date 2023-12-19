import { useUser } from "@clerk/remix";
import { Habit, MarkedHabit } from "@prisma/client";
import {
  ActionFunctionArgs,
  redirect,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { useLoaderData, useRouteLoaderData } from "@remix-run/react";
import { format } from "date-fns";
import { z } from "zod";
import Calendar from "~/components/Calendar";
import FriendsRow from "~/components/FriendsRow";
import ScrollingCalendar from "~/components/ScrollingCalendar";
import { prisma } from "~/db.server";
import { RootLoaderData } from "~/root";
import { getClerkUser } from "~/utils";
import { getUser } from "~/utils/auth.server";
import { FEATURE_FLAGS } from "~/utils/constants";

type LoaderData = {
  markedHabits: (MarkedHabit & {
    habit: Habit;
  })[];
  habits: Habit[];
  isLoadingFriendsHabits: boolean;
};

export const loader = async (args: LoaderFunctionArgs): Promise<LoaderData> => {
  const { userId } = await getUser(args);

  const url = new URL(args.request.url);
  const { friend } = z
    .object({
      friend: z.string().optional(),
    })
    .parse(Object.fromEntries(url.searchParams));

  if (friend) {
    const friendData = await getClerkUser(friend);
    if (!friendData) {
      throw redirect("/");
    }

    const userFriend = await prisma.userFriends
      .findFirstOrThrow({
        where: {
          OR: [
            {
              AND: {
                friendIdFrom: friendData.id,
                friendIdTo: userId,
              },
            },
            {
              AND: {
                friendIdTo: friendData.id,
                friendIdFrom: userId,
              },
            },
          ],
        },
      })
      .catch(() => {
        console.log("users are not friends");
        throw redirect("/");
      });

    const userFriendId =
      userFriend.friendIdFrom === userId
        ? userFriend.friendIdTo
        : userFriend.friendIdFrom;

    const [friendsMarkedHabits, friendsHabits] = await Promise.all([
      prisma.markedHabit.findMany({
        where: {
          userId: userFriendId,
          habit: {
            deleted: false,
            private: false,
          },
        },
        include: {
          habit: true,
        },
        orderBy: {
          date: "desc",
        },
      }),
      prisma.habit.findMany({
        where: {
          userId: userFriendId,
          deleted: false,
          private: false,
        },
      }),
    ]);

    return {
      markedHabits: friendsMarkedHabits,
      habits: friendsHabits,
      isLoadingFriendsHabits: true,
    };
  }

  const [markedHabits, habits] = await Promise.all([
    prisma.markedHabit.findMany({
      where: {
        userId,
        habit: {
          deleted: false,
        },
      },
      include: {
        habit: true,
      },
      orderBy: {
        date: "desc",
      },
    }),
    prisma.habit.findMany({
      where: {
        userId,
        deleted: false,
      },
    }),
  ]);

  return { markedHabits, habits, isLoadingFriendsHabits: false };
};

export const action = async (args: ActionFunctionArgs) => {
  const { userId } = await getUser(args);

  const formData = await args.request.formData();
  if (formData.get("_action") === "mark-date") {
    await prisma.markedHabit.create({
      data: {
        date: new Date(
          `${formData.get("date")?.toString()}T${format(new Date(), "HH:mm")}`
        ),
        userId,
        habitId: formData.get("habitId")?.toString()!,
      },
    });
    return Object.fromEntries(formData);
  }

  if (formData.get("_action") === "remove-marked-habit") {
    await prisma.markedHabit.delete({
      where: {
        id: formData.get("markedHabit-id")?.toString(),
      },
    });
    return {};
  }

  await prisma.habit.create({
    data: {
      userId,
      name: "Test",
      colour: "#ffffff",
    },
  });

  return {};
};

export const meta: MetaFunction = () => {
  return [{ title: "Sorted" }];
};

export default function Index() {
  const { isLoaded, isSignedIn } = useUser();
  const { markedHabits, habits, isLoadingFriendsHabits } =
    useLoaderData<typeof loader>();
  const loggedInUser = useRouteLoaderData<RootLoaderData>("root");
  const useScrollingCalendarFeature = loggedInUser?.userFeatureFlags.some(
    (uf) => uf.featureFlagId === FEATURE_FLAGS.SCROLLING_CALENDAR && uf.enabled
  );

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <div>
      <div className="mt-8">
        <div className="max-w-md px-4 mx-auto sm:px-7 md:max-w-4xl md:px-6 mb-8">
          <h2 className="text-lg font-bold tracking-tight mb-4">Friends</h2>
          <FriendsRow />

          {useScrollingCalendarFeature ? (
            <ScrollingCalendar
              indicators={markedHabits}
              isLoadingFriendsHabits={isLoadingFriendsHabits}
              markedHabits={markedHabits}
              habits={habits}
              startWeekMonday
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
