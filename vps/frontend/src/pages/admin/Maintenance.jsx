import { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../../services/api';
import { io } from 'socket.io-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTools, faRocket, faSync, faTerminal, faExclamationTriangle, faCheckCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Maintenance() {
    const [logs, setLogs] = useState([]);
    const [running, setRunning] = useState(false);
    const [action, setAction] = useState(null);
    const logEndRef = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const socket = io('/', {
            auth: { token },
            transports: ['websocket']
        });

        socketRef.current = socket;

        socket.on('maintenance:log', (log) => {
            setLogs(prev => [...prev, { ...log, timestamp: new Date().toLocaleTimeString() }]);
        });

        return () => {
            if (socket) socket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    const handleRebuildBot = async () => {
        if (!confirm('This will rebuild the base OpenClaw bot image. New agents will use this updated image. Continue?')) return;

        setRunning(true);
        setAction('rebuild');
        setLogs(prev => [...prev, { message: 'Initiating rebuild request...', type: 'info', timestamp: new Date().toLocaleTimeString() }]);

        try {
            await adminAPI.rebuildBot();
        } catch (error) {
            setLogs(prev => [...prev, { message: `Request failed: ${error.response?.data?.error || error.message}`, type: 'error', timestamp: new Date().toLocaleTimeString() }]);
            setRunning(false);
            setAction(null);
        }
    };

    const handleUpdateAll = async () => {
        if (!confirm('This will run "openclaw update" in all active containers. Continue?')) return;

        setRunning(true);
        setAction('update');
        setLogs(prev => [...prev, { message: 'Initiating global update request...', type: 'info', timestamp: new Date().toLocaleTimeString() }]);

        try {
            await adminAPI.updateAllAgents();
        } catch (error) {
            setLogs(prev => [...prev, { message: `Request failed: ${error.response?.data?.error || error.message}`, type: 'error', timestamp: new Date().toLocaleTimeString() }]);
            setRunning(false);
            setAction(null);
        }
    };

    const clearLogs = () => setLogs([]);

    const getLogIcon = (type) => {
        switch (type) {
            case 'success': return faCheckCircle;
            case 'error': return faExclamationTriangle;
            case 'build': return faTerminal;
            default: return faInfoCircle;
        }
    };

    const getLogColor = (type) => {
        switch (type) {
            case 'success': return 'var(--color-success)';
            case 'error': return 'var(--color-error)';
            case 'build': return '#9ca3af';
            default: return 'var(--color-primary)';
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex-between mb-xl">
                <div>
                    <h1><FontAwesomeIcon icon={faTools} style={{ marginRight: '12px', color: 'var(--color-primary)' }} /> System Maintenance</h1>
                    <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>Global actions to keep your OpenClaw fleet up to date.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-xl)', marginBottom: 'var(--spacing-2xl)' }}>
                {/* Rebuild Bot Card */}
                <div className="card-glass" style={{ padding: 'var(--spacing-xl)' }}>
                    <div style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: 'var(--spacing-md)' }}>
                        <FontAwesomeIcon icon={faRocket} />
                    </div>
                    <h3>Rebuild Bot Image</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 'var(--spacing-md) 0' }}>
                        Fetches the latest dependencies and rebuilds the <code>openclaw-bot:latest</code> Docker image.
                        <strong> New agents</strong> created after this will use the new version.
                    </p>
                    <button
                        onClick={handleRebuildBot}
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: 'auto' }}
                        disabled={running}
                    >
                        {running && action === 'rebuild' ? <LoadingSpinner size="small" /> : 'Rebuild Image Now'}
                    </button>
                </div>

                {/* Update All Agents Card */}
                <div className="card-glass" style={{ padding: 'var(--spacing-xl)' }}>
                    <div style={{ fontSize: '2rem', color: 'var(--color-secondary)', marginBottom: 'var(--spacing-md)' }}>
                        <FontAwesomeIcon icon={faSync} />
                    </div>
                    <h3>Update Existing Agents</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 'var(--spacing-md) 0' }}>
                        Executes <code>openclaw update</code> in every **currently running** agent.
                        Safe to run while agents are active. Existing data is preserved.
                    </p>
                    <button
                        onClick={handleUpdateAll}
                        className="btn btn-ghost"
                        style={{ width: '100%', border: '1px solid var(--color-secondary)', color: 'var(--color-secondary)', marginTop: 'auto' }}
                        disabled={running}
                    >
                        {running && action === 'update' ? <LoadingSpinner size="small" /> : 'Update All Active Agents'}
                    </button>
                </div>
            </div>

            {/* Log Console */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{
                    padding: 'var(--spacing-md) var(--spacing-xl)',
                    background: 'rgba(255,255,255,0.03)',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h4 style={{ margin: 0 }}><FontAwesomeIcon icon={faTerminal} style={{ marginRight: '8px' }} /> Action Logs</h4>
                    <button onClick={clearLogs} className="btn btn-ghost btn-xs" style={{ fontSize: '0.75rem' }}>Clear Logs</button>
                </div>
                <div style={{
                    height: '400px',
                    overflowY: 'auto',
                    padding: 'var(--spacing-lg)',
                    fontFamily: 'Menlo, Monaco, Consolas, monospace',
                    fontSize: '0.85rem',
                    background: '#0d1117'
                }}>
                    {logs.length === 0 ? (
                        <div style={{ color: '#484f58', textAlign: 'center', paddingTop: '100px' }}>
                            No active logs. Trigger an action above to see progress.
                        </div>
                    ) : (
                        logs.map((log, i) => (
                            <div key={i} style={{
                                marginBottom: '4px',
                                display: 'flex',
                                gap: '10px',
                                borderLeft: `3px solid ${getLogColor(log.type)}`,
                                paddingLeft: '10px'
                            }}>
                                <span style={{ color: '#484f58', minWidth: '80px' }}>[{log.timestamp}]</span>
                                <FontAwesomeIcon icon={getLogIcon(log.type)} style={{ marginTop: '2px', color: getLogColor(log.type), fontSize: '0.8rem' }} />
                                <span style={{ color: log.type === 'error' ? 'var(--color-error)' : '#c9d1d9', whiteSpace: 'pre-wrap' }}>
                                    {log.message}
                                </span>
                            </div>
                        ))
                    )}
                    <div ref={logEndRef} />
                </div>
                {running && (
                    <div style={{
                        padding: 'var(--spacing-sm) var(--spacing-xl)',
                        background: 'rgba(59, 130, 246, 0.1)',
                        color: 'var(--color-primary)',
                        fontSize: '0.8rem',
                        textAlign: 'center'
                    }}>
                        <LoadingSpinner size="small" /> Action in progress... you can leave this page and logs will continue to process.
                    </div>
                )}
            </div>
        </div>
    );
}
