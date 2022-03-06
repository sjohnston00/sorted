import { LoaderFunction } from "remix";

export const loader: LoaderFunction = async ({ request, params }) => {
  //TODO: go to mongoose and load the habits
  return params;
};
