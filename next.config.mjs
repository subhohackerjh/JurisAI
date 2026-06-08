/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },

  // Allow the backend API host when using next/image with remote images
  // Add your Render backend URL here once deployed
  // images: { remotePatterns: [{ hostname: 'legal24-api.onrender.com' }] },
}

export default nextConfig
