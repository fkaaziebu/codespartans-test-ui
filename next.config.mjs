/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "http://15.45.235:3003",
      },
      {
        protocol: "https",
        hostname: "www.flaticon.com",
      },
      { protocol: "https", hostname: "source.unsplash.com" },

      {
        protocol: "https",
        hostname: "codespartans.s3.eu-north-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "tg61sa9cbd.execute-api.eu-north-1.amazonaws.com",
      },
      { protocol: "https", hostname: "refreshing-harmony-dev.up.railway.app" },
    ],
  },
};

export default nextConfig;
