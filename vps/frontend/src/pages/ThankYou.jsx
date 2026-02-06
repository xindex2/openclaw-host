import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faRocket, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import Logo from '../components/Logo';

export default function ThankYou() {
    return (
        <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--gradient-hero)', padding: 'var(--spacing-lg)' }}>
            <div className="card-glass text-center" style={{ maxWidth: '600px', width: '100%', padding: 'var(--spacing-2xl)' }}>
                <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <Logo size={60} className="mb-md" />
                </div>

                <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'rgba(52, 211, 153, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto var(--spacing-lg) auto',
                    border: '2px solid var(--color-success)'
                }}>
                    <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: '2.5rem', color: 'var(--color-success)' }} />
                </div>

                <h1 className="text-gradient" style={{ marginBottom: 'var(--spacing-sm)' }}>Thank You for Your Upgrade!</h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', marginBottom: 'var(--spacing-xl)' }}>
                    Your subscription has been successfully updated. You can now create more agents and scale your automation.
                </p>

                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    padding: 'var(--spacing-lg)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--spacing-2xl)',
                    textAlign: 'left',
                    border: '1px solid var(--color-border)'
                }}>
                    <h4 style={{ marginTop: 0, marginBottom: 'var(--spacing-md)' }}>Next Steps:</h4>
                    <ul style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', paddingLeft: 'var(--spacing-lg)' }}>
                        <li style={{ marginBottom: 'var(--spacing-sm)' }}>Go to your dashboard to see your new agent limits.</li>
                        <li style={{ marginBottom: 'var(--spacing-sm)' }}>Create a new agent using the "New Agent" button.</li>
                        <li style={{ marginBottom: '0' }}>Deploy your bots and start automating!</li>
                    </ul>
                </div>

                <div className="flex gap-md" style={{ justifyContent: 'center' }}>
                    <Link to="/dashboard" className="btn btn-primary">
                        <FontAwesomeIcon icon={faRocket} style={{ marginRight: '8px' }} />
                        Go to Dashboard
                    </Link>
                    <Link to="/" className="btn btn-ghost">
                        Back to Home
                    </Link>
                </div>

                <p style={{ marginTop: 'var(--spacing-2xl)', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    If you don't see your changes immediately, please refresh your dashboard or wait a few minutes for the synchronization.
                </p>
            </div>
        </div>
    );
}
