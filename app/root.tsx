import { ClerkApp, ClerkErrorBoundary } from '@clerk/remix'
import { rootAuthLoader } from '@clerk/remix/ssr.server'
import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useAsyncError,
  useRouteError
} from '@remix-run/react'
import React, { Suspense } from 'react'
import styles from '~/styles/tailwind.css'
import Navbar from './components/Navbar'
import Trash from './components/icons/Trash'
import BottomNavbar from './components/BottomNavbar'
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

export const loader = (args: LoaderFunctionArgs) => rootAuthLoader(args)

type LayoutProps = {
  children?: React.ReactNode
}

function Layout({ children }: LayoutProps) {
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
      <body className='font-sans pb-24'>
        {/* <Navbar /> */}
        {children}
        <ScrollRestoration />
        {process.env.NODE_ENV === 'development' ? <LiveReload /> : null}
        {RemixDevTools && <Suspense>{/* <RemixDevTools /> */}</Suspense>}
        <BottomNavbar />
        <Scripts />
      </body>
    </html>
  )
}

function App() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

function RootErrorBoundary() {
  const error = useRouteError()
  console.log({ error })

  let message = 'Unknown Error'
  if (isRouteErrorResponse(error)) {
    if (process.env.NODE_ENV === 'development' && error.error) {
      message = error.error.stack || error.error.message
    } else {
      message = error.data
    }
  }

  return (
    <Layout>
      <div className='flex overflow-auto items-center justify-center min-h-screen max-w-md px-4 mx-auto sm:px-7 md:max-w-4xl md:px-6 mb-8'>
        <pre className='font-sans p-4 rounded shadow bg-red-100 text-red-600'>
          {message}
        </pre>
      </div>
    </Layout>
  )
}

export default ClerkApp(App)

export const ErrorBoundary = ClerkErrorBoundary(RootErrorBoundary)
