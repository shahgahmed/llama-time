import Link from 'next/link';
import Image from 'next/image';

export default function Navigation() {
  return (
    <nav className="border-b border-gray-800 bg-[#161b22]">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-md flex items-center justify-center">
                <Image
                  src="/images/logos/logo.png"
                  alt="Centaur SRE Logo"
                  width={32}
                  height={32}
                  className="rounded-md"
                />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-100">Centaur SRE</h1>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="text-sm text-gray-300 hover:text-white transition-colors font-medium"
              >
                Integrations
              </Link>
              <Link 
                href="/chat" 
                className="text-sm text-gray-300 hover:text-white transition-colors font-medium"
              >
                Chat
              </Link>
              <Link 
                href="/datadog" 
                className="text-sm text-gray-300 hover:text-white transition-colors font-medium"
              >
                Datadog Monitor
              </Link>
              <Link 
                href="/investigate" 
                className="text-sm text-gray-300 hover:text-white transition-colors font-medium"
              >
                AI Investigation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 