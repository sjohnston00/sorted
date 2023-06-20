import React from 'react'
import { cssBundleHref } from '@remix-run/css-bundle'
import type { LinksFunction, LoaderArgs } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from '@remix-run/react'
import { rootAuthLoader } from '@clerk/remix/ssr.server'
import { ClerkApp, ClerkCatchBoundary } from '@clerk/remix/'
import styles from '~/styles/tailwind.css'

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }]

export const loader = (args: LoaderArgs) => rootAuthLoader(args)

function App() {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width,initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body className='font-sans'>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export default ClerkApp(App)
export const CatchBoundary = ClerkCatchBoundary()
