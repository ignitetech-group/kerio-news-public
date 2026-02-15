export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Kerio News Website
        </h1>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              News Feed Pages
            </h2>
            <ul className="space-y-2">
              <li>
                <a
                  href="/newstile/interface/kerioconnect/all"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  KerioConnect & AppManager News (All Platforms)
                </a>
              </li>
              <li>
                <a
                  href="/newstile/interface/kerioconnect/linux"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  KerioConnect & AppManager News (Linux)
                </a>
              </li>
              <li>
                <a
                  href="/newstile/interface/keriocontrol/linux"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  KerioControl & AppManager News
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Tools
            </h2>
            <ul className="space-y-2">
              <li>
                <a
                  href="/scripts/PublicIpHelper"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  IP Helper Tool
                </a>
                <span className="text-gray-600 text-sm ml-2">
                  (Shows your IP address)
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              API Endpoints
            </h2>
            <ul className="space-y-2">
              <li>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  GET /api/redirects
                </code>
                <span className="text-gray-600 text-sm ml-2">
                  - List all redirects
                </span>
              </li>
              <li>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  POST /api/redirects
                </code>
                <span className="text-gray-600 text-sm ml-2">
                  - Create redirect
                </span>
              </li>
            </ul>
          </section>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> Configure database connection in <code className="bg-gray-100 px-1 py-0.5 rounded">.env</code> file to enable redirect management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
