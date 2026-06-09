/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },

  // pdfkit reads font .afm files from disk at runtime — must not be bundled
  serverExternalPackages: ['pdfkit'],

  // Allow the backend API host when using next/image with remote images
  // Add your Render backend URL here once deployed
  // images: { remotePatterns: [{ hostname: 'legal24-api.onrender.com' }] },
}

export default nextConfig
