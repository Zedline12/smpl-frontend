import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-40 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 bg-white opacity-90"></div>

        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 text-secondary text-sm font-medium mb-8 animate-fade-in-up shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            New: Auto-Schedule to Instagram & TikTok
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-secondary leading-tight">
            Create Infinite Content.
            <br />
            <span className="text-primary">Schedule in Seconds.</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            The all-in-one AI creative suite that turns your ideas into stunning
            photos and videos, then automatically posts them to your social
            feeds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-white font-semibold text-lg hover:shadow-lg hover:shadow-primary/30 transform hover:-translate-y-1 transition-all duration-200"
            >
              Start Creating for Free
            </Link>
            <Link
              href="#demo"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white border border-gray-200 text-secondary font-semibold text-lg hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-primary"
              >
                <path
                  fillRule="evenodd"
                  d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                  clipRule="evenodd"
                />
              </svg>
              Watch Demo
            </Link>
          </div>

          {/* Hero Image / floating elements */}
          <div className="relative max-w-5xl mx-auto mt-12">
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

            <div className="relative rounded-2xl border border-gray-200 bg-white/50 backdrop-blur-sm p-4 shadow-xl">
              <div className="aspect-video rounded-xl bg-gray-100 overflow-hidden relative group">
                {/* Placeholder for Hero Video/Image - using a gradient for now, normally would include Next.js Image */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                  <span className="text-white/20 text-4xl font-bold">
                    App Interface Preview
                  </span>
                </div>
              </div>

              {/* Floating Cards simulating generation */}
              <div className="absolute -left-8 top-1/4 p-4 bg-white rounded-xl shadow-xl border border-gray-100 animate-float flex items-center gap-3 max-w-xs">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center text-xl">
                  🎨
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">
                    Status
                  </p>
                  <p className="text-sm font-bold text-secondary">
                    Generating 4 variants...
                  </p>
                </div>
              </div>

              <div
                className="absolute -right-8 bottom-1/4 p-4 bg-white rounded-xl shadow-xl border border-gray-100 animate-float flex items-center gap-3 max-w-xs"
                style={{ animationDelay: "1.5s" }}
              >
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-xl">
                  📅
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">
                    Scheduled
                  </p>
                  <p className="text-sm font-bold text-secondary">
                    Posted to Instagram • 10m ago
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-black text-3xl font-bold mb-4">
              Everything you need to go viral
            </h2>
            <p className="text-gray-600">
              Stop juggling five different apps. Create using AI and manage your
              social presence from one single command center.
            </p>
          </div>

          <div className="text-black grid md:grid-cols-3 gap-8">
            {[
              {
                title: "AI Image Generation",
                desc: "Text-to-image, image-to-image, and inpainting. Create exactly what you visualize in seconds.",
                icon: "✨",
              },
              {
                title: "Video Synthesis",
                desc: "Turn your static images into captivating videos or generate scenes from scratch with AI.",
                icon: "🎥",
              },
              {
                title: "Smart Scheduling",
                desc: "Connect your gallery directly to your social calendar. Auto-post at peak engagement times.",
                icon: "⏰",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl bg-white border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-gray-600">
              Start for free, upgrade when you need more power.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="p-8 rounded-2xl border border-gray-200 flex flex-col">
              <h3 className="text-lg font-semibold mb-2">Starter</h3>
              <div className="text-4xl font-bold mb-6">$0</div>
              <ul className="space-y-4 mb-8 flex-1 text-gray-600">
                <li className="flex gap-2">✓ 50 AI generations/mo</li>
                <li className="flex gap-2">✓ 1 Social Account</li>
                <li className="flex gap-2">✓ Basic Editing</li>
              </ul>
              <button className="w-full py-3 rounded-lg border border-gray-200 font-semibold hover:bg-gray-50 transition-colors">
                Get Started
              </button>
            </div>

            {/* Pro */}
            <div className="p-8 rounded-2xl border-2 border-primary bg-primary/5 flex flex-col relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide">
                Most Popular
              </div>
              <h3 className="text-lg font-semibold mb-2 text-primary">
                Pro Creator
              </h3>
              <div className="text-4xl font-bold mb-6">
                $29
                <span className="text-lg text-gray-500 font-normal">/mo</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-gray-600">
                <li className="flex gap-2">✓ Unlimited AI generations</li>
                <li className="flex gap-2">✓ 5 Social Accounts</li>
                <li className="flex gap-2">✓ Priority generation speed</li>
                <li className="flex gap-2">✓ 4K downloads</li>
              </ul>
              <button className="w-full py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                Start Free Trial
              </button>
            </div>

            {/* Agency */}
            <div className="p-8 rounded-2xl border border-gray-200 flex flex-col">
              <h3 className="text-lg font-semibold mb-2">Agency</h3>
              <div className="text-4xl font-bold mb-6">
                $99
                <span className="text-lg text-gray-500 font-normal">/mo</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-gray-600">
                <li className="flex gap-2">✓ Unlimited Everything</li>
                <li className="flex gap-2">✓ Unlimited Accounts</li>
                <li className="flex gap-2">✓ API Access</li>
                <li className="flex gap-2">✓ White-labeling</li>
              </ul>
              <button className="w-full py-3 rounded-lg border border-gray-200 font-semibold hover:bg-gray-50 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-blue-400"></div>
            <span className="font-bold text-lg">SMPL</span>
          </div>
          <div className="text-sm text-gray-500">
            © 2025 SMPL Inc. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-gray-500 hover:text-primary transition-colors"
            >
              Twitter
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-primary transition-colors"
            >
              Instagram
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-primary transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
