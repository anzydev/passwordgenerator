import { useState, useCallback, useEffect } from 'react';
import { useTime } from './hooks/useTime';
import { generatePassword, calculateStrength } from './utils/passwordGenerator';
import './App.css';

function App() {
    // Password configuration
    const [config, setConfig] = useState({
        length: 14,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true
    });

    // Generated password
    const [password, setPassword] = useState('');
    const [strength, setStrength] = useState({ score: 0, label: 'None', color: '#9ca3af' });

    // UI state
    const [copied, setCopied] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('theme');
        if (saved) return saved === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    // Time
    const { time, date } = useTime();

    // Check if any character type is enabled
    const hasValidConfig = config.uppercase || config.lowercase || config.numbers || config.symbols;

    // Generate password
    const regenerate = useCallback(() => {
        if (!hasValidConfig) {
            setPassword('');
            setStrength({ score: 0, label: 'None', color: '#9ca3af' });
            return;
        }
        const newPassword = generatePassword(config);
        setPassword(newPassword);
        setStrength(calculateStrength(newPassword));
    }, [config, hasValidConfig]);

    // Generate on mount and config change
    useEffect(() => {
        regenerate();
    }, [regenerate]);

    // Apply theme
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    // Copy to clipboard
    const handleCopy = async () => {
        if (!password) return;
        try {
            await navigator.clipboard.writeText(password);
            setCopied(true);
            setShowToast(true);
            setTimeout(() => setCopied(false), 2000);
            setTimeout(() => setShowToast(false), 2500);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Update length
    const updateLength = (delta) => {
        setConfig(prev => ({
            ...prev,
            length: Math.min(32, Math.max(8, prev.length + delta))
        }));
    };

    const handleLengthInput = (e) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value)) {
            setConfig(prev => ({
                ...prev,
                length: Math.min(32, Math.max(8, value))
            }));
        }
    };

    // Toggle character type
    const toggleOption = (key) => {
        setConfig(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="app">
            {/* Theme Toggle */}
            <button
                className="theme-toggle"
                onClick={() => setIsDark(!isDark)}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
                {isDark ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                )}
            </button>

            {/* Time Display (subtle, at top) */}
            <div className="time-display">
                <span className="time">{time}</span>
                <span className="date">{date}</span>
            </div>

            {/* Main Card */}
            <main className="card">
                <h1 className="title">Password Generator</h1>

                {/* Password Display */}
                <div className="password-container">
                    {hasValidConfig ? (
                        <code className="password">{password}</code>
                    ) : (
                        <span className="password-warning">Select at least one character type</span>
                    )}
                    <div className="password-actions">
                        <button
                            className={`btn-icon btn-copy ${copied ? 'copied' : ''}`}
                            onClick={handleCopy}
                            disabled={!hasValidConfig}
                            aria-label="Copy password"
                            title="Copy to clipboard"
                        >
                            {copied ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                            )}
                        </button>
                        <button
                            className="btn-icon btn-regenerate"
                            onClick={regenerate}
                            disabled={!hasValidConfig}
                            aria-label="Regenerate password"
                            title="Generate new password"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Strength Indicator */}
                <div className="strength">
                    <div className="strength-bar">
                        <div
                            className="strength-fill"
                            style={{
                                width: `${strength.score}%`,
                                backgroundColor: strength.color
                            }}
                        />
                    </div>
                    <span className="strength-label" style={{ color: strength.color }}>
                        {strength.label}
                    </span>
                </div>

                {/* Length Control */}
                <div className="control-group">
                    <label className="control-label">Password Length</label>
                    <div className="length-control">
                        <button
                            className="btn-adjust"
                            onClick={() => updateLength(-1)}
                            disabled={config.length <= 8}
                            aria-label="Decrease length"
                        >
                            −
                        </button>
                        <input
                            type="number"
                            className="length-input"
                            value={config.length}
                            onChange={handleLengthInput}
                            min="8"
                            max="32"
                            aria-label="Password length"
                        />
                        <button
                            className="btn-adjust"
                            onClick={() => updateLength(1)}
                            disabled={config.length >= 32}
                            aria-label="Increase length"
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Character Type Toggles */}
                <div className="control-group">
                    <label className="control-label">Character Types</label>
                    <div className="toggles">
                        <button
                            className={`toggle ${config.uppercase ? 'active' : ''}`}
                            onClick={() => toggleOption('uppercase')}
                            aria-pressed={config.uppercase}
                        >
                            <span className="toggle-label">ABC</span>
                            <span className="toggle-desc">Uppercase</span>
                        </button>
                        <button
                            className={`toggle ${config.lowercase ? 'active' : ''}`}
                            onClick={() => toggleOption('lowercase')}
                            aria-pressed={config.lowercase}
                        >
                            <span className="toggle-label">abc</span>
                            <span className="toggle-desc">Lowercase</span>
                        </button>
                        <button
                            className={`toggle ${config.numbers ? 'active' : ''}`}
                            onClick={() => toggleOption('numbers')}
                            aria-pressed={config.numbers}
                        >
                            <span className="toggle-label">123</span>
                            <span className="toggle-desc">Numbers</span>
                        </button>
                        <button
                            className={`toggle ${config.symbols ? 'active' : ''}`}
                            onClick={() => toggleOption('symbols')}
                            aria-pressed={config.symbols}
                        >
                            <span className="toggle-label">@#$</span>
                            <span className="toggle-desc">Symbols</span>
                        </button>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="footer">
                Passwords are generated locally using cryptographic randomness
            </footer>

            {/* Toast */}
            {showToast && (
                <div className="toast">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Password copied
                </div>
            )}
        </div>
    );
}

export default App;
