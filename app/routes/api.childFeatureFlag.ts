import { ActionFunctionArgs, json } from "@remix-run/node";
import { prisma } from "~/db.server";
import { authenticator } from "~/services/auth.server";
import { isLoggedIn } from "~/utils/auth.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    return json(
      {
        error: "Not logged in",
      },
      401
    );
  }

  const formData = await request.formData();
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

  if (_action === "updateUserChildFeatureFlag") {
    const userChildFeatureFlag = await prisma.userChildrenFeatureFlag.findFirst(
      {
        where: {
          childrenFeatureFlagId: childFeatureFlagId,
          userId: user.id,
        },
      }
    );
    if (!userChildFeatureFlag) {
      await prisma.userChildrenFeatureFlag.create({
        data: {
          userId: user.id,
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
