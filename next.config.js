/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.khidi.or.kr",
        pathname: "/**",
      },
    ],
  },
}

module.exports = nextConfig
