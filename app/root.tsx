import {
  Link,
  Links,
  LinksFunction,
  LiveReload,
  LoaderFunction,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLocation,
  useMatches
} from "remix";
import type { MetaFunction } from "remix";
import tailwind from "./tailwind.css";
import Navbar from "./components/navbar";
import { getUser, getUserId } from "./utils/session.server";
import React, { useEffect } from "react";
import { useTransition } from "remix";
import LoadingIndicator from "./components/LoadingIndicator";
import crypto from "crypto";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: tailwind },
    {
      rel: "stylesheet",
      href: "https://unpkg.com/modern-css-reset@1.4.0/dist/reset.min.css"
    },
    { rel: "apple-touch-icon", href: "/icons/apple-icon-180x180.png" },
    { rel: "icon", type: "image/x-icon", href: "/icons/favicon.ico" }
  ];
};
export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  const emailHash = crypto
    .createHash("md5")
    .update(user?.email || "")
    .digest("hex");
  return {
    user: user,
    gravatarUrl: `https://www.gravatar.com/avatar/${emailHash}`
  };
};
export const meta: MetaFunction = () => {
  return {
    title: "Sorted",
    description: "Sort your habits out by tracking them",
    author: "Sam Johnston",
    keywords: "Habits, Habit Tracker, Sorted, PWA, Sorted Habits"
  };
};
export default function App() {
  let transition = useTransition();
  let location = useLocation();
  let matches = useMatches();

  let isLoading =
    transition.state === "submitting" || transition.state === "loading";

  let isMount = true;
  useEffect(() => {
    let mounted = isMount;
    isMount = false;
    if ("serviceWorker" in navigator) {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller?.postMessage({
          type: "REMIX_NAVIGATION",
          isMount: mounted,
          location,
          matches,
          manifest: window.__remixManifest
        });
      } else {
        let listener = async () => {
          await navigator.serviceWorker.ready;
          navigator.serviceWorker.controller?.postMessage({
            type: "REMIX_NAVIGATION",
            isMount: mounted,
            location,
            matches,
            manifest: window.__remixManifest
          });
        };
        navigator.serviceWorker.addEventListener("controllerchange", listener);
        return () => {
          navigator.serviceWorker.removeEventListener(
            "controllerchange",
            listener
          );
        };
      }
    }
  }, [location]);

  return (
    <Layout>
      {isLoading && <LoadingIndicator />}
      <Outlet />
    </Layout>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width,initial-scale=1' />
        <Meta />
        <Links />
        <link rel='manifest' href='/resources/manifest.json' />
      </head>
      <body className='dark:bg-neutral-700 dark:text-neutral-50 text-neutral-800 bg-neutral-50'>
        <Navbar />
        <main className='container m-auto lg:px-0 px-1'>{children}</main>
        <Scripts /> <LiveReload />
      </body>
    </html>
  );
}

export function CatchBoundary() {
  const { data, status, statusText } = useCatch();
  return (
    <Layout>
      <p>
        {data} <span>{status}</span> <span>{statusText}</span>
      </p>
    </Layout>
  );
}
export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Layout>
      {process.env.NODE_ENV === "production" ? (
        <>
          <p>Something went wrong, please try again later</p>
          <Link to={"/"}>Home</Link>
        </>
      ) : (
        <>
          <pre>{error.stack}</pre>
          <Link to={"/"}>Home</Link>
        </>
      )}
    </Layout>
  );
}
