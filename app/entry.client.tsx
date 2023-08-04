import { RemixBrowser } from '@remix-run/react'
import { startTransition, StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'

const callback = () =>
  startTransition(() => {
    hydrateRoot(document, <RemixBrowser />)
  })

if (process.env.NODE_ENV === 'development') {
  import('remix-development-tools').then(({ initClient }) => {
    // Add all the dev tools props here into the client
    initClient()
    callback()
  })
} else {
  callback()
}
