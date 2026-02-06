import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import StarField from '../components/StarField';
import Footer from '../components/Footer';
import Logo from '../components/Logo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

export default function Contact() {
    useEffect(() => {
        document.title = "Contact Us - OpenClaw Hosting Support";
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

            <div className="container" style={{ position: 'relative', zIndex: 1, padding: '6rem 1rem', maxWidth: '800px' }}>
                <div className="text-center mb-2xl">
                    <h1 className="text-gradient" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Get in Touch</h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.2rem' }}>
                        Have questions about our OpenClaw VPS or Hosting solutions? We're here to help.
                    </p>
                </div>

                <div className="card-glass" style={{ padding: '3rem', borderRadius: 'var(--radius-xl)', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ maxWidth: '400px', width: '100%' }}>
                        <h3 style={{ marginBottom: '2rem', textAlign: 'center' }}>Support Channels</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '50px', height: '50px', background: 'rgba(255,107,107,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FontAwesomeIcon icon={faEnvelope} style={{ color: 'var(--coral-bright)', fontSize: '1.2rem' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Email us at</div>
                                    <a href="mailto:support@openclaw-host.com" style={{ fontWeight: 'bold', color: 'inherit', textDecoration: 'none', wordBreak: 'break-all' }}>support@openclaw-host.com</a>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '50px', height: '50px', background: 'rgba(255,107,107,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: 'var(--coral-bright)', fontSize: '1.2rem' }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Headquarters</div>
                                    <div style={{ fontWeight: 'bold' }}>Global (Remote Hosting Infrastructure)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <p>Looking for the official project? Visit <a href="https://openclaw.ai/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--coral-bright)', textDecoration: 'none' }}>openclaw.ai</a></p>
                </div>
            </div>
            <Footer />
        </div>
    );
}
