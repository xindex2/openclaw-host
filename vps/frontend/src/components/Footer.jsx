import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
    return (
        <footer style={{
            padding: '4rem 0',
            background: 'var(--bg-deep)',
            position: 'relative',
            zIndex: 1,
            borderTop: '1px solid var(--color-border)'
        }}>
            <div className="container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 'var(--spacing-2xl)',
                    marginBottom: 'var(--spacing-2xl)'
                }}>
                    <div style={{ gridColumn: 'span 2' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                            <Logo size={32} />
                            <h3 style={{ margin: 0 }}>OpenClaw Host</h3>
                        </div>
                        <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, maxWidth: '400px' }}>
                            The fastest and most reliable way to <strong>deploy OpenClaw</strong> VPS.
                            Dedicated instances for professional AI agent hosting.
                        </p>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Products</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                            <li><Link to="/openclaw-vps" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>OpenClaw VPS</Link></li>
                            <li><Link to="/openclaw-hosting" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>OpenClaw Hosting</Link></li>
                            <li><Link to="/install-openclaw" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Install OpenClaw</Link></li>
                            <li><Link to="/deploy-openclaw" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Deploy OpenClaw</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Company</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                            <li><Link to="/contact" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Contact Us</Link></li>
                            <li><Link to="/tos" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Terms of Service</Link></li>
                            <li><Link to="/privacy" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div style={{
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: 'var(--spacing-xl)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 'var(--spacing-md)',
                    textAlign: 'center'
                }}>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', maxWidth: '800px' }}>
                        <strong>Disclaimer:</strong> OpenClaw Host is an independent hosting provider. We are not officially affiliated with the OpenClaw project.
                        For the official open-source project, please visit <a href="https://openclaw.ai/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--coral-bright)', textDecoration: 'none' }}>openclaw.ai</a>.
                    </p>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        &copy; {new Date().getFullYear()} OpenClaw Host. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
