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

  /* config options here */
};

export default nextConfig;
