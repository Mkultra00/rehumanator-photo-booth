import { createFileRoute } from "@tanstack/react-router";
import { Booth } from "@/components/booth/Booth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The ReHumanator — the photo booth that mixes us all" },
      { name: "description", content: "A vintage photo booth that blends faces in real time. The more we mix, the more we see we are all one." },
      { property: "og:title", content: "The ReHumanator" },
      { property: "og:description", content: "A vintage photo booth that blends faces in real time. We are all one." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Booth,
});
