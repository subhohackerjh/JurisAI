/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // Keep Turbopack scoped to this application when parent folders contain lockfiles.
  turbopack: {
    root: process.cwd(),
  },

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
  // images: { remotePatterns: [{ hostname: 'backend.example.com' }] },
}

export default nextConfig
