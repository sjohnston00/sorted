import { ClerkApp } from "@clerk/remix";
import { getAuth, rootAuthLoader } from "@clerk/remix/ssr.server";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";
import React from "react";
import styles from "~/styles/tailwind.css?url";
import BottomNavbar from "./components/BottomNavbar";
import { prisma } from "./db.server";
import {
  getClerkUsersByIDs,
  getUsersFriendRequests,
} from "./utils/index.server";
// const RemixDevTools =
//   process.env.NODE_ENV === "development"
//     ? React.lazy(() => import("remix-development-tools"))
//     : undefined;
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  {
    rel: "manifest",
    href: "/manifest.webmanifest",
  },
  {
    rel: "icon",
    type: "image/png",
    href: "/images/icon.png",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/launch.png",
  },
];

export type RootLoaderData = typeof loader;

export const loader = async (args: LoaderFunctionArgs) => {
  return rootAuthLoader(args, async ({ request }) => {
    const user = await getAuth(args);
    if (!user.userId) {
      return null;
    }
    const friends = await prisma.userFriends.findMany({
      where: {
        OR: [
          {
            friendIdFrom: user.userId,
          },
          {
            friendIdTo: user.userId,
          },
        ],
      },
    });

    const userIDs = new Set([
      ...friends.map((f) => f.friendIdFrom),
      ...friends.map((f) => f.friendIdTo),
    ]);

    const users = await getClerkUsersByIDs([...userIDs]);
    const { myReceivedFriendRequests } = await getUsersFriendRequests(user);

    const userFeatureFlags = await prisma.userFeatureFlag.findMany({
      where: {
        userId: user.userId,
      },
    });

    const userChildrenFeatureFlag =
      await prisma.userChildrenFeatureFlag.findMany({
        where: {
          userId: user.userId,
        },
      });

    return {
      userFeatureFlags,
      userChildrenFeatureFlag,
      myReceivedFriendRequests,
      friends: friends.map((f) => ({
        ...f,
        userFrom: users.find((u) => u.id === f.friendIdFrom),
        userTo: users.find((u) => u.id === f.friendIdTo),
      })),
    };
  });
};

type LayoutProps = {
  children?: React.ReactNode;
};

function Layout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1, maximum-scale=1.0, user-scalable=0"
        />
        <meta name="HandheldFriendly" content="true" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <link
          href="/images/splashscreens/iphone5_splash.png"
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
          rel="apple-touch-startup-image"
        />
        <link
          href="/images/splashscreens/iphone6_splash.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
          rel="apple-touch-startup-image"
        />
        <link
          href="/images/splashscreens/iphoneplus_splash.png"
          media="(device-width: 621px) and (device-height: 1104px) and (-webkit-device-pixel-ratio: 3)"
          rel="apple-touch-startup-image"
        />
        <link
          href="/images/splashscreens/iphonex_splash.png"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
          rel="apple-touch-startup-image"
        />
        <link
          href="/images/splashscreens/iphonexr_splash.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)"
          rel="apple-touch-startup-image"
        />
        <link
          href="/images/splashscreens/iphonexsmax_splash.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)"
          rel="apple-touch-startup-image"
        />
        <link
          href="/images/splashscreens/ipad_splash.png"
          media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)"
          rel="apple-touch-startup-image"
        />
        <link
          href="/images/splashscreens/ipadpro1_splash.png"
          media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)"
          rel="apple-touch-startup-image"
        />
        <link
          href="/images/splashscreens/ipadpro3_splash.png"
          media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)"
          rel="apple-touch-startup-image"
        />
        <link
          href="/images/splashscreens/ipadpro2_splash.png"
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)"
          rel="apple-touch-startup-image"
        />

        <Meta />
        <Links />
      </head>
      <body className="pb-24">
        {/* <Navbar /> */}
        {children}
        <ScrollRestoration />
        {/* {RemixDevTools && (
          <Suspense>
            <RemixDevTools />
          </Suspense>
        )} */}
        <BottomNavbar />
        <Scripts />
      </body>
    </html>
  );
}

function App() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error({ error });

  let message = "Unknown Error";
  if (isRouteErrorResponse(error)) {
    if (process.env.NODE_ENV === "development" && error.error) {
      message = error.error.stack || error.error.message;
    } else {
      message = error.data;
    }
  }

  return (
    <Layout>
      <div className="flex overflow-auto items-center justify-center min-h-screen max-w-md px-4 mx-auto sm:px-7 md:max-w-4xl md:px-6 mb-8">
        <pre className="font-sans p-4 rounded shadow bg-red-100 text-red-600">
          {message}
        </pre>
      </div>
    </Layout>
  );
}

export default ClerkApp(App);
