import { ClerkApp, V2_ClerkErrorBoundary } from '@clerk/remix/'
import { rootAuthLoader } from '@clerk/remix/ssr.server'
import type { LinksFunction, LoaderArgs } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from '@remix-run/react'
import React, { Suspense } from 'react'
import styles from '~/styles/tailwind.css'
import Navbar from './components/Navbar'
const RemixDevTools =
  process.env.NODE_ENV === 'development'
    ? React.lazy(() => import('remix-development-tools'))
    : undefined
export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  {
    rel: 'manifest',
    href: '/manifest.json'
  },
  {
    rel: 'icon',
    type: 'image/png',
    href: '/images/logo_192x192.png'
  }
]

export const loader = (args: LoaderArgs) => rootAuthLoader(args)

function App() {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta
          name='viewport'
          content='width=device-width,initial-scale=1, maximum-scale=1.0, user-scalable=0'
        />
        <meta name='HandheldFriendly' content='true' />
        <Meta />
        <Links />
      </head>
      <body className='font-sans'>
        <Navbar />
        <Outlet />
        <ScrollRestoration />
        {process.env.NODE_ENV === 'development' ? <LiveReload /> : null}
        {RemixDevTools && (
          <Suspense>
            <RemixDevTools />
          </Suspense>
        )}
        <Scripts />
      </body>
    </html>
  )
}

export default ClerkApp(App)
export const ErrorBoundary = V2_ClerkErrorBoundary()
