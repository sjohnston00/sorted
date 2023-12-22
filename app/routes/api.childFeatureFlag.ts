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

  const childFeatureFlagId = Number(data.childFeatureFlagId);
  const value = data.value.toString()!;
  const _action = data._action?.toString();

  const childFeatureFlag = await prisma.childrenFeatureFlag.findFirst({
    where: {
      id: childFeatureFlagId,
    },
  });

  if (!childFeatureFlag) {
    return json(
      {
        error: "No feature flag found",
      },
      404
    );
  }

  const user = await getUser(args);

  if (_action === "updateUserChildFeatureFlag") {
    const userChildFeatureFlag = await prisma.userChildrenFeatureFlag.findFirst(
      {
        where: {
          childrenFeatureFlagId: childFeatureFlagId,
          userId: user.userId,
        },
      }
    );
    if (!userChildFeatureFlag) {
      await prisma.userChildrenFeatureFlag.create({
        data: {
          userId: user.userId,
          value,
          childrenFeatureFlagId: childFeatureFlagId,
        },
      });
    } else {
      await prisma.userChildrenFeatureFlag.update({
        where: {
          id: userChildFeatureFlag.id,
        },
        data: {
          value,
        },
      });
    }
    return null;
  }

  return {
    error: 'Provide an "_action" name',
  };
};
