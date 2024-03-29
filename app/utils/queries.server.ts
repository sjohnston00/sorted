import { prisma } from "~/db.server";
import { getFeatureFlagEnabledWithDefaultValue } from "./featureFlags";
import { FEATURE_FLAGS } from "./constants";

export class UserFriendQueries {
  static getUserFriend = async (userId: string, friendId: string) => {
    return prisma.userFriends.findFirstOrThrow({
      where: {
        OR: [
          {
            AND: {
              friendIdFrom: friendId,
              friendIdTo: userId,
            },
          },
          {
            AND: {
              friendIdTo: friendId,
              friendIdFrom: userId,
            },
          },
        ],
      },
    });
  };
}

export class MarkedHabitQueries {
  static getUserPublicMarkedHabits = async (userId: string) => {
    return prisma.markedHabit.findMany({
      where: {
        userId: userId,
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
    });
  };

  static getUserAllMarkedHabits = async (userId: string) => {
    return prisma.markedHabit.findMany({
      where: {
        userId: userId,
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
    });
  };

  static getMarkedHabitsBetweenDates = async (userId: string) => {
    return prisma.markedHabit.findMany({
      where: {
        userId: userId,
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
    });
  };
}

export class HabitQueries {
  static getUserPublicHabits = async (userId: string) => {
    return prisma.habit.findMany({
      where: {
        userId: userId,
        deleted: false,
        private: false,
      },
    });
  };
  static getUserAllHabits = async (userId: string) => {
    return prisma.habit.findMany({
      where: {
        userId: userId,
        deleted: false,
      },
    });
  };
}

export class UserFeatureFlagQueries {
  static getUsersFeatureFlags = async (userId: string) => {
    return prisma.userFeatureFlag.findMany({
      where: {
        userId: userId,
      },
    });
  };

  static showPrivateHabitsEnabled = async (
    userId: string
  ): Promise<boolean> => {
    const userFeatureFlags = await UserFeatureFlagQueries.getUsersFeatureFlags(
      userId
    );
    const showPrivateHabits = getFeatureFlagEnabledWithDefaultValue({
      featureFlagId: FEATURE_FLAGS.VIEW_PRIVATE_HABITS_BY_DEFAULT,
      flags: userFeatureFlags,
      defaultValue: false,
    });

    return !!showPrivateHabits;
  };
}
