import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "app.mr-sausages.com",
        port: "",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "thebottlestoredelivery.com",
        port: "",
        pathname: "/**"
      }
    ]
  }
};

export default nextConfig;
