import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Which build an error came from (shown in the maintenance app).
  env: {
    NEXT_PUBLIC_BUILD_ID:
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? process.env.NEXT_PUBLIC_BUILD_ID ?? "",
  },
  images: {
    domains: [
      "res.cloudinary.com",
      "royal-violet-313a.smplappteam.workers.dev",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "royal-violet-313a.smplappteam.workers.dev",
        port: "",
        pathname: "/reference-images/images/**",
      },
    ],
  },

  async redirects() {
    return [
      // The explore page is `/` for everyone now (it was /home, and /onboard for guests).
      { source: "/home", destination: "/", permanent: true },
      { source: "/onboard", destination: "/", permanent: true },
      { source: "/subscription-plans", destination: "/pricing", permanent: true },
      // Settings moved under /me; "Credits Usage" is now "Usage".
      { source: "/settings", destination: "/me/settings/account", permanent: true },
      { source: "/settings/credits-usage", destination: "/me/settings/usage", permanent: true },
      { source: "/settings/billing", destination: "/me/settings/subscription", permanent: true },
      { source: "/me/settings/billing", destination: "/me/settings/subscription", permanent: true },
      { source: "/settings/:path*", destination: "/me/settings/:path*", permanent: true },
      // Ads Studio moved from the Create page's image models to its own page.
      {
        source: "/create/image",
        has: [{ type: "query", key: "model", value: "higgsfield-ads-studio" }],
        destination: "/ads-studio",
        permanent: false,
      },
      // Marketing Studio was replaced by Ads Studio (brands moved with it).
      { source: "/marketing-studio/brand-themes/:path*", destination: "/ads-studio/brands/:path*", permanent: true },
      { source: "/marketing-studio/my-creations/:path*", destination: "/ads-studio/media", permanent: true },
      { source: "/marketing-studio/:path*", destination: "/ads-studio", permanent: true },
    ];
  },
};

export default nextConfig;
