import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/context/AuthContext'
import './globals.css'

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: 'JurisAI | AI-Powered Legal Assistance Platform',
  description: 'JurisAI is an AI-Powered Legal Assistance Platform. Get legal guidance, connect with advocates, and explore law student internships.',
  keywords: 'AI legal advice India, find nearby lawyers, hire advocate, AI legal triage, online legal consultation, dynamic case leads, law student internships, legal tech platform, ChatGPT for law',
  authors: [{ name: 'JurisAI Team' }],
  creator: 'JurisAI',
  publisher: 'JurisAI',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    title: 'JurisAI | AI-Powered Legal Assistance Platform',
    description: 'Get verified AI legal advice from court rulings before ever hiring a lawyer. Connect with top Indian advocates dynamically.',
    siteName: 'JurisAI',
    images: [{ url: '/jurisai.jpeg', width: 1200, height: 630, alt: 'JurisAI' }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  icons: {
    icon: '/jurisai-icon.png',
    apple: '/jurisai-icon.png',
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "JurisAI",
  "operatingSystem": "Web Application, iOS, Android",
  "applicationCategory": "LegalApplication",
  "description": "India's first unified platform connecting citizens with rapid AI legal triage, dynamically matching advocates to case leads, and connecting law students for internships.",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
  "publisher": {
    "@type": "Organization",
    "name": "JurisAI",
    "url": process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    "logo": new URL('/jurisai.jpeg', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').toString(),
    "contactPoint": { "@type": "ContactPoint", "telephone": "+91-96632-02292", "contactType": "customer support" }
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${poppins.variable} antialiased`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <AuthProvider>
          {children}
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
