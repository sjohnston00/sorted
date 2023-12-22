import { UserChildrenFeatureFlag, UserFeatureFlag } from "@prisma/client";
import { SerializeFrom } from "@remix-run/node";

type GetFeatureFlagWithDefaultValueProps = SerializeFrom<{
  flags?: UserFeatureFlag[];
  featureFlagId: number;
  defaultValue: any;
}>;
export function getFeatureFlagEnabledWithDefaultValue({
  flags,
  featureFlagId,
  defaultValue,
}: GetFeatureFlagWithDefaultValueProps) {
  return (
    flags?.find((f) => f.featureFlagId === featureFlagId)?.enabled ||
    defaultValue
  );
}

type GetChildrenFeatureFlagWithDefaultValueProps = SerializeFrom<{
  flags?: UserChildrenFeatureFlag[];
  featureFlagId: number;
  defaultValue: any;
}>;
export function getChildrenFeatureFlagValueWithDefaultValue({
  flags,
  featureFlagId,
  defaultValue,
}: GetChildrenFeatureFlagWithDefaultValueProps) {
  return (
    flags?.find((f) => f.childrenFeatureFlagId === featureFlagId)?.value ||
    defaultValue
  );
}
