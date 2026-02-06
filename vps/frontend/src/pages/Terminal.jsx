import { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faRocket, faPlay } from '@fortawesome/free-solid-svg-icons';
import { instanceAPI } from '../services/api';

// xterm.js imports
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

export default function TerminalPage() {
    const { instanceId } = useParams();
    const navigate = useNavigate();

    // Refs
    const terminalRef = useRef(null);
    const xtermRef = useRef(null);
    const socketRef = useRef(null);
    const fitAddonRef = useRef(null);

    // State
    const [status, setStatus] = useState('connecting');
    const [title, setTitle] = useState(`Agent #${instanceId}`);
    const [errorMsg, setErrorMsg] = useState('');

    // Fetch Instance Data
    useEffect(() => {
        instanceAPI.getById(instanceId)
            .then(res => setTitle(res.data.name || `Agent #${instanceId}`))
            .catch(() => { });
    }, [instanceId]);

    // Terminal Initialization
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        // 1. Create Terminal
        const term = new Terminal({
            cursorBlink: true,
            theme: {
                background: '#0d1117',
                foreground: '#c9d1d9',
                cursor: '#58a6ff',
                selectionBackground: 'rgba(88, 166, 255, 0.3)',
                black: '#21262d',
                red: '#ff7b72',
                green: '#3fb950',
                yellow: '#d29922',
                blue: '#58a6ff',
                magenta: '#bc8cff',
                cyan: '#39c5cf',
                white: '#b1bac4'
            },
            fontFamily: '"JetBrains Mono", "Fira Code", "Menlo", monospace',
            fontSize: 14,
            allowProposedApi: true
        });
        xtermRef.current = term;

        // 2. Add Fit Addon
        const fitAddon = new FitAddon();
        fitAddonRef.current = fitAddon;
        term.loadAddon(fitAddon);

        // 3. Connect Socket
        const socket = io('/', {
            auth: { token },
            transports: ['websocket'],
            upgrade: false
        });
        socketRef.current = socket;

        // 4. Mount Terminal
        if (terminalRef.current) {
            term.open(terminalRef.current);
            term.write('\x1b[1;34m>>> Connecting to OpenClaw Instance...\x1b[0m\r\n');

            // Initial fit with safe minimums
            setTimeout(() => {
                try {
                    fitAddon.fit();

                    // CRITICAL FIX: If fit results in tiny width (e.g. 1-5 cols), force 80x24
                    let finalCols = term.cols;
                    let finalRows = term.rows;

                    if (finalCols < 40) {
                        finalCols = 80;
                        term.resize(80, term.rows);
                    }

                    socket.emit('terminal:resize', {
                        cols: finalCols,
                        rows: finalRows
                    });
                } catch (e) {
                    term.resize(80, 24);
                    socket.emit('terminal:resize', { cols: 80, rows: 24 });
                }
            }, 500); // Slightly longer delay for stability
        }

        // 5. Handlers
        term.onData(data => {
            socket.emit('terminal:input', data);
        });

        socket.on('connect', () => {
            socket.emit('terminal:connect', { instanceId });
        });

        socket.on('terminal:ready', () => {
            setStatus('connected');
            term.write('\x1b[1;32m✔ Terminal Ready.\x1b[0m\r\n');
            term.focus();

            // Auto onboard logic
            setTimeout(() => {
                term.write('\x1b[1;34m>>> Auto-starting onboard...\x1b[0m\r\n');
                socket.emit('terminal:input', '\x1bc'); // ANSI Reset
                socket.emit('terminal:input', 'openclaw onboard\n');
            }, 800);
        });

        socket.on('terminal:data', (data) => {
            if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
                term.write(new Uint8Array(data));
            } else {
                term.write(data);
            }
        });

        socket.on('terminal:error', (data) => {
            setStatus('error');
            setErrorMsg(data.message);
            term.write(`\r\n\x1b[1;31m✖ Error: ${data.message}\x1b[0m\r\n`);
        });

        socket.on('disconnect', () => {
            setStatus('disconnected');
            term.write('\r\n\x1b[1;33m⚠ Connection Lost.\x1b[0m\r\n');
        });

        // 6. Resize Handling
        const handleResize = () => {
            if (fitAddonRef.current && xtermRef.current) {
                try {
                    fitAddonRef.current.fit();
                    // Don't emit resize if it's too small (likely a window minimize)
                    if (xtermRef.current.cols > 10) {
                        socket.emit('terminal:resize', {
                            cols: xtermRef.current.cols,
                            rows: xtermRef.current.rows
                        });
                    }
                } catch (e) { }
            }
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            socket.disconnect();
            term.dispose();
            xtermRef.current = null;
        };
    }, [instanceId, navigate]);

    const runCommand = (cmd) => {
        if (socketRef.current) {
            socketRef.current.emit('terminal:input', '\x1bc'); // Clear
            socketRef.current.emit('terminal:input', cmd + '\n');
            xtermRef.current?.focus();
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            background: '#0d1117',
            zIndex: 1000 // High but manageable
        }}>
            {/* Custom Header - Single source of truth */}
            <div style={{
                height: '50px',
                background: '#161b22',
                borderBottom: '1px solid #30363d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
                flexShrink: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', padding: '4px' }}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <span style={{ color: '#e6edf3', fontWeight: 600 }}>{title}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button className="btn btn-primary btn-xs" onClick={() => runCommand('openclaw onboard')}>
                        <FontAwesomeIcon icon={faRocket} className="mr-xs" /> Onboard
                    </button>
                    <button className="btn btn-secondary btn-xs" onClick={() => runCommand('openclaw gateway')}>
                        <FontAwesomeIcon icon={faPlay} className="mr-xs" /> Gateway
                    </button>
                    <div className="badge" style={{
                        fontSize: '0.7rem',
                        background: status === 'connected' ? 'rgba(46, 160, 67, 0.15)' : 'rgba(210, 153, 34, 0.15)',
                        color: status === 'connected' ? '#3fb950' : '#d29922',
                        border: `1px solid ${status === 'connected' ? 'rgba(46, 160, 67, 0.4)' : 'rgba(210, 153, 34, 0.4)'}`
                    }}>
                        {status.toUpperCase()}
                    </div>
                </div>
            </div>

            {/* Error Message Section */}
            {errorMsg && (
                <div style={{
                    padding: '8px 16px',
                    background: 'rgba(248, 81, 73, 0.1)',
                    borderBottom: '1px solid rgba(248, 81, 73, 0.4)',
                    color: '#ff7b72',
                    fontSize: '0.85rem'
                }}>
                    {errorMsg}
                </div>
            )}

            {/* Terminal Viewport */}
            <div style={{
                flex: 1,
                position: 'relative',
                background: '#0d1117',
                padding: '8px' // Some padding for aesthetics
            }}>
                <div
                    ref={terminalRef}
                    style={{ position: 'absolute', inset: '8px' }}
                />
            </div>
        </div>
    );
}
