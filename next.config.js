/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@google/generative-ai'],
  images: {
    domains: ['explorer.arc.circle.com'],
  },
};

module.exports = nextConfig;