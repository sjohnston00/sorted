// import * as Icons from "@heroicons/react/24/outline"
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
} from "@remix-run/node";
import { Form, useNavigation } from "@remix-run/react";
import randomColour from "randomcolor";
import { useState } from "react";
import Button from "~/components/Button";
import Checkbox from "~/components/Form/Checkbox";
import Input, { Textarea } from "~/components/Input";
import { prisma } from "~/db.server";
import { authenticator } from "~/services/auth.server";
import { getUser } from "~/utils/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  return null;
};
export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const formData = await request.formData();
  const { name, colour, description, privateHabit } =
    Object.fromEntries(formData);

  await prisma.habit.create({
    data: {
      name: name.toString()!,
      colour: colour.toString()!,
      private: !!privateHabit,
      userId: user.id,
      days: formData.getAll("days").map((d) => String(d)),
      description: description.toString(),
    },
  });

  throw redirect("/habits");
};

export const meta: MetaFunction = () => {
  return [{ title: `Sorted | New Habit` }];
};

export default function NewHabit() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const isLoading = navigation.state === "loading";
  const [colour, setColour] = useState(randomColour());

  return (
    <div className="max-w-md mx-auto">
      <Form method="post">
        <div className="flex gap-2 mb-2">
          <Input
            label="Name"
            type="text"
            name="name"
            id="name"
            placeholder="e.g Drink 2L"
            autoComplete="off"
            minLength={3}
            maxLength={255}
            required
          />
          <div className="flex items-center">
            <Input
              label="Colour"
              type="color"
              name="colour"
              value={colour}
              onChange={(e) => {
                setColour(e.target.value);
              }}
              id="colour"
              required
            />
            <Button
              onClick={() => {
                setColour(randomColour());
              }}
              variant="ghost"
              type="button"
            >
              <ArrowPathIcon className="h-6 w-6 dark:text-gray-50" />
            </Button>
          </div>
        </div>
        <Textarea
          label="Description"
          name="description"
          placeholder="Give your habit a nice description..."
          id="description"
          autoComplete="off"
        />
        <Checkbox className="mt-4" name="privateHabit" label="Private Habit" />
        <span className="text-sm text-center text-gray-400 mt-4 mb-2 block">
          Select the days you'd like to track:
        </span>
        <div className="grid grid-cols-7 gap-1 md:gap-3 justify-items-center my-4">
          {[
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ].map((d, i) => (
            <label
              htmlFor={`days-${d}`}
              key={d}
              title={d}
              className="scale-95 min-h-8 h-full w-full aspect-square flex justify-center items-center rounded-full relative text-center transition select-none z-[2] toggle-label border-2 text-sky-500 border-sky-500"
            >
              {d.substring(0, 1)}
              <input
                type="checkbox"
                name="days"
                id={`days-${d}`}
                value={d}
                className="appearance-none cursor-pointer absolute inset-0 rounded-full toggle-checkbox z-[1]"
              />
            </label>
          ))}
        </div>
        {/* 
        TODO: Allow users to select an icon or randomise them
        <div className="grid grid-cols-6 gap-4">
          {icons.map(([name, Component]) => (
            <div
              className="flex flex-col gap-2 justify-center items-center"
              key={name}
              title={name}>
              <Component className="h-6 w-6" />
              <span>{name}</span>
            </div>
          ))}
        </div> */}
        <Button type="submit" disabled={isSubmitting || isLoading}>
          Create
        </Button>
      </Form>
    </div>
  );
}
