import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import StarField from '../../components/StarField';
import Footer from '../../components/Footer';
import Logo from '../../components/Logo';

export default function ToS() {
    useEffect(() => {
        document.title = "Terms of Service - OpenClaw Hosting";
    }, []);

    return (
        <div style={{ background: 'var(--bg-deep)', minHeight: '100vh', color: 'var(--color-text)' }}>
            <StarField />
            <nav className="nav" style={{ position: 'relative', zIndex: 10, borderBottom: '1px solid var(--color-border)' }}>
                <div className="container flex-between" style={{ padding: '1.25rem var(--spacing-lg)' }}>
                    <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <Logo size={32} />
                        <h3 style={{ margin: 0 }}>OpenClaw Host</h3>
                    </Link>
                    <Link to="/login" className="btn btn-ghost">Login</Link>
                </div>
            </nav>

            <div className="container" style={{ position: 'relative', zIndex: 1, padding: '4rem 1rem', maxWidth: '800px' }}>
                <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '2rem' }}>Terms of Service</h1>

                <section style={{ marginBottom: '2rem' }}>
                    <h2>1. Hosting Services Only</h2>
                    <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                        OpenClaw Host provides infrastructure and hosting services for the OpenClaw agent project.
                        We are a hosting provider and are <strong>not affiliated</strong> with the official OpenClaw open-source project.
                        For software-specific issues, please refer to the official documentation at <a href="https://openclaw.ai/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--coral-bright)' }}>openclaw.ai</a>.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2>2. Acceptance of Terms</h2>
                    <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                        By accessing and using OpenClaw Host, you agree to comply with these Terms of Service.
                        You must be at least 13 years old to use our service.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2>3. User Responsibility</h2>
                    <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                        Users are responsible for the content and actions of their agents.
                        Prohibited activities include using the VPS for illegal acts, network attacks, or unauthorized data scraping.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2>4. Limitation of Liability</h2>
                    <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                        OpenClaw Host is provided "as is". We are not liable for any data loss, agent downtime, or damages resulting from the use of our hosting service.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2>5. Termination</h2>
                    <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                        We reserve the right to suspend or terminate accounts that violate these terms or engage in abusive behavior towards our systems.
                    </p>
                </section>
            </div>
            <Footer />
        </div>
    );
}
