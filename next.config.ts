import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
      { source: "/subscription-plans", destination: "/pricing", permanent: true },
      // Settings moved under /me; "Credits Usage" is now "Usage".
      { source: "/settings", destination: "/me/settings/account", permanent: true },
      { source: "/settings/credits-usage", destination: "/me/settings/usage", permanent: true },
      { source: "/settings/billing", destination: "/me/settings/subscription", permanent: true },
      { source: "/me/settings/billing", destination: "/me/settings/subscription", permanent: true },
      { source: "/settings/:path*", destination: "/me/settings/:path*", permanent: true },
      // Ads Studio now lives in the Create page's image models.
      {
        source: "/ads-studio",
        destination: "/create/image?model=higgsfield-ads-studio",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
