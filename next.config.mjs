/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.VERCEL ? ".next" : ".next-app",
  reactStrictMode: true,
};

export default nextConfig;
