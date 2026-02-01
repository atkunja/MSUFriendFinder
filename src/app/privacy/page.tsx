'use client'

import Link from 'next/link'

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Grain Overlay */}
            <div className="grain-overlay" />

            {/* Background Gradient */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(24, 69, 59, 0.12) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                    }}
                />
            </div>

            {/* Navigation */}
            <nav className="relative z-20 flex justify-between items-center px-6 md:px-12 py-6 max-w-7xl mx-auto">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-msu-gradient rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-display font-bold text-xl">S</span>
                    </div>
                    <span className="text-2xl font-display font-bold text-gradient-primary tracking-tight hidden sm:block">
                        SpartanFinder
                    </span>
                </Link>

                <div className="flex items-center gap-4 md:gap-6">
                    <Link
                        href="/login"
                        className="text-xs font-semibold uppercase tracking-widest text-foreground-muted hover:text-msu-green transition-colors"
                    >
                        Log In
                    </Link>
                    <Link href="/signup" className="btn-prestige !py-3 !px-6 md:!px-8 text-sm">
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 px-6 md:px-12 py-16 max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="inline-block px-4 py-2 rounded-full bg-msu-green/10 text-msu-green text-sm font-semibold mb-6">
                        Legal
                    </span>
                    <h1 className="text-display-lg text-foreground mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-foreground-muted">
                        Last updated: January 31, 2026
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-8">
                    {/* Introduction */}
                    <section className="glass-panel p-8 rounded-2xl">
                        <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-msu-green/10 flex items-center justify-center text-sm font-mono">1</span>
                            Introduction
                        </h2>
                        <p className="text-foreground-muted leading-relaxed">
                            Welcome to SpartanFinder ("we," "our," or "us"). We are committed to protecting your privacy and
                            ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect,
                            use, disclose, and safeguard your information when you use our website and services.
                        </p>
                    </section>

                    {/* Information We Collect */}
                    <section className="glass-panel p-8 rounded-2xl">
                        <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-msu-green/10 flex items-center justify-center text-sm font-mono">2</span>
                            Information We Collect
                        </h2>
                        <div className="space-y-4 text-foreground-muted leading-relaxed">
                            <p><strong className="text-foreground">Personal Information:</strong> When you create an account, we collect information such as your name, email address, graduation year, major, and any other details you choose to share in your profile.</p>
                            <p><strong className="text-foreground">Profile Content:</strong> This includes photos, bio text, interests, tags, and roommate preferences you add to your profile.</p>
                            <p><strong className="text-foreground">Communications:</strong> Messages you send through our platform, connection requests, and any feedback you provide to us.</p>
                            <p><strong className="text-foreground">Usage Data:</strong> Information about how you interact with our platform, including pages viewed, features used, and time spent on the site.</p>
                            <p><strong className="text-foreground">Device Information:</strong> Browser type, IP address, device type, and operating system for security and optimization purposes.</p>
                        </div>
                    </section>

                    {/* How We Use Your Information */}
                    <section className="glass-panel p-8 rounded-2xl">
                        <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-msu-green/10 flex items-center justify-center text-sm font-mono">3</span>
                            How We Use Your Information
                        </h2>
                        <ul className="space-y-3 text-foreground-muted">
                            <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-msu-green mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>To create and manage your account and profile</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-msu-green mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>To connect you with other Michigan State students</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-msu-green mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>To facilitate roommate matching and friend suggestions</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-msu-green mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>To send important updates about our service</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-msu-green mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>To improve our platform and develop new features</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-msu-green mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>To ensure the security and safety of our community</span>
                            </li>
                        </ul>
                    </section>

                    {/* Information Sharing */}
                    <section className="glass-panel p-8 rounded-2xl">
                        <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-msu-green/10 flex items-center justify-center text-sm font-mono">4</span>
                            Information Sharing
                        </h2>
                        <div className="space-y-4 text-foreground-muted leading-relaxed">
                            <p>
                                We do not sell your personal information to third parties. We may share your information only in the following circumstances:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong className="text-foreground">With Other Users:</strong> Your profile information is visible to other verified MSU students on the platform.</li>
                                <li><strong className="text-foreground">Service Providers:</strong> We work with trusted third parties who help us operate our platform (hosting, analytics, etc.).</li>
                                <li><strong className="text-foreground">Legal Requirements:</strong> When required by law or to protect the safety of our users.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Data Security */}
                    <section className="glass-panel p-8 rounded-2xl border-l-4 border-msu-green">
                        <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-msu-green/10 flex items-center justify-center text-sm font-mono">5</span>
                            Data Security
                        </h2>
                        <p className="text-foreground-muted leading-relaxed">
                            We implement industry-standard security measures to protect your personal information, including
                            encryption, secure servers, and regular security audits. However, no method of transmission over
                            the Internet is 100% secure, and we cannot guarantee absolute security.
                        </p>
                    </section>

                    {/* Your Rights */}
                    <section className="glass-panel p-8 rounded-2xl">
                        <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-msu-green/10 flex items-center justify-center text-sm font-mono">6</span>
                            Your Rights
                        </h2>
                        <p className="text-foreground-muted leading-relaxed mb-4">You have the right to:</p>
                        <ul className="space-y-2 text-foreground-muted">
                            <li>• Access and download your personal data</li>
                            <li>• Update or correct your information</li>
                            <li>• Delete your account and associated data</li>
                            <li>• Opt out of promotional communications</li>
                            <li>• Request information about how your data is used</li>
                        </ul>
                    </section>

                    {/* Contact */}
                    <section className="glass-panel p-8 rounded-2xl">
                        <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-msu-green/10 flex items-center justify-center text-sm font-mono">7</span>
                            Contact Us
                        </h2>
                        <p className="text-foreground-muted leading-relaxed">
                            If you have questions about this Privacy Policy or your personal data, please contact us at{' '}
                            <a href="mailto:privacy@spartanfinder.com" className="text-msu-green hover:underline">
                                privacy@spartanfinder.com
                            </a>
                        </p>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-glass-border py-8 mt-16">
                <div className="max-w-4xl mx-auto px-6 md:px-12">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-msu-gradient rounded-lg flex items-center justify-center">
                                <span className="text-white font-display font-bold text-lg">S</span>
                            </div>
                            <span className="text-lg font-display font-semibold text-gradient-primary">
                                SpartanFinder
                            </span>
                        </div>

                        <div className="flex items-center gap-8 text-sm text-foreground-muted">
                            <Link href="/about" className="hover:text-msu-green transition-colors">
                                About
                            </Link>
                            <Link href="/privacy" className="hover:text-msu-green transition-colors font-medium text-msu-green">
                                Privacy
                            </Link>
                            <Link href="/terms" className="hover:text-msu-green transition-colors">
                                Terms
                            </Link>
                        </div>

                        <p className="text-sm text-foreground-subtle">
                            © {new Date().getFullYear()} SpartanFinder
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
