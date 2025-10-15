import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import WaitlistForm from '@/components/landing/WaitlistForm';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Waitlist Section */}
      <section id="waitlist" className="py-20 px-4 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <WaitlistForm />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
