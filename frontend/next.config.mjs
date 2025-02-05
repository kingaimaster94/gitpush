/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "omaxpump.suihub.net",
      },
      {
        protocol: "https",
        hostname: "ipfs.io",
      },
    ],
  },
};

export default nextConfig;
