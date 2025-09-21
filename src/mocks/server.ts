import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const startMockServer = async () => {
  const worker = setupWorker(...handlers);

  await worker.start({
    onUnhandledRequest: "warn",
    serviceWorker: {
      url: "/mockServiceWorker.js",
    },
  });

  console.log("🚀 Mock Service Worker started");
};
