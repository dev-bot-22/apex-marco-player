import { createFileRoute } from "@tanstack/react-router";
import { createLockedPlayerResponse } from "../lib/playerProxy.server";

export const Route = createFileRoute("/play2.php")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        createLockedPlayerResponse(request, {
          routePath: "/play2.php",
          upstreamOrigin: "https://s2-cdn.studyratna.cc",
          upstreamPath: "/play.php",
        }),
    },
  },
});
