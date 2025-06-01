import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="border-b border-gray-800 bg-[#161b22]">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#238636] rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">L</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-100">Llama Time</h1>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                Chat
              </Link>
              <Link 
                href="/datadog" 
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                Datadog Monitor
              </Link>
              <Link 
                href="/investigate" 
                className="text-sm text-gray-300 hover:text-white transition-colors"
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