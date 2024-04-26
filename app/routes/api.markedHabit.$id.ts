import { ActionFunctionArgs } from "@remix-run/node";
import { format, set } from "date-fns";
import { prisma } from "~/db.server";
import { authenticator } from "~/services/auth.server";
import { getUser } from "~/utils/auth.server";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  const markedHabit = await prisma.markedHabit.findUnique({
    where: {
      id: params.id,
    },
    select: {
      date: true,
      userId: true,
    },
  });

  if (!markedHabit) {
    throw new Response("Marked Habit Not Found", {
      status: 404,
    });
  }

  if (markedHabit.userId !== user.id) {
    throw new Response("Unathorized", {
      status: 401,
    });
  }

  const newDate = new Date(
    `${format(markedHabit.date, "yyyy-MM-dd")}T${data.newMarkedHabitTime}`
  );

  await prisma.markedHabit.update({
    data: {
      date: newDate,
      note: data.markedHabitNote?.toString(),
    },
    where: {
      id: params.id,
    },
  });
  return {};
};
