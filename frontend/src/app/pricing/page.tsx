import Link from "next/link";

export default function PricingPage() {
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
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-surface-400 text-lg mb-16 max-w-xl mx-auto">Start free, upgrade when you need more. No hidden fees.</p>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { name: "Free", price: "$0", period: "forever", features: ["3 datasets", "10 AI insights/month", "Basic charts", "Email support"] },
            { name: "Pro", price: "$29", period: "/month", features: ["Unlimited datasets", "500 AI insights/month", "All chart types", "Priority support", "API key management", "Data export"], popular: true },
            { name: "Enterprise", price: "$99", period: "/month", features: ["Everything in Pro", "Unlimited AI insights", "Team collaboration", "Role-based access", "Scheduled reports", "Dedicated support", "Custom integrations"] },
          ].map((plan) => (
            <div key={plan.name} className={`rounded-2xl p-6 border ${plan.popular ? "border-accent bg-accent/5" : "border-surface-800 bg-surface-900"} text-left`}>
              {plan.popular && <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">Most Popular</span>}
              <h3 className="text-lg font-semibold mt-2">{plan.name}</h3>
              <div className="mt-3 mb-6">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-surface-500 text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-surface-300">
                    <svg className="w-4 h-4 text-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className={`block text-center py-2.5 rounded-xl text-sm font-medium transition ${plan.popular ? "bg-accent hover:bg-accent-dark text-white" : "bg-surface-800 hover:bg-surface-700 text-surface-200"}`}>
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}