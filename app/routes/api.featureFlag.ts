import { ActionFunctionArgs, json } from "@remix-run/node";
import { prisma } from "~/db.server";
import { authenticator } from "~/services/auth.server";

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

  if (data._action?.toString() === "updateUserFeatureFlag") {
    const userFeatureFlag = await prisma.userFeatureFlag.findFirst({
      where: {
        featureFlagId,
        userId: user.id,
      },
    });
    if (!userFeatureFlag) {
      await prisma.userFeatureFlag.create({
        data: {
          userId: user.id,
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
