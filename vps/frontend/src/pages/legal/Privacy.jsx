import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import StarField from '../../components/StarField';
import Footer from '../../components/Footer';
import Logo from '../../components/Logo';

export default function Privacy() {
    useEffect(() => {
        document.title = "Privacy Policy - OpenClaw Hosting";
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
                <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '2rem' }}>Privacy Policy</h1>

                <section style={{ marginBottom: '2rem' }}>
                    <h2>1. Data Collection</h2>
                    <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                        We collect minimal information required to provide hosting services: your email address for account management and technical logs for server stability.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2>2. Agent Privacy</h2>
                    <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                        Your agent data and configurations are stored in isolated volumes. We do not inspect the contents of your agent's private directory or monitor its internal activities unless required by law.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2>3. Third-Party Services</h2>
                    <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                        We do not sell your personal data. We only use third-party services for essential infrastructure (e.g., cloud hosting providers) where data is protected under their respective privacy policies.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2>4. Security</h2>
                    <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                        We implement industry-standard security measures to protect your account and your hosted instances, including firewall protection and encrypted sessions.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2>5. Updates</h2>
                    <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                        We may update this privacy policy from time to time. Significant changes will be notified via email or a dashboard alert.
                    </p>
                </section>
            </div>
            <Footer />
        </div>
    );
}
