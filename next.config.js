/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.shotstack.io'], // Allow Shotstack images
  },
};

module.exports = nextConfig;
