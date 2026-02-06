import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import StarField from '../../components/StarField';
import Footer from '../../components/Footer';
import Logo from '../../components/Logo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEarthAmericas, faLayerGroup, faCodeBranch } from '@fortawesome/free-solid-svg-icons';

export default function Deploy() {
    useEffect(() => {
        document.title = "Deploy OpenClaw - Global AI Agent Infrastructure";
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
                    <Link to="/register" className="btn btn-primary">Deploy Now</Link>
                </div>
            </nav>

            <div className="container" style={{ position: 'relative', zIndex: 1, padding: '6rem 1rem' }}>
                <div className="text-center" style={{ maxWidth: '900px', margin: '0 auto var(--spacing-2xl)' }}>
                    <h1 className="text-gradient" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1.5rem' }}>
                        Deploy OpenClaw Globally
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                        The most reliable way to <strong>deploy OpenClaw</strong> at scale.
                        Whether you're running a single bot or a fleet of autonomous agents, our platform is built for deployment.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                    <div className="card-glass" style={{ padding: '2rem' }}>
                        <FontAwesomeIcon icon={faEarthAmericas} style={{ fontSize: '2rem', color: 'var(--coral-bright)', marginBottom: '1rem' }} />
                        <h3>Global Edge Delivery</h3>
                        <p style={{ color: 'var(--color-text-secondary)' }}>Deploy your agents close to your users with our global network of host nodes.</p>
                    </div>
                    <div className="card-glass" style={{ padding: '2rem' }}>
                        <FontAwesomeIcon icon={faLayerGroup} style={{ fontSize: '2rem', color: 'var(--coral-bright)', marginBottom: '1rem' }} />
                        <h3>Docker Isolation</h3>
                        <p style={{ color: 'var(--color-text-secondary)' }}>Every deployment is fully isolated, ensuring maximum uptime and zero cross-instance interference.</p>
                    </div>
                    <div className="card-glass" style={{ padding: '2rem' }}>
                        <FontAwesomeIcon icon={faCodeBranch} style={{ fontSize: '2rem', color: 'var(--coral-bright)', marginBottom: '1rem' }} />
                        <h3>Version Control</h3>
                        <p style={{ color: 'var(--color-text-secondary)' }}>Easily switch between OpenClaw versions and test new agent capabilities in staging environments.</p>
                    </div>
                </div>

                <div className="text-center">
                    <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.25rem' }}>
                        Create Your Deployment
                    </Link>
                </div>
            </div>
            <Footer />
        </div>
    );
}
