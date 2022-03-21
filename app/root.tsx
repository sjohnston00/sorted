import {
  Links,
  LinksFunction,
  LiveReload,
  LoaderFunction,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useMatches,
} from "remix"
import type { MetaFunction } from "remix"
import tailwind from "./tailwind.css"
import Navbar from "./components/navbar"
import { getUser, getUserId } from "./utils/session.server"
import { useEffect } from "react"
import { useTransition } from "remix"
import LoadingIndicator from "./components/LoadingIndicator"
export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: tailwind },
    {
      rel: "stylesheet",
      href: "https://unpkg.com/modern-css-reset@1.4.0/dist/reset.min.css",
    },
  ]
}
export const loader: LoaderFunction = async ({ request }) => {
  return { user: await getUser(request) }
}
export const meta: MetaFunction = () => {
  return { title: "Test app" }
}
export default function App() {
  let transition = useTransition()
  let location = useLocation()
  let matches = useMatches()

  let isLoading =
    transition.state === "submitting" || transition.state === "loading"

  let isMount = true
  useEffect(() => {
    let mounted = isMount
    isMount = false
    if ("serviceWorker" in navigator) {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller?.postMessage({
          type: "REMIX_NAVIGATION",
          isMount: mounted,
          location,
          matches,
          manifest: window.__remixManifest,
        })
      } else {
        let listener = async () => {
          await navigator.serviceWorker.ready
          navigator.serviceWorker.controller?.postMessage({
            type: "REMIX_NAVIGATION",
            isMount: mounted,
            location,
            matches,
            manifest: window.__remixManifest,
          })
        }
        navigator.serviceWorker.addEventListener("controllerchange", listener)
        return () => {
          navigator.serviceWorker.removeEventListener(
            "controllerchange",
            listener
          )
        }
      }
    }
  }, [location])

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <link rel="manifest" href="/resources/manifest.json" />
      </head>
      <body className="dark:bg-slate-700">
        <Navbar />
        {isLoading && <LoadingIndicator />}
        <main className="sm:m-1 md:mx-2 lg:mx-4 xl:mx-10">
          <Outlet />
        </main>
        <ScrollRestoration /> <Scripts /> <LiveReload />
      </body>
    </html>
  )
}
