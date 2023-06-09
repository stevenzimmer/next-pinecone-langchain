/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['hnswlib-node'],
  },
}

module.exports = nextConfig
