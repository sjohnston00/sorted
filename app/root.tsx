import {
  Links,
  LinksFunction,
  LiveReload,
  LoaderFunction,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from "remix";
import type { MetaFunction } from "remix";
import tailwind from "./tailwind.css";
import Navbar from "./components/navbar";
import { getUser, getUserId } from "./utils/session.server";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: tailwind },
    {
      rel: "stylesheet",
      href: "https://unpkg.com/modern-css-reset@1.4.0/dist/reset.min.css"
    }
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  return { user: await getUser(request) };
};

export const meta: MetaFunction = () => {
  return { title: "Test app" };
};

export default function App() {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width,initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        <Navbar />
        <main className='sm:m-1 md:mx-2 lg:mx-4 xl:mx-10'>
          <Outlet />
        </main>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
