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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://legal24.in'),
  title: 'Legal24 | India\'s Unified Legal AI & Advocate Network',
  description: 'Legal24 uses advanced AI to give instant, highly accurate legal advice verified against real Indian court cases. Seamlessly connect with top nearby advocates or land core law student internships.',
  keywords: 'AI legal advice India, find nearby lawyers, hire advocate, AI legal triage, online legal consultation, dynamic case leads, law student internships, legal tech platform, ChatGPT for law',
  authors: [{ name: 'Legal24 Team' }],
  creator: 'Legal24',
  publisher: 'Legal24',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://legal24.in',
    title: 'Legal24 | India\'s Unified Legal AI & Advocate Network',
    description: 'Get verified AI legal advice from court rulings before ever hiring a lawyer. Connect with top Indian advocates dynamically.',
    siteName: 'Legal24',
    images: [{ url: '/image.png', width: 1200, height: 630, alt: 'Legal24' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Legal24 | India\'s Unified Legal AI & Advocate Network',
    description: 'Instantly resolve queries with our AI bot, then match with top-rated nearby advocates.',
    images: ['/image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  icons: {
    icon: '/image.png',
    apple: '/image.png',
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Legal24",
  "operatingSystem": "Web Application, iOS, Android",
  "applicationCategory": "LegalApplication",
  "description": "India's first unified platform connecting citizens with rapid AI legal triage, dynamically matching advocates to case leads, and connecting law students for internships.",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
  "publisher": {
    "@type": "Organization",
    "name": "Legal24",
    "url": "https://legal24.in",
    "logo": "https://legal24.in/image.png",
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
