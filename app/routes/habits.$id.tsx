import { Dialog, Transition } from "@headlessui/react";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import React, { Fragment, useState } from "react";
import { z } from "zod";
import Button from "~/components/Button";
import Checkbox from "~/components/Form/Checkbox";
import Input, { Textarea } from "~/components/Input";
import { prisma } from "~/db.server";
import { authenticator } from "~/services/auth.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const { id } = params;

  const habit = await prisma.habit.findUnique({
    where: {
      id,
    },
  });

  if (!habit || habit.deleted) {
    throw new Response("Not Found", {
      status: 404,
    });
  }

  if (habit.userId !== user.id) {
    throw new Response("Not Authorized", {
      status: 401,
    });
  }
  return { habit };
};

export const meta: MetaFunction = (args) => {
  const data = args.data as Awaited<ReturnType<typeof loader>>;
  return [{ title: `Sorted | My Habits | ${data.habit.name}` }];
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const { id } = params;
  const formData = await request.formData();

  const { _action } = z
    .object({
      _action: z.literal("deleteHabit").or(z.literal("updateHabit")),
    })
    .parse(Object.fromEntries(formData));

  if (_action === "deleteHabit") {
    const habit = await prisma.habit.findUnique({
      where: {
        id,
      },
    });

    if (!habit || habit.deleted) {
      throw new Response("Not Found", {
        status: 404,
      });
    }

    if (habit.userId !== user.id) {
      throw new Response("Not Authorized", {
        status: 401,
      });
    }
    await prisma.habit.update({
      data: {
        deleted: true,
        deletedAt: new Date(),
      },
      where: {
        id,
      },
    });

    throw redirect("/habits");
  }
  if (_action === "updateHabit") {
    const habit = await prisma.habit.findUnique({
      where: {
        id,
      },
    });

    if (!habit || habit.deleted) {
      throw new Response("Not Found", {
        status: 404,
      });
    }

    if (habit.userId !== user.id) {
      throw new Response("Not Authorized", {
        status: 401,
      });
    }

    const { name, description, privateHabit } = z
      .object({
        name: z.string(),
        description: z.string().optional(),
        privateHabit: z.literal("on").optional(),
      })
      .parse(Object.fromEntries(formData));
    await prisma.habit.update({
      data: {
        name,
        description,
        private: !!privateHabit,
      },
      where: {
        id,
      },
    });

    throw redirect("/habits");
  }
};

export default function Habit() {
  const { habit } = useLoaderData<typeof loader>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  function closeModal() {
    setIsDeleteDialogOpen(false);
  }
  function openModal() {
    setIsDeleteDialogOpen(true);
  }

  return (
    <>
      <div className="">
        <div className="flex gap-2 items-end">
          <div
            className="inline-flex items-center justify-center aspect-square w-fit min-w-32 py-4 px-2 rounded shadow border-2 font-semibold text-lg tracking-wide"
            style={
              {
                color: habit.colour,
                borderColor: habit.colour,
                backgroundColor: `${habit.colour}20`,
                "--tw-shadow-color": habit.colour,
              } as React.CSSProperties
            }
          >
            {habit.name}
          </div>
          {habit.private ? <span>Private habit</span> : null}
        </div>
        <div className="my-4">
          <UpdateHabitForm />
        </div>
      </div>
      <Button className="btn-error" onClick={openModal}>
        Delete
      </Button>
      <Transition appear show={isDeleteDialogOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Are you sure you want to delete this habit?
                  </Dialog.Title>
                  <p className="text-gray-400 text-sm mt-4">
                    Deleting this habit will not remove any previous times you
                    have marked this habit for.
                  </p>
                  <Form method="DELETE">
                    <input type="hidden" name="_action" value="deleteHabit" />
                    <div className="mt-4 flex items-center gap-2">
                      <Button
                        type="button"
                        className="btn-secondary"
                        onClick={closeModal}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="btn-error"
                        onClick={closeModal}
                      >
                        Delete
                      </Button>
                    </div>
                  </Form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
function UpdateHabitForm() {
  const { habit } = useLoaderData<typeof loader>();
  return (
    <Form method="put">
      <input type="hidden" name="_action" value="updateHabit" />
      <Input
        label="Name"
        name="name"
        defaultValue={habit.name}
        divClassName="mb-4"
      />
      <Textarea
        defaultValue={habit.description || ""}
        label="Description"
        name="description"
        placeholder="Give your habit a nice description..."
        id="description"
        autoComplete="off"
      />
      <Checkbox
        label="Private Habit?"
        name="privateHabit"
        defaultChecked={habit.private}
      />
      <span className="text-sm text-center text-gray-400 mt-4 mb-2 block">
        Tracking days selected
      </span>
      <div className="max-w-md mx-auto grid grid-cols-7 gap-1 md:gap-3 justify-items-center my-4">
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
              defaultChecked={habit.days.includes(d)}
              // disabled
              id={`days-${d}`}
              value={d}
              className="appearance-none cursor-pointer absolute inset-0 rounded-full toggle-checkbox z-[1]"
            />
          </label>
        ))}
      </div>
      <Button type="submit">Update</Button>
    </Form>
  );
}
