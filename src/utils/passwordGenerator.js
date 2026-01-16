/**
 * Cryptographically secure password generator
 * Uses Web Crypto API (crypto.getRandomValues) for true randomness
 */

const CHAR_POOLS = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

/**
 * Get a cryptographically secure random integer
 * Uses crypto.getRandomValues() which provides CSPRNG
 * (Cryptographically Secure Pseudo-Random Number Generator)
 */
function getSecureRandomInt(max) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
}

/**
 * Shuffle array using Fisher-Yates with secure randomness
 */
function secureShuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = getSecureRandomInt(i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Generate a single strong password
 */
export function generatePassword(options = {}) {
    const {
        length = 14,
        uppercase = true,
        lowercase = true,
        numbers = true,
        symbols = true
    } = options;

    // Build character pool based on enabled options
    let pool = '';
    const requiredChars = [];

    if (uppercase) {
        pool += CHAR_POOLS.uppercase;
        requiredChars.push(CHAR_POOLS.uppercase[getSecureRandomInt(CHAR_POOLS.uppercase.length)]);
    }
    if (lowercase) {
        pool += CHAR_POOLS.lowercase;
        requiredChars.push(CHAR_POOLS.lowercase[getSecureRandomInt(CHAR_POOLS.lowercase.length)]);
    }
    if (numbers) {
        pool += CHAR_POOLS.numbers;
        requiredChars.push(CHAR_POOLS.numbers[getSecureRandomInt(CHAR_POOLS.numbers.length)]);
    }
    if (symbols) {
        pool += CHAR_POOLS.symbols;
        requiredChars.push(CHAR_POOLS.symbols[getSecureRandomInt(CHAR_POOLS.symbols.length)]);
    }

    // Return empty if no character types selected
    if (pool === '') {
        return '';
    }

    // Generate remaining characters
    const remainingLength = Math.max(0, length - requiredChars.length);
    const passwordChars = [...requiredChars];

    for (let i = 0; i < remainingLength; i++) {
        const randomIndex = getSecureRandomInt(pool.length);
        passwordChars.push(pool[randomIndex]);
    }

    // Shuffle to randomize position of required characters
    return secureShuffleArray(passwordChars).join('');
}

/**
 * Calculate password strength
 * Returns: { score: 0-100, label: string, color: string }
 */
export function calculateStrength(password) {
    if (!password) {
        return { score: 0, label: 'None', color: '#9ca3af' };
    }

    let score = 0;

    // Length scoring
    if (password.length >= 8) score += 15;
    if (password.length >= 12) score += 15;
    if (password.length >= 16) score += 10;
    if (password.length >= 24) score += 10;

    // Character variety scoring
    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 10;
    if (/[^a-zA-Z0-9]/.test(password)) score += 10;

    // Determine label and color
    let label, color;
    if (score >= 75) {
        label = 'Strong';
        color = '#16a34a'; // green
    } else if (score >= 50) {
        label = 'Medium';
        color = '#ca8a04'; // amber
    } else {
        label = 'Weak';
        color = '#dc2626'; // red
    }

    return { score, label, color };
}
