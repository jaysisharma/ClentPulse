import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async redirects() {
    return [
      {
        source: '/auth/signup',
        destination: '/auth/login?mode=signup',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
