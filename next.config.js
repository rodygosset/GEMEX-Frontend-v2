/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true
}

module.exports = {
	...nextConfig,
	trailingSlash: true,
	images: {
		domains: ["localhost", "127.0.0.1", "vm-dev-gemex.citepro.cite-sciences.fr", "host.docker.internal", "vm-gemex.citepro.cite-sciences.fr"]
	},
	output: "standalone",
	async rewrites() {
		return {
			fallback: [
				{
					source: "/:path*",
					destination: "/404",
					locale: false
				}
			]
		}
	}
}
