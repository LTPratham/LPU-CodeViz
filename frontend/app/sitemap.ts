import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://codecanvas-lpu.vercel.app"; // Fallback URL or environment variable

  const routes = [
    "",
    "/login",
    "/visualize",
    "/about",
    "/terms",
    "/privacy",
    "/refund-policy",
    "/payment",
    "/integrations",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));
}
