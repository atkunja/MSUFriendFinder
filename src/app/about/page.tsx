'use client'

import Link from 'next/link'

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Grain Overlay */}
            <div className="grain-overlay" />

            {/* Background Gradient */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(24, 69, 59, 0.15) 0%, transparent 70%)',
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
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-2 rounded-full bg-msu-green/10 text-msu-green text-sm font-semibold mb-6">
                        About Us
                    </span>
                    <h1 className="text-display-lg text-foreground mb-6">
                        Built by Spartans, <span className="text-gradient-primary">for Spartans</span>
                    </h1>
                    <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
                        Connecting future Michigan State students to make the transition to college life easier,
                        more exciting, and full of lasting friendships.
                    </p>
                </div>

                {/* Our Story Section */}
                <section className="mb-16">
                    <div className="glass-panel p-8 md:p-10 rounded-2xl">
                        <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-msu-green/10 flex items-center justify-center text-xl">📖</span>
                            Our Story
                        </h2>
                        <div className="space-y-4 text-foreground-muted leading-relaxed">
                            <p>
                                SpartanFinder was born from a simple realization: the months between committing to Michigan State
                                and actually stepping on campus can feel isolating. You've made one of the biggest decisions of
                                your life, but you don't know anyone who's going through the same thing.
                            </p>
                            <p>
                                We're a team of MSU students who experienced this firsthand. We wished we had a way to connect
                                with our future classmates before orientation, find potential roommates who actually share our
                                interests, and build a community before we even arrived in East Lansing.
                            </p>
                            <p>
                                So we built SpartanFinder—a platform designed specifically for incoming Spartans to find their
                                people. Whether you're looking for a roommate, study buddy, or just someone to grab Sparty's
                                with on move-in day, we've got you covered.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="mb-16">
                    <div className="glass-panel p-8 md:p-10 rounded-2xl border-l-4 border-msu-green">
                        <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-msu-green/10 flex items-center justify-center text-xl">🎯</span>
                            Our Mission
                        </h2>
                        <p className="text-lg text-foreground-muted leading-relaxed">
                            To ensure that no incoming Spartan starts their college journey alone. We believe that the
                            friendships you make before you arrive can shape your entire college experience—and we're
                            here to make those connections happen.
                        </p>
                    </div>
                </section>

                {/* Values Grid */}
                <section className="mb-16">
                    <h2 className="text-2xl font-display font-bold text-foreground mb-8 text-center">
                        What We Stand For
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="glass-panel p-6 rounded-xl text-center">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-2xl mx-auto mb-4">
                                🤝
                            </div>
                            <h3 className="font-display font-semibold text-foreground mb-2">Community First</h3>
                            <p className="text-sm text-foreground-muted">
                                We're not just an app—we're building a community of future Spartans who support each other.
                            </p>
                        </div>
                        <div className="glass-panel p-6 rounded-xl text-center">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-2xl mx-auto mb-4">
                                🔒
                            </div>
                            <h3 className="font-display font-semibold text-foreground mb-2">Privacy & Safety</h3>
                            <p className="text-sm text-foreground-muted">
                                Your safety matters. We verify MSU affiliations and give you control over your information.
                            </p>
                        </div>
                        <div className="glass-panel p-6 rounded-xl text-center">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-2xl mx-auto mb-4">
                                💚
                            </div>
                            <h3 className="font-display font-semibold text-foreground mb-2">Spartan Pride</h3>
                            <p className="text-sm text-foreground-muted">
                                We bleed green and white. This platform is made with love for the MSU community.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section className="text-center">
                    <div className="glass-panel p-8 md:p-10 rounded-2xl">
                        <h2 className="text-2xl font-display font-bold text-foreground mb-4">Get In Touch</h2>
                        <p className="text-foreground-muted mb-6">
                            Have questions, feedback, or just want to say hi? We'd love to hear from you.
                        </p>
                        <a
                            href="mailto:hello@spartanfinder.com"
                            className="inline-flex items-center gap-2 text-msu-green font-semibold hover:underline"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            hello@spartanfinder.com
                        </a>
                    </div>
                </section>
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
                            <Link href="/about" className="hover:text-msu-green transition-colors font-medium text-msu-green">
                                About
                            </Link>
                            <Link href="/privacy" className="hover:text-msu-green transition-colors">
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
