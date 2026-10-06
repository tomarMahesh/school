import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/portal", "/api", "/set-password", "/forgot-password"],
      },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
