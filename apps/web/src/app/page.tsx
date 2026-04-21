import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Ticker from "@/components/landing/Ticker";
import Problem from "@/components/landing/Problem";
import HowItWorks from "@/components/landing/HowItWorks";
import SocialProof from "@/components/landing/SocialProof";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
    return (
        <main className="landing-page noise-overlay min-h-screen">
            <Navbar />
            <Hero />
            <Ticker />
            <Problem />
            <HowItWorks />
            <SocialProof />
            <Features />
            <Pricing />
            <FAQ />
            <FinalCTA />
            <Footer />
        </main>
    );
}
