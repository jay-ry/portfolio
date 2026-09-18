import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.jayandrade.com" }],
        destination: "https://jayandrade.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
