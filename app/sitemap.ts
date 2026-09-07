import type { MetadataRoute } from "next";

const routes = ["", "/about", "/projects", "/contact", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route, index) => ({
    url: `https://jayandrade.com${route}`,
    lastModified: new Date("2026-09-07"),
    changeFrequency: index === 0 ? "monthly" : "yearly",
    priority: index === 0 ? 1 : route === "/projects" ? 0.9 : 0.7,
  }));
}
