/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bvb-webapp.com",
      },
      {
        protocol: "https",
        hostname: "arweave.net",
      },
    ],
  },
};

export default nextConfig;
