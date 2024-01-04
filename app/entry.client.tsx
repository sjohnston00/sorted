import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { loadServiceWorker } from "@remix-pwa/sw";

loadServiceWorker({
  serviceWorkerUrl: "/entry.worker.js",
});

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>
  );
});
