import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["res.cloudinary.com"],
  },
  // Turbopack is enabled by default in Next.js 16
  // Since cloudinary is only used in server-side code (server actions),
  // we don't need additional webpack/Turbopack configuration
  turbopack: {},
  // Increase body size limit for server actions to allow image uploads

};

export default nextConfig;
