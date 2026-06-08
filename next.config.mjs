/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output — copies only the required files so the Docker image
  // is ~300 MB instead of 2 GB (no node_modules in the final layer)
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
