import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-surface-950">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-surface-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
          <span className="text-lg font-bold">DataLens</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 text-sm text-surface-300 hover:text-surface-50 transition">Sign In</Link>
          <Link href="/signup" className="px-5 py-2 text-sm bg-accent hover:bg-accent-dark text-white rounded-lg font-medium transition">Get Started</Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-4">Documentation</h1>
        <p className="text-surface-400 text-lg mb-12">Everything you need to get started with DataLens.</p>

        <div className="space-y-4">
          {[
            { title: "Getting Started", desc: "Create an account, upload your first dataset, and see your first AI insight in under 5 minutes." },
            { title: "Uploading Data", desc: "Supported formats, file size limits, column type detection, and data validation rules." },
            { title: "Using Charts", desc: "How to switch between bar, line, area, and pie charts. Filtering, zooming, and exporting." },
            { title: "AI Insights", desc: "How Gemini analyzes your data, what prompts are used, and how to configure your own API key." },
            { title: "API Reference", desc: "REST API endpoints for authentication, data upload, analytics, and insight generation." },
            { title: "Security & Privacy", desc: "Data isolation, encryption, JWT tokens, rate limiting, and compliance information." },
          ].map((doc) => (
            <div key={doc.title} className="bg-surface-900 border border-surface-800 rounded-xl p-5 hover:border-accent/20 transition cursor-pointer">
              <h3 className="text-base font-semibold mb-1">{doc.title}</h3>
              <p className="text-sm text-surface-400">{doc.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-surface-900 border border-surface-800 rounded-2xl text-center">
          <p className="text-surface-400 mb-4">Full documentation is being written as we build.</p>
          <Link href="/signup" className="px-6 py-2.5 bg-accent hover:bg-accent-dark text-white rounded-xl text-sm font-medium transition">
            Start Using DataLens Now
          </Link>
        </div>
      </div>
    </div>
  );
}