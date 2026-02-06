import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { instanceAPI } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faTerminal, faTrash, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from './LoadingSpinner';

export default function InstanceCard({ instance, onRefresh, onDelete }) {
    const [loading, setLoading] = useState(false);
    const [action, setAction] = useState(null);
    const navigate = useNavigate();

    const getStatusBadge = () => {
        const status = instance.containerStatus?.running ? 'running' : instance.status;

        switch (status) {
            case 'running':
                return <span className="badge badge-success"><span className="status-indicator status-running"></span> Running</span>;
            case 'stopped':
                return <span className="badge"><span className="status-indicator status-stopped"></span> Stopped</span>;
            case 'installing':
                return <span className="badge badge-warning">Installing</span>;
            case 'error':
                return <span className="badge badge-error"><span className="status-indicator status-error"></span> Error</span>;
            default:
                return <span className="badge">{status}</span>;
        }
    };

    const handleStart = async () => {
        setLoading(true);
        setAction('starting');
        try {
            await instanceAPI.start(instance.id);
            await onRefresh();
        } catch (error) {
            alert('Failed to start agent');
        } finally {
            setLoading(false);
            setAction(null);
        }
    };

    const handleStop = async () => {
        setLoading(true);
        setAction('stopping');
        try {
            await instanceAPI.stop(instance.id);
            await onRefresh();
        } catch (error) {
            alert('Failed to stop agent');
        } finally {
            setLoading(false);
            setAction(null);
        }
    };

    const isRunning = instance.containerStatus?.running || instance.status === 'running';

    const getPublicUrl = () => {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        // If hostname is an IP, we might need a different logic, but for subdomains:
        return `${protocol}//${instance.subdomain}.${hostname}`;
    };

    return (
        <div className="card">
            <div className="flex-between mb-md" style={{ alignItems: 'flex-start' }}>
                <div>
                    <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: '1.25rem', color: 'var(--color-text)' }}>
                        {instance.subdomain}
                    </div>
                </div>
                {getStatusBadge()}
            </div>

            {/* Instance Info */}
            <div style={{
                background: 'var(--color-bg-elevated)',
                padding: 'var(--spacing-md)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--spacing-lg)',
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', fontSize: '0.875rem' }}>
                    <div>
                        <div style={{ color: 'var(--color-text-muted)' }}>Container ID</div>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', marginTop: '2px' }}>
                            {instance.container_id ? instance.container_id.substring(0, 12) : 'N/A'}
                        </div>
                    </div>
                    <div>
                        <div style={{ color: 'var(--color-text-muted)' }}>Created</div>
                        <div style={{ marginTop: '2px' }}>
                            {new Date(instance.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-sm)' }}>
                {isRunning ? (
                    <>
                        <button
                            onClick={() => navigate(`/terminal/${instance.id}`)}
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                        >
                            <FontAwesomeIcon icon={faTerminal} /> Terminal
                        </button>
                        <button
                            onClick={handleStop}
                            className="btn btn-secondary"
                            disabled={loading}
                            style={{ width: '100%' }}
                        >
                            {action === 'stopping' ? <LoadingSpinner size="small" /> : <><FontAwesomeIcon icon={faPause} /> Stop</>}
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={handleStart}
                            className="btn btn-success"
                            disabled={loading}
                            style={{ width: '100%' }}
                        >
                            {action === 'starting' ? <LoadingSpinner size="small" /> : <><FontAwesomeIcon icon={faPlay} /> Start</>}
                        </button>
                        <button
                            onClick={() => onDelete(instance.id)}
                            className="btn btn-error"
                            style={{ width: '100%' }}
                        >
                            <FontAwesomeIcon icon={faTrash} /> Delete
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
