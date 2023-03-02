/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = {
  ...nextConfig,
  images: {
      domains: [
          "localhost",
          "vm-dev-gemex.citepro.cite-sciences.fr",
          "host.docker.internal"
      ],
  },
  output: 'standalone',
}
