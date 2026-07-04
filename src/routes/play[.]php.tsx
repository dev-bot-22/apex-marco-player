import { createFileRoute } from "@tanstack/react-router";
import { createLockedPlayerResponse } from "../lib/playerProxy.server";

export const Route = createFileRoute("/play.php")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        createLockedPlayerResponse(request, {
          routePath: "/play.php",
          upstreamOrigin: "https://vidcloud.eu.org",
          upstreamPath: "/play.php",
        }),
    },
  },
});
