import { AboutSection } from "@/components/Landing/AboutSection"
import { AISection } from "@/components/Landing/AISection"
import { CoreValuesSection } from "@/components/Landing/CoreValuesSection"
import { CTASection } from "@/components/Landing/CTASection"
import { ExploreSection } from "@/components/Landing/ExploreSection"
import { Footer } from "@/components/Landing/Footer"
import { Header } from "@/components/Landing/Header"
import { HeroSection } from "@/components/Landing/HeroSection"
import { HowItWorksSection } from "@/components/Landing/HowItWorksSection"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <ExploreSection />
      <AboutSection />
      <CoreValuesSection />
      <HowItWorksSection />
      <AISection />
      <CTASection />
      <Footer />
    </main>
  )
}
