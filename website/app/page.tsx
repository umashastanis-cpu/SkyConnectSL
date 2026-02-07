'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import HowItWorks from '@/components/HowItWorks'
import Destinations from '@/components/Destinations'
import Testimonials from '@/components/Testimonials'
import Partners from '@/components/Partners'
import Download from '@/components/Download'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Destinations />
      <Testimonials />
      <Partners />
      <Download />
      <Footer />
    </main>
  )
}
