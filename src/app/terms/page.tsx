'use client'

import Link from 'next/link'

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Grain Overlay */}
            <div className="grain-overlay" />

            {/* Background Gradient */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(24, 69, 59, 0.1) 0%, transparent 70%)',
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
                        Terms of Service
                    </h1>
                    <p className="text-foreground-muted">
                        Last updated: January 31, 2026
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-8">
                    {/* Agreement */}
                    <section className="glass-panel p-8 rounded-2xl">
                        <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-msu-green/10 flex items-center justify-center text-sm font-mono">1</span>
                            Agreement to Terms
                        </h2>
                        <p className="text-foreground-muted leading-relaxed">
                            By accessing or using SpartanFinder, you agree to be bound by these Terms of Service and all
                            applicable laws and regulations. If you do not agree with any of these terms, you are prohibited
                            from using or accessing this site. These Terms of Service apply to all users of the site, including
                            without limitation users who are browsers, vendors, customers, merchants, and/or contributors of content.
                        </p>
                    </section>

                    {/* Eligibility */}
                    <section className="glass-panel p-8 rounded-2xl border-l-4 border-msu-green">
                        <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-msu-green/10 flex items-center justify-center text-sm font-mono">2</span>
                            Eligibility
                        </h2>
                        <div className="space-y-4 text-foreground-muted leading-relaxed">
                            <p>To use SpartanFinder, you must:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Be at least 16 years of age</li>
                                <li>Be a current or incoming Michigan State University student, or have been accepted to MSU</li>
                                <li>Provide accurate and truthful information in your profile</li>
                                <li>Have the legal capacity to enter into a binding agreement</li>
                            </ul>
                            <p>
                                We reserve the right to verify your MSU affiliation and may request proof of enrollment or acceptance.
                            </p>
                        </div>
                    </section>

                    {/* User Accounts */}
                    <section className="glass-panel p-8 rounded-2xl">
                        <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-msu-green/10 flex items-center justify-center text-sm font-mono">3</span>
                            User Accounts
                        </h2>
                        <div className="space-y-4 text-foreground-muted leading-relaxed">
                            <p>When you create an account with us, you must:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Provide accurate, current, and complete information</li>
                                <li>Maintain the security of your password and account</li>
                                <li>Accept responsibility for all activities that occur under your account</li>
                                <li>Immediately notify us of any unauthorized use of your account</li>
                            </ul>
                            <p>
                                You may not use as a username the name of another person or entity, or any name that is
                                misleading or offensive. We reserve the right to refuse service, terminate accounts, or
                                remove content in our sole discretion.
                            </p>
                        </div>
                    </section>

                    {/* Acceptable Use */}
                    <section className="glass-panel p-8 rounded-2xl">
                        <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-msu-green/10 flex items-center justify-center text-sm font-mono">4</span>
                            Acceptable Use Policy
                        </h2>
                        <div className="space-y-4 text-foreground-muted leading-relaxed">
                            <p>You agree NOT to use SpartanFinder to:</p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <span>Harass, bully, intimidate, or threaten other users</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <span>Post false, misleading, or fraudulent content</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <span>Share explicit, violent, or inappropriate content</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <span>Impersonate another person or entity</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <span>Spam, advertise, or solicit other users</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <span>Attempt to hack, exploit, or harm our platform</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Content Ownership */}
                    <section className="glass-panel p-8 rounded-2xl">
                        <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-msu-green/10 flex items-center justify-center text-sm font-mono">5</span>
                            Content Ownership
                        </h2>
                        <div className="space-y-4 text-foreground-muted leading-relaxed">
                            <p>
                                <strong className="text-foreground">Your Content:</strong> You retain ownership of any content you
                                post on SpartanFinder. By posting content, you grant us a non-exclusive, royalty-free license to
                                use, display, and distribute that content on our platform.
                            </p>
                            <p>
                                <strong className="text-foreground">Our Content:</strong> The SpartanFinder name, logo, and all
                                related names, logos, product and service names, designs, and slogans are trademarks of SpartanFinder.
                                You may not use such marks without our prior written permission.
                            </p>
                        </div>
                    </section>

                    {/* Disclaimer */}
                    <section className="glass-panel p-8 rounded-2xl">
                        <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-msu-green/10 flex items-center justify-center text-sm font-mono">6</span>
                            Disclaimer of Warranties
                        </h2>
                        <p className="text-foreground-muted leading-relaxed">
                            SpartanFinder is provided on an "as is" and "as available" basis. We make no warranties, expressed
                            or implied, regarding the operation of our service or the information, content, or materials included
                            thereon. We do not guarantee that connections made through our platform will result in successful
                            roommate matches or friendships. You use the service at your own risk.
                        </p>
                    </section>

                    {/* Limitation of Liability */}
                    <section className="glass-panel p-8 rounded-2xl">
                        <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-msu-green/10 flex items-center justify-center text-sm font-mono">7</span>
                            Limitation of Liability
                        </h2>
                        <p className="text-foreground-muted leading-relaxed">
                            In no event shall SpartanFinder, its directors, employees, partners, agents, suppliers, or affiliates
                            be liable for any indirect, incidental, special, consequential, or punitive damages, including without
                            limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your
                            access to or use of or inability to access or use the service.
                        </p>
                    </section>

                    {/* Changes to Terms */}
                    <section className="glass-panel p-8 rounded-2xl">
                        <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-msu-green/10 flex items-center justify-center text-sm font-mono">8</span>
                            Changes to Terms
                        </h2>
                        <p className="text-foreground-muted leading-relaxed">
                            We reserve the right to modify or replace these Terms at any time. If a revision is material, we will
                            try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a
                            material change will be determined at our sole discretion. By continuing to access or use our service
                            after those revisions become effective, you agree to be bound by the revised terms.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="glass-panel p-8 rounded-2xl">
                        <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-msu-green/10 flex items-center justify-center text-sm font-mono">9</span>
                            Contact Us
                        </h2>
                        <p className="text-foreground-muted leading-relaxed">
                            If you have any questions about these Terms of Service, please contact us at{' '}
                            <a href="mailto:legal@spartanfinder.com" className="text-msu-green hover:underline">
                                legal@spartanfinder.com
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
                            <Link href="/privacy" className="hover:text-msu-green transition-colors">
                                Privacy
                            </Link>
                            <Link href="/terms" className="hover:text-msu-green transition-colors font-medium text-msu-green">
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
