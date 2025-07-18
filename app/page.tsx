import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            AI Customer Intelligence Platform
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Automated content generation and competitive intelligence platform that helps you stay ahead of the competition.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                href="/changelog"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                View Changelog
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Link
                href="/dashboard"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="text-3xl">🤖</div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">AI-Powered Content</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Automatically generate product announcements, changelogs, and marketing content.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="text-3xl">📊</div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Real-time Analytics</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Track content performance and engagement metrics in real-time.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="text-3xl">🔗</div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Seamless Integration</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Connect with your existing tools and workflows effortlessly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
