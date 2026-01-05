import Link from "next/link";
import Image from "next/image";

const MarketingNavBar = () => {
  return (
    <nav className="glass-nav fixed top-0 w-full z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="SMPL Logo" width={92} height={42} />
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="#features"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#about"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              About
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm font-medium hover:text-primary transition-colors hidden sm:block"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MarketingNavBar;
