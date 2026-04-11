import { Header } from "@/components/Landing/Header"
import { HeroSection } from "@/components/Landing/HeroSection"
import { AboutSection } from "@/components/Landing/AboutSection"
import { CoreValuesSection } from "@/components/Landing/CoreValuesSection"
import { PlayerSection } from "@/components/Landing/PlayerSection"
import { HowItWorksSection } from "@/components/Landing/HowItWorksSection"
import { AISection } from "@/components/Landing/AISection"
import { CTASection } from "@/components/Landing/CTASection"
import { Footer } from "@/components/Landing/Footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <AboutSection />
      <CoreValuesSection />
      <PlayerSection />
      <HowItWorksSection />
      <AISection />
      <CTASection />
      <Footer />
    </main>
  )
}
