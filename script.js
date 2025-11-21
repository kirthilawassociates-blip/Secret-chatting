// Theme Management
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

// Initialize theme from localStorage or default to light
const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);
updateThemeIcon(currentTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    if (theme === 'dark') {
        themeIcon.className = 'fas fa-sun theme-icon';
    } else {
        themeIcon.className = 'fas fa-moon theme-icon';
    }
}

// Smart Detection: Determine if text is encrypted or plain
function detectTextType(text) {
    if (!text || !text.trim()) {
        return null;
    }
    
    const trimmed = text.trim();
    
    // First, try to decrypt - if it succeeds, it's encrypted
    // This is the most reliable method
    try {
        const testDecrypt = decryptText(trimmed);
        if (testDecrypt && testDecrypt.length > 0) {
            return 'encrypted';
        }
    } catch (e) {
        // Decryption failed, continue with pattern detection
    }
    
    // Pattern-based detection as fallback
    // Encrypted code typically has:
    // 1. Contains separators like |, :, ;, ~, !, @, #, $
    // 2. Has base36 encoded numbers at start/end (prefix/suffix lengths)
    // 3. Contains alphanumeric characters with separators
    // 4. Has a specific structure: [base36][separator][data][separator][base36]
    
    const separators = ['|', ':', ';', '~', '!', '@', '#', '$'];
    const hasSeparators = separators.some(sep => trimmed.includes(sep));
    
    // Check for base36 pattern at start and end
    const base36Pattern = /^[0-9A-Z]{1,3}[|:;~!@#$]/;
    const endsWithBase36 = /[|:;~!@#$][0-9A-Z]{1,3}$/;
    
    // Check if it has high ratio of alphanumeric to readable text
    const alphanumericRatio = (trimmed.match(/[0-9A-Za-z]/g) || []).length / trimmed.length;
    
    // If it has separators and base36 patterns, likely encrypted
    if (hasSeparators && (base36Pattern.test(trimmed) || endsWithBase36.test(trimmed))) {
        return 'encrypted';
    }
    
    // If it has high alphanumeric ratio and separators, might be encrypted
    if (hasSeparators && alphanumericRatio > 0.7 && trimmed.length > 20) {
        return 'encrypted';
    }
    
    // Otherwise, assume it's plain text
    return 'plain';
}

// UI Elements
const messageInput = document.getElementById('messageInput');
const processBtn = document.getElementById('processBtn');
const processBtnIcon = document.getElementById('processBtnIcon');
const processBtnText = document.getElementById('processBtnText');
const copyBtn = document.getElementById('copyBtn');
const copyBtnIcon = document.getElementById('copyBtnIcon');
const deleteBtn = document.getElementById('deleteBtn');
const inputStatus = document.getElementById('inputStatus');
const outputGroup = document.getElementById('outputGroup');
const outputContent = document.getElementById('outputContent');
const outputLabel = document.getElementById('outputLabel');
const outputType = document.getElementById('outputType');

// Update UI based on input
function updateUI() {
    const text = messageInput.value.trim();
    
    if (!text) {
        // Empty input
        inputStatus.textContent = '';
        inputStatus.className = 'input-status';
        deleteBtn.style.display = 'none';
        outputGroup.style.display = 'none';
        return;
    }
    
    // Show delete button
    deleteBtn.style.display = 'flex';
    
    // Detect text type
    const textType = detectTextType(text);
    
    if (textType === 'encrypted') {
        inputStatus.innerHTML = '<i class="fas fa-unlock"></i> Detected: Encrypted code - will decrypt';
        inputStatus.className = 'input-status detected-encrypted';
        processBtnIcon.className = 'fas fa-unlock';
        processBtnText.textContent = 'Decrypt';
    } else if (textType === 'plain') {
        inputStatus.innerHTML = '<i class="fas fa-lock"></i> Detected: Plain text - will encrypt';
        inputStatus.className = 'input-status detected-plain';
        processBtnIcon.className = 'fas fa-lock';
        processBtnText.textContent = 'Encrypt';
    } else {
        inputStatus.textContent = '';
        inputStatus.className = 'input-status';
        processBtnIcon.className = 'fas fa-key';
        processBtnText.textContent = 'Process';
    }
}

// Process message (encrypt or decrypt based on detection)
function processMessage() {
    const text = messageInput.value.trim();
    
    if (!text) {
        alert('Please enter a message or encrypted code');
        return;
    }
    
    const textType = detectTextType(text);
    let result;
    let resultType;
    
    if (textType === 'encrypted') {
        // Decrypt
        result = decryptText(text);
        if (!result) {
            alert('Failed to decrypt. The code might be invalid or corrupted.');
            return;
        }
        resultType = 'decrypted';
        outputLabel.textContent = 'Decrypted Message';
        outputType.textContent = 'Decrypted';
        outputType.className = 'output-type decrypted';
        copyBtnIcon.className = 'fas fa-copy';
        copyBtn.title = 'Copy Message';
    } else {
        // Encrypt
        result = encryptText(text);
        if (!result) {
            alert('Failed to encrypt. Please try again.');
            return;
        }
        resultType = 'encrypted';
        outputLabel.textContent = 'Encrypted Code';
        outputType.textContent = 'Encrypted';
        outputType.className = 'output-type encrypted';
        copyBtnIcon.className = 'fas fa-copy';
        copyBtn.title = 'Copy Code';
    }
    
    // Show result
    outputContent.textContent = result;
    outputGroup.style.display = 'block';
}

// Delete/Clear function
function clearMessage() {
    messageInput.value = '';
    outputGroup.style.display = 'none';
    deleteBtn.style.display = 'none';
    inputStatus.textContent = '';
    inputStatus.className = 'input-status';
    messageInput.focus();
}

// Event Listeners
messageInput.addEventListener('input', updateUI);
messageInput.addEventListener('paste', () => {
    // Small delay to let paste complete
    setTimeout(updateUI, 10);
});

processBtn.addEventListener('click', processMessage);

deleteBtn.addEventListener('click', clearMessage);

copyBtn.addEventListener('click', () => {
    const text = outputContent.textContent;
    navigator.clipboard.writeText(text).then(() => {
        const originalIcon = copyBtnIcon.className;
        copyBtnIcon.className = 'fas fa-check';
        copyBtn.title = 'Copied!';
        setTimeout(() => {
            copyBtnIcon.className = originalIcon;
            copyBtn.title = 'Copy';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
    });
});

// Keyboard shortcuts
messageInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        processMessage();
    }
});

// Advanced Encryption with Randomized Keys
// Each encryption uses a unique random key, making reverse engineering extremely difficult

// Generate a random encryption key (different every time)
function generateEncryptionKey(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let key = '';
    for (let i = 0; i < length; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
}

// Convert string to array of character codes (handles Unicode including emojis)
function stringToCodeArray(str) {
    return Array.from(str).map(char => char.codePointAt(0));
}

// Convert array of character codes back to string
function codeArrayToString(arr) {
    // Filter out any invalid values and ensure they're valid Unicode code points
    const validCodePoints = arr.filter(cp => {
        return typeof cp === 'number' && 
               !isNaN(cp) && 
               isFinite(cp) && 
               cp >= 0 && 
               cp <= 0x10FFFF; // Valid Unicode range
    });
    
    // Use apply for large arrays to avoid stack overflow
    if (validCodePoints.length === 0) {
        return '';
    }
    
    try {
        return String.fromCodePoint.apply(null, validCodePoints);
    } catch (e) {
        // Fallback: build string character by character
        let result = '';
        for (let i = 0; i < validCodePoints.length; i++) {
            try {
                result += String.fromCodePoint(validCodePoints[i]);
            } catch (err) {
                // Skip invalid code points
                console.warn('Invalid code point:', validCodePoints[i]);
            }
        }
        return result;
    }
}

// Multi-layer XOR encryption with random key
function xorEncrypt(data, key) {
    const keyCodes = stringToCodeArray(key);
    const encrypted = [];
    
    for (let i = 0; i < data.length; i++) {
        // Use multiple key bytes and add complexity
        const keyIndex = i % keyCodes.length;
        const keyByte = keyCodes[keyIndex];
        const dataByte = data[i];
        
        // Multi-layer XOR with rotation
        // Ensure we work with unsigned 32-bit integers
        let encryptedByte = (dataByte ^ keyByte) >>> 0;
        encryptedByte = (encryptedByte ^ keyCodes[(i + 1) % keyCodes.length]) >>> 0;
        // Use modulo with a value that preserves Unicode range better
        // Unicode max is 0x10FFFF, so we use a value that won't corrupt it
        const positionObfuscation = ((i * 7) % 0x10000) >>> 0;
        encryptedByte = (encryptedByte ^ positionObfuscation) >>> 0;
        
        encrypted.push(encryptedByte);
    }
    
    return encrypted;
}

// Multi-layer XOR decryption
function xorDecrypt(encrypted, key) {
    const keyCodes = stringToCodeArray(key);
    const decrypted = [];
    
    for (let i = 0; i < encrypted.length; i++) {
        const keyIndex = i % keyCodes.length;
        const keyByte = keyCodes[keyIndex];
        let encryptedByte = encrypted[i];
        
        // Reverse the encryption process exactly
        // Ensure we work with unsigned 32-bit integers
        const positionObfuscation = ((i * 7) % 0x10000) >>> 0;
        encryptedByte = (encryptedByte ^ positionObfuscation) >>> 0;
        encryptedByte = (encryptedByte ^ keyCodes[(i + 1) % keyCodes.length]) >>> 0;
        const decryptedByte = (encryptedByte ^ keyByte) >>> 0;
        
        // XOR is reversible, so we should get the original value
        // But ensure it's a valid number (not NaN or Infinity)
        if (isNaN(decryptedByte) || !isFinite(decryptedByte)) {
            throw new Error('Invalid decrypted value');
        }
        
        decrypted.push(decryptedByte);
    }
    
    return decrypted;
}

// Encode numbers to base36
function encodeNumber(num) {
    return num.toString(36).toUpperCase();
}

// Decode from base36
function decodeNumber(str) {
    const parsed = parseInt(str, 36);
    if (isNaN(parsed)) {
        throw new Error('Invalid base36 number');
    }
    return parsed;
}

// Embed key into encrypted data in a non-obvious way
function embedKey(encryptedData, key) {
    // Convert encrypted data to a string with fixed-width encoding
    // Use base36 but pad to fixed width to avoid separator conflicts
    const FIXED_WIDTH = 3; // Each number encoded as 3-character base36
    const dataStr = encryptedData.map(n => {
        const base36 = n.toString(36).toUpperCase();
        // Pad to fixed width
        return base36.padStart(FIXED_WIDTH, '0');
    }).join('');
    
    const keyStr = key;
    
    // Create a checksum from the key
    const keyChecksum = keyStr.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    
    // Embed key length and checksum in the data
    const keyLength = keyStr.length;
    // Format: [keyLength(2 chars)][checksum(3 chars)][data][key]
    const keyLenEncoded = encodeNumber(keyLength).padStart(2, '0');
    const checksumEncoded = encodeNumber(keyChecksum).padStart(3, '0');
    const embedded = `${keyLenEncoded}${checksumEncoded}${dataStr}${keyStr}`;
    
    return embedded;
}

// Extract key from embedded data
function extractKey(embeddedData) {
    const FIXED_WIDTH = 3;
    
    // Extract key length (first 2 characters)
    const keyLengthStr = embeddedData.substring(0, 2);
    const keyLength = decodeNumber(keyLengthStr);
    
    // Extract checksum (next 3 characters)
    const checksumStr = embeddedData.substring(2, 5);
    const expectedChecksum = decodeNumber(checksumStr);
    
    // Extract key from the end
    const key = embeddedData.substring(embeddedData.length - keyLength);
    
    // Verify checksum
    const keyChecksum = key.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    if (expectedChecksum !== keyChecksum) {
        throw new Error('Invalid key checksum');
    }
    
    // Extract encrypted data (between checksum and key)
    const dataStr = embeddedData.substring(5, embeddedData.length - keyLength);
    
    // Convert back to number array (fixed width)
    const encryptedData = [];
    for (let i = 0; i < dataStr.length; i += FIXED_WIDTH) {
        const numStr = dataStr.substring(i, i + FIXED_WIDTH);
        encryptedData.push(parseInt(numStr, 36));
    }
    
    return { encryptedData, key };
}

// Add random obfuscation characters
// IMPORTANT: Only add obfuscation between complete 5-character chunks to preserve structure
function addObfuscation(str) {
    const obfuscationChars = ['-', '_', '.', '~', '!', '@', '#', '$', '%', '^', '&', '*', '+', '=', '|', '\\', '/', '?', '<', '>'];
    let result = '';
    const FIXED_WIDTH = 5;
    const obfuscationRate = Math.floor(Math.random() * 3) + 2; // Every 2-4 chunks
    
    // Process in chunks of FIXED_WIDTH to preserve structure
    for (let i = 0; i < str.length; i += FIXED_WIDTH) {
        const chunk = str.substring(i, i + FIXED_WIDTH);
        if (chunk.length === FIXED_WIDTH) {
            // Add obfuscation before this chunk (except the first one)
            if (i > 0 && (i / FIXED_WIDTH) % obfuscationRate === 0) {
                result += obfuscationChars[Math.floor(Math.random() * obfuscationChars.length)];
            }
            result += chunk;
        } else {
            // Last incomplete chunk - just add it as-is
            result += chunk;
        }
    }
    
    return result;
}

// Remove obfuscation characters
function removeObfuscation(str) {
    // Remove all non-alphanumeric characters except those in base36
    return str.replace(/[^0-9A-Za-z]/g, '');
}

// Main Encryption Function
function encryptText(text) {
    if (!text.trim()) {
        return null;
    }
    
    try {
        // Step 1: Generate a unique random key for this encryption
        const key = generateEncryptionKey(Math.floor(Math.random() * 10) + 12); // 12-22 chars
        
        // Step 2: Convert text to code array (handles Unicode, emojis, etc.)
        const textCodes = stringToCodeArray(text);
        
        // Step 3: Encrypt using XOR with the random key
        const encryptedCodes = xorEncrypt(textCodes, key);
        
        // Step 4: Convert encrypted data to string (data portion only, before embedding key)
        // Use fixed width of 5 characters to handle large Unicode code points (36^5 = 60,466,176)
        // This is more than enough for any Unicode code point after XOR operations
        const FIXED_WIDTH = 5;
        const dataStr = encryptedCodes.map(n => {
            const base36 = n.toString(36).toUpperCase();
            return base36.padStart(FIXED_WIDTH, '0');
        }).join('');
        
        // Step 5: Add obfuscation separators to data only
        const obfuscatedData = addObfuscation(dataStr);
        
        // Step 6: Embed the key (key length, checksum, obfuscated data, key)
        const keyChecksum = key.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        const keyLength = key.length;
        const keyLenEncoded = encodeNumber(keyLength).padStart(2, '0');
        const checksumEncoded = encodeNumber(keyChecksum).padStart(3, '0');
        const embedded = `${keyLenEncoded}${checksumEncoded}${obfuscatedData}${key}`;
        
        // Step 7: Add random padding
        const prefixPadding = generateRandomChars(Math.floor(Math.random() * 5) + 4);
        const suffixPadding = generateRandomChars(Math.floor(Math.random() * 5) + 4);
        
        // Step 8: Combine everything with random structure
        const final = `${prefixPadding}${embedded}${suffixPadding}`;
        
        // Step 9: Encode padding lengths in a non-obvious way
        const prefixLen = prefixPadding.length;
        const suffixLen = suffixPadding.length;
        
        // Create final format: [prefixLen as base36][random separator][data][random separator][suffixLen as base36]
        const separators = ['|', ':', ';', '~', '!', '@', '#', '$'];
        const sep1 = separators[Math.floor(Math.random() * separators.length)];
        const sep2 = separators[Math.floor(Math.random() * separators.length)];
        
        return `${encodeNumber(prefixLen)}${sep1}${final}${sep2}${encodeNumber(suffixLen)}`;
    } catch (error) {
        console.error('Encryption error:', error);
        return null;
    }
}

// Main Decryption Function
function decryptText(encryptedCode) {
    if (!encryptedCode.trim()) {
        return null;
    }
    
    try {
        // Step 1: Extract padding lengths
        const separators = ['|', ':', ';', '~', '!', '@', '#', '$'];
        let prefixLenStr = '';
        let i = 0;
        
        // Extract prefix length
        while (i < encryptedCode.length && /[0-9A-Z]/.test(encryptedCode[i])) {
            prefixLenStr += encryptedCode[i];
            i++;
        }
        
        if (i === 0 || prefixLenStr.length === 0) {
            throw new Error('Invalid format');
        }
        
        const prefixLen = decodeNumber(prefixLenStr);
        const separator1 = encryptedCode[i];
        i++;
        
        // Find the last separator
        let lastSepIndex = -1;
        let suffixLenStr = '';
        for (let j = encryptedCode.length - 1; j >= 0; j--) {
            if (separators.includes(encryptedCode[j])) {
                lastSepIndex = j;
                break;
            }
            suffixLenStr = encryptedCode[j] + suffixLenStr;
        }
        
        if (lastSepIndex === -1) {
            throw new Error('Invalid format');
        }
        
        const suffixLen = decodeNumber(suffixLenStr);
        
        // Step 2: Extract the main data
        const mainData = encryptedCode.substring(i, lastSepIndex);
        
        // Step 3: Remove padding
        const withoutPadding = mainData.substring(prefixLen, mainData.length - suffixLen);
        
        // Step 4: Extract key length (first 2 alphanumeric chars)
        let keyLenStr = '';
        for (let k = 0; k < withoutPadding.length && keyLenStr.length < 2; k++) {
            if (/[0-9A-Z]/.test(withoutPadding[k])) {
                keyLenStr += withoutPadding[k];
            }
        }
        
        if (keyLenStr.length < 2) {
            throw new Error('Invalid format');
        }
        
        const keyLength = decodeNumber(keyLenStr);
        
        // Step 5: Extract checksum (next 3 alphanumeric chars)
        let checksumStr = '';
        let alphanumericCount = 0;
        for (let k = 0; k < withoutPadding.length && checksumStr.length < 3; k++) {
            if (/[0-9A-Z]/.test(withoutPadding[k])) {
                alphanumericCount++;
                if (alphanumericCount > 2) { // After keyLen
                    checksumStr += withoutPadding[k];
                }
            }
        }
        
        if (checksumStr.length < 3) {
            throw new Error('Invalid format');
        }
        
        // Step 6: Extract key from the end (key is at the very end, no obfuscation)
        const key = withoutPadding.substring(withoutPadding.length - keyLength);
        
        // Verify checksum
        const keyChecksum = key.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        const expectedChecksum = decodeNumber(checksumStr);
        if (expectedChecksum !== keyChecksum) {
            throw new Error('Invalid key checksum');
        }
        
        // Step 7: Extract data part (between checksum and key)
        // Format: [keyLen(2)][checksum(3)][data with obfuscation][key]
        // Find where data starts (after 5 alphanumeric chars: 2 for keyLen + 3 for checksum)
        let dataStartIndex = 0;
        alphanumericCount = 0;
        for (let k = 0; k < withoutPadding.length; k++) {
            if (/[0-9A-Z]/.test(withoutPadding[k])) {
                alphanumericCount++;
                if (alphanumericCount === 5) {
                    dataStartIndex = k + 1;
                    break;
                }
            }
        }
        
        const dataPart = withoutPadding.substring(dataStartIndex, withoutPadding.length - keyLength);
        
        // Step 8: Remove obfuscation from data part only
        const cleaned = removeObfuscation(dataPart);
        
        // Step 9: Convert cleaned data back to number array
        // Parse fixed-width base36 numbers (5 characters each)
        const FIXED_WIDTH = 5;
        const encryptedData = [];
        
        // Parse the cleaned data in chunks of FIXED_WIDTH
        for (let i = 0; i < cleaned.length; i += FIXED_WIDTH) {
            const numStr = cleaned.substring(i, i + FIXED_WIDTH);
            if (numStr.length === FIXED_WIDTH) {
                const num = parseInt(numStr, 36);
                if (!isNaN(num) && isFinite(num) && num >= 0) {
                    encryptedData.push(num);
                } else {
                    // If parsing fails, try to continue but log for debugging
                    console.warn('Failed to parse base36 number:', numStr);
                }
            } else if (numStr.length > 0) {
                // Handle incomplete chunk at the end (shouldn't happen, but be safe)
                console.warn('Incomplete chunk at end:', numStr);
            }
        }
        
        // Step 10: Decrypt
        const decryptedCodes = xorDecrypt(encryptedData, key);
        
        // Step 7: Convert back to text
        const decrypted = codeArrayToString(decryptedCodes);
        
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        // Try old format as fallback
        return decryptOldFormat(encryptedCode);
    }
}

// Fallback for old format (backward compatibility)
function decryptOldFormat(encryptedCode) {
    try {
        // Try simple base64 decode
        const cleaned = encryptedCode.replace(/[^A-Za-z0-9+/=]/g, '');
        const decoded = decodeURIComponent(escape(atob(cleaned)));
        return decoded;
    } catch (error) {
        return null;
    }
}

function generateRandomChars(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}


