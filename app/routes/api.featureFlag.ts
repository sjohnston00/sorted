import { ActionFunctionArgs, json } from "@remix-run/node";
import { prisma } from "~/db.server";
import { getUser, isLoggedIn } from "~/utils/auth.server";

export const action = async (args: ActionFunctionArgs) => {
  const userLoggedIn = await isLoggedIn(args);
  if (!userLoggedIn) {
    return json(
      {
        error: "Not logged in",
      },
      401
    );
  }

  const formData = await args.request.formData();
  const data = Object.fromEntries(formData);

  const featureFlagId = Number(data.featureFlagId);
  const enabled = !!data.enabled;

  const featureFlag = await prisma.featureFlag.findFirst({
    where: {
      id: featureFlagId,
    },
  });

  if (!featureFlag) {
    return json(
      {
        error: "No feature flag found",
      },
      404
    );
  }

  const user = await getUser(args);

  if (data._action?.toString() === "updateUserFeatureFlag") {
    const userFeatureFlag = await prisma.userFeatureFlag.findFirst({
      where: {
        featureFlagId,
        userId: user.userId,
      },
    });
    if (!userFeatureFlag) {
      await prisma.userFeatureFlag.create({
        data: {
          userId: user.userId,
          enabled,
          featureFlagId,
        },
      });
    } else {
      await prisma.userFeatureFlag.update({
        where: {
          id: userFeatureFlag.id,
        },
        data: {
          enabled,
        },
      });
    }
    return null;
  }

  return {
    error: 'Provide an "_action" name',
  };
};
