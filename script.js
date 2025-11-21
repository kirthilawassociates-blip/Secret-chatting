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

// Notification System
const notificationContainer = document.getElementById('notificationContainer');

function showNotification(message, type = 'info', duration = 4000) {
    // type can be: 'success', 'error', 'info'
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Set icon based on type
    let iconClass = 'fas fa-info-circle';
    if (type === 'success') {
        iconClass = 'fas fa-check-circle';
    } else if (type === 'error') {
        iconClass = 'fas fa-exclamation-circle';
    }
    
    notification.innerHTML = `
        <i class="${iconClass} notification-icon"></i>
        <div class="notification-content">${message}</div>
        <button class="notification-close" aria-label="Close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Close button handler
    const closeBtn = notification.querySelector('.notification-close');
    const closeNotification = () => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 300);
    };
    
    closeBtn.addEventListener('click', closeNotification);
    
    // Auto-remove after duration
    if (duration > 0) {
        setTimeout(closeNotification, duration);
    }
    
    return notification;
}

// ==================== PRO FEATURES ====================

// User Management (using localStorage)
function getUserData() {
    const userData = localStorage.getItem('secretChatUser');
    return userData ? JSON.parse(userData) : null;
}

function saveUserData(userData) {
    localStorage.setItem('secretChatUser', JSON.stringify(userData));
}

function getCredits() {
    const user = getUserData();
    return user ? user.credits : 0;
}

function deductCredit() {
    const user = getUserData();
    if (user && user.credits > 0) {
        user.credits--;
        saveUserData(user);
        updateCreditsDisplay();
        return true;
    }
    return false;
}

function addCredits(amount) {
    const user = getUserData();
    if (user) {
        user.credits += amount;
        saveUserData(user);
        updateCreditsDisplay();
    }
}

function isProUser() {
    const user = getUserData();
    return user !== null;
}

function updateCreditsDisplay() {
    const creditsDisplay = document.getElementById('creditsDisplay');
    const creditsCount = document.getElementById('creditsCount');
    const user = getUserData();
    
    if (user) {
        creditsDisplay.style.display = 'flex';
        creditsCount.textContent = user.credits;
    } else {
        creditsDisplay.style.display = 'none';
    }
}

// Pro Button Handler
const proBtn = document.getElementById('proBtn');
const pricingModal = document.getElementById('pricingModal');
const paymentModal = document.getElementById('paymentModal');
const authModal = document.getElementById('authModal');
const secretCodeModal = document.getElementById('secretCodeModal');

// Logout function
function logout() {
    localStorage.removeItem('proUser');
    updateCreditsDisplay();
    showNotification('You have been logged out successfully', 'success');
    // Hide secret code option if visible
    const secretCodeOption = document.getElementById('secretCodeOption');
    if (secretCodeOption) {
        secretCodeOption.style.display = 'none';
    }
    // Clear any secret code input
    const secretCodeField = document.getElementById('secretCodeField');
    if (secretCodeField) {
        secretCodeField.value = '';
    }
    const useSecretCode = document.getElementById('useSecretCode');
    if (useSecretCode) {
        useSecretCode.checked = false;
    }
    const secretCodeInput = document.getElementById('secretCodeInput');
    if (secretCodeInput) {
        secretCodeInput.style.display = 'none';
    }
}

proBtn.addEventListener('click', () => {
    if (isProUser()) {
        // Show account info with logout option
        const credits = getCredits();
        const user = getUserData();
        const shouldLogout = confirm(`Account Information:\n\nMobile: ${user.mobile}\nCredits: ${credits}\n\nDo you want to log out?`);
        if (shouldLogout) {
            logout();
        }
    } else {
        pricingModal.style.display = 'flex';
    }
});

// Close modals
document.getElementById('closePricingModal').addEventListener('click', () => {
    pricingModal.style.display = 'none';
});

document.getElementById('closePaymentModal').addEventListener('click', () => {
    paymentModal.style.display = 'none';
});

document.getElementById('closeAuthModal').addEventListener('click', () => {
    authModal.style.display = 'none';
});

document.getElementById('closeSecretCodeModal').addEventListener('click', () => {
    secretCodeModal.style.display = 'none';
});

// Close modals on outside click
[pricingModal, paymentModal, authModal, secretCodeModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Pricing card selection - use event delegation
document.addEventListener('click', (e) => {
    // Check if clicked element is a select-plan button or inside it
    const btn = e.target.closest('.select-plan');
    if (btn) {
        e.preventDefault();
        e.stopPropagation();
        
        const card = btn.closest('.pricing-card');
        if (card) {
            const credits = parseInt(card.dataset.credits);
            const price = parseInt(card.dataset.price);
            
            console.log('Pricing card clicked:', credits, price);
            
            if (credits && price && !isNaN(credits) && !isNaN(price)) {
                pricingModal.style.display = 'none';
                // Small delay to ensure modal closes before opening payment modal
                setTimeout(() => {
                    showPaymentModal(credits, price);
                }, 100);
            } else {
                console.error('Invalid credits or price:', credits, price);
                showNotification('Invalid pricing data', 'error');
            }
        }
    }
});

// Show Payment Modal with QR Code
function showPaymentModal(credits, amount) {
    console.log('showPaymentModal called with:', credits, amount);
    
    const paymentAmount = document.getElementById('paymentAmount');
    if (!paymentAmount) {
        console.error('Payment amount element not found');
        showNotification('Payment modal elements not found', 'error');
        return;
    }
    
    paymentAmount.textContent = amount;
    
    const upiId = 'vikibba1805-3@okaxis';
    const payeeName = 'Vikram';
    const upiUrl = `upi://pay?pa=${upiId}&pn=${payeeName}&am=${amount}&cu=INR`;
    
    console.log('UPI URL:', upiUrl);
    
    // Store selected plan data first
    paymentModal.dataset.credits = credits;
    paymentModal.dataset.amount = amount;
    
    // Show modal first
    paymentModal.style.display = 'flex';
    
    // Wait for modal to be visible and library to be ready
    let retryCount = 0;
    const maxRetries = 15;
    
    const generateQR = () => {
        const qrCanvas = document.getElementById('qrCode');
        if (!qrCanvas) {
            console.error('QR canvas element not found');
            return;
        }
        
        // Check if QRCode library is loaded
        if (typeof QRCode === 'undefined') {
            retryCount++;
            if (retryCount < maxRetries) {
                console.log(`QRCode library not loaded yet, retrying... (${retryCount}/${maxRetries})`);
                setTimeout(generateQR, 200);
                return;
            } else {
                console.error('QRCode library failed to load after multiple retries');
                showNotification('QR code library not loaded. Please refresh the page.', 'error');
                return;
            }
        }
        
        // Check if toCanvas method exists
        if (typeof QRCode.toCanvas !== 'function') {
            console.error('QRCode.toCanvas is not a function. Available methods:', Object.keys(QRCode));
            showNotification('QR code library version mismatch. Please refresh the page.', 'error');
            return;
        }
        
        // Clear canvas
        const ctx = qrCanvas.getContext('2d');
        ctx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);
        
        // Generate QR Code
        try {
            console.log('Generating QR code with URL:', upiUrl);
            // Use QRCode library - standard API
            QRCode.toCanvas(qrCanvas, upiUrl, {
                width: 256,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                },
                errorCorrectionLevel: 'M'
            }, (error) => {
                if (error) {
                    console.error('QR Code generation error:', error);
                    showNotification('Failed to generate QR code. Please use the UPI ID below.', 'error');
                } else {
                    console.log('QR code generated successfully');
                }
            });
        } catch (error) {
            console.error('QR Code generation exception:', error);
            showNotification('Failed to generate QR code. Please use the UPI ID below.', 'error');
        }
    };
    
    // Start generation after modal is visible
    setTimeout(generateQR, 500);
}

// Payment Done Handler
document.getElementById('paymentDoneBtn').addEventListener('click', () => {
    paymentModal.style.display = 'none';
    showAuthModal();
});

// Show Auth Modal
function showAuthModal() {
    const authModalTitle = document.getElementById('authModalTitle');
    const authDescription = document.getElementById('authDescription');
    
    if (isProUser()) {
        authModalTitle.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        authDescription.textContent = 'Enter your mobile number to access your Pro account';
    } else {
        authModalTitle.innerHTML = '<i class="fas fa-user-plus"></i> Sign Up';
        authDescription.textContent = 'Enter your mobile number to create your Pro account';
    }
    
    authModal.style.display = 'flex';
}

// Submit Auth
document.getElementById('submitAuthBtn').addEventListener('click', () => {
    const mobileInput = document.getElementById('mobileInput');
    const mobile = mobileInput.value.trim();
    
    if (!mobile || mobile.length !== 10 || !/^\d+$/.test(mobile)) {
        showNotification('Please enter a valid 10-digit mobile number', 'error');
        return;
    }
    
    const user = getUserData();
    const credits = parseInt(paymentModal.dataset.credits) || 0;
    
    if (user && user.mobile === mobile) {
        // Existing user - add credits
        addCredits(credits);
        showNotification(`Welcome back! ${credits} credits added to your account`, 'success');
    } else {
        // New user - create account
        const newUser = {
            mobile: mobile,
            credits: credits,
            createdAt: new Date().toISOString()
        };
        saveUserData(newUser);
        showNotification(`Account created! ${credits} credits added`, 'success');
    }
    
    authModal.style.display = 'none';
    mobileInput.value = '';
    updateCreditsDisplay();
    
    // Show secret code option if user has credits
    if (getCredits() > 0) {
        document.getElementById('secretCodeOption').style.display = 'block';
    }
});

// Secret Code Option Toggle
const useSecretCodeCheckbox = document.getElementById('useSecretCode');
const secretCodeInput = document.getElementById('secretCodeInput');
const secretCodeField = document.getElementById('secretCodeField');

useSecretCodeCheckbox.addEventListener('change', (e) => {
    if (e.target.checked) {
        if (!isProUser() || getCredits() === 0) {
            e.target.checked = false;
            showNotification('Pro account required. Please upgrade to use secret code encryption.', 'error');
            pricingModal.style.display = 'flex';
            return;
        }
        secretCodeInput.style.display = 'block';
        secretCodeField.focus();
    } else {
        secretCodeInput.style.display = 'none';
        secretCodeField.value = '';
    }
});

// Initialize credits display on load
updateCreditsDisplay();

// Smart Detection: Determine if text is encrypted or plain
function detectTextType(text) {
    if (!text || !text.trim()) {
        return null;
    }
    
    const trimmed = text.trim();
    
    // ONLY rely on actual decryption success - this is the most reliable method
    // If decryption succeeds and returns valid text, it's encrypted
    // Otherwise, it's plain text (even if it contains special characters)
    try {
        const testDecrypt = decryptText(trimmed);
        
        // Check if secret code is required (returns object with requiresSecretCode flag)
        if (testDecrypt && typeof testDecrypt === 'object' && testDecrypt.requiresSecretCode) {
            return 'encrypted'; // It's encrypted but requires secret code
        }
        
        if (testDecrypt && typeof testDecrypt === 'string' && testDecrypt.length > 0 && testDecrypt.trim().length > 0) {
            // Additional validation: decrypted text should be reasonable
            // Check if it contains mostly readable characters (not just random base36)
            const readableChars = testDecrypt.match(/[a-zA-Z\s]/g);
            const readableRatio = readableChars ? readableChars.length / testDecrypt.length : 0;
            
            // If decryption succeeds and result is mostly readable, it's encrypted
            if (readableRatio > 0.3 || testDecrypt.length < 50) {
                return 'encrypted';
            }
        }
    } catch (e) {
        // Decryption failed - definitely plain text
    }
    
    // If we get here, decryption failed or returned invalid result
    // This means it's plain text (even if it contains :, |, etc.)
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
    
    // Show secret code option for Pro users
    if (isProUser() && getCredits() > 0) {
        const textType = detectTextType(text);
        if (textType === 'plain') {
            document.getElementById('secretCodeOption').style.display = 'block';
        } else {
            document.getElementById('secretCodeOption').style.display = 'none';
            useSecretCodeCheckbox.checked = false;
            secretCodeInput.style.display = 'none';
        }
    } else {
        document.getElementById('secretCodeOption').style.display = 'none';
    }
    
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
        showNotification('Please enter a message or encrypted code', 'error');
        return;
    }
    
    const textType = detectTextType(text);
    let result;
    let resultType;
    
    if (textType === 'encrypted') {
        // Decrypt
        result = decryptText(text);
        
        // Check if secret code is required
        if (result && typeof result === 'object' && result.requiresSecretCode) {
            secretCodeModal.style.display = 'flex';
            secretCodeModal.dataset.encryptedCode = text;
            return;
        }
        
        if (!result) {
            showNotification('Failed to decrypt. The code might be invalid or corrupted.', 'error');
            return;
        }
        resultType = 'decrypted';
        outputLabel.textContent = 'Decrypted Message';
        outputType.textContent = 'Decrypted';
        outputType.className = 'output-type decrypted';
        copyBtnIcon.className = 'fas fa-copy';
        copyBtn.title = 'Copy Message';
        showNotification('Message decrypted successfully!', 'success');
    } else {
        // Encrypt
        const useSecretCode = useSecretCodeCheckbox.checked;
        const secretCode = useSecretCode ? secretCodeField.value.trim() : null;
        
        if (useSecretCode && (!secretCode || secretCode.length === 0)) {
            showNotification('Please enter a secret code', 'error');
            return;
        }
        
        if (useSecretCode) {
            // Check credits
            if (!isProUser() || getCredits() === 0) {
                showNotification('Pro account required. Please upgrade to use secret code encryption.', 'error');
                pricingModal.style.display = 'flex';
                return;
            }
            
            // Deduct credit
            if (!deductCredit()) {
                showNotification('Insufficient credits. Please purchase more credits.', 'error');
                pricingModal.style.display = 'flex';
                return;
            }
        }
        
        result = encryptText(text, secretCode);
        if (!result) {
            if (useSecretCode) {
                // Refund credit if encryption failed
                addCredits(1);
            }
            showNotification('Failed to encrypt. Please try again.', 'error');
            return;
        }
        resultType = 'encrypted';
        outputLabel.textContent = 'Encrypted Code';
        outputType.textContent = 'Encrypted';
        outputType.className = 'output-type encrypted';
        copyBtnIcon.className = 'fas fa-copy';
        copyBtn.title = 'Copy Code';
        
        if (useSecretCode) {
            showNotification('Message encrypted with secret code! Credit used.', 'success');
            // Reset secret code option
            useSecretCodeCheckbox.checked = false;
            secretCodeInput.style.display = 'none';
            secretCodeField.value = '';
        } else {
            showNotification('Message encrypted successfully!', 'success');
        }
    }
    
    // Show result
    outputContent.textContent = result;
    outputGroup.style.display = 'block';
}

// Secret Code Decryption Handler
document.getElementById('submitSecretCodeBtn').addEventListener('click', () => {
    const secretCode = document.getElementById('decryptSecretCode').value.trim();
    const encryptedCode = secretCodeModal.dataset.encryptedCode;
    
    if (!secretCode) {
        showNotification('Please enter the secret code', 'error');
        return;
    }
    
    const result = decryptText(encryptedCode, secretCode);
    
    if (!result) {
        showNotification('Invalid secret code or corrupted message', 'error');
        return;
    }
    
    secretCodeModal.style.display = 'none';
    document.getElementById('decryptSecretCode').value = '';
    
    // Show decrypted result
    outputContent.textContent = result;
    outputLabel.textContent = 'Decrypted Message';
    outputType.textContent = 'Decrypted';
    outputType.className = 'output-type decrypted';
    copyBtnIcon.className = 'fas fa-copy';
    copyBtn.title = 'Copy Message';
    outputGroup.style.display = 'block';
    showNotification('Message decrypted successfully!', 'success');
});

// Delete/Clear function
function clearMessage() {
    messageInput.value = '';
    outputGroup.style.display = 'none';
    deleteBtn.style.display = 'none';
    inputStatus.textContent = '';
    inputStatus.className = 'input-status';
    messageInput.focus();
    showNotification('Message cleared', 'info', 2000);
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
        showNotification('Copied to clipboard!', 'success', 2000);
        setTimeout(() => {
            copyBtnIcon.className = originalIcon;
            copyBtn.title = 'Copy';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        showNotification('Failed to copy to clipboard', 'error');
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
function encryptText(text, secretCode = null) {
    if (!text.trim()) {
        return null;
    }
    
    try {
        // Step 1: Generate a unique random key for this encryption
        const key = generateEncryptionKey(Math.floor(Math.random() * 10) + 12); // 12-22 chars
        
        // Step 2: Convert text to code array (handles Unicode, emojis, etc.)
        let textCodes = stringToCodeArray(text);
        
        // Step 2.5: If secret code is provided, encrypt with it first
        if (secretCode && secretCode.trim()) {
            textCodes = xorEncrypt(textCodes, secretCode.trim());
        }
        
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
        // Add flag: 'S' for secret code, 'N' for normal
        const secretFlag = secretCode && secretCode.trim() ? 'S' : 'N';
        const keyChecksum = key.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        const keyLength = key.length;
        const keyLenEncoded = encodeNumber(keyLength).padStart(2, '0');
        const checksumEncoded = encodeNumber(keyChecksum).padStart(3, '0');
        const embedded = `${secretFlag}${keyLenEncoded}${checksumEncoded}${obfuscatedData}${key}`;
        
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
function decryptText(encryptedCode, secretCode = null) {
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
        
        // Step 4: Extract secret flag (first char: 'S' or 'N')
        const secretFlag = withoutPadding[0];
        const hasSecretCode = secretFlag === 'S';
        
        // If secret code is required but not provided, return special flag
        if (hasSecretCode && !secretCode) {
            return { requiresSecretCode: true };
        }
        
        // Step 5: Extract key length (next 2 alphanumeric chars after flag)
        let keyLenStr = '';
        let alphanumericCount = 0;
        for (let k = 1; k < withoutPadding.length && keyLenStr.length < 2; k++) {
            if (/[0-9A-Z]/.test(withoutPadding[k])) {
                keyLenStr += withoutPadding[k];
            }
        }
        
        if (keyLenStr.length < 2) {
            throw new Error('Invalid format');
        }
        
        const keyLength = decodeNumber(keyLenStr);
        
        // Step 6: Extract checksum (next 3 alphanumeric chars after keyLen)
        let checksumStr = '';
        alphanumericCount = 0;
        for (let k = 1; k < withoutPadding.length && checksumStr.length < 3; k++) {
            if (/[0-9A-Z]/.test(withoutPadding[k])) {
                alphanumericCount++;
                if (alphanumericCount > 2) { // After flag (1) + keyLen (2)
                    checksumStr += withoutPadding[k];
                }
            }
        }
        
        if (checksumStr.length < 3) {
            throw new Error('Invalid format');
        }
        
        // Step 7: Extract key from the end (key is at the very end, no obfuscation)
        const key = withoutPadding.substring(withoutPadding.length - keyLength);
        
        // Verify checksum
        const keyChecksum = key.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        const expectedChecksum = decodeNumber(checksumStr);
        if (expectedChecksum !== keyChecksum) {
            throw new Error('Invalid key checksum');
        }
        
        // Step 8: Extract data part (between checksum and key)
        // Format: [flag(1)][keyLen(2)][checksum(3)][data with obfuscation][key]
        // Find where data starts (after 6 chars: 1 flag + 2 keyLen + 3 checksum)
        let dataStartIndex = 0;
        alphanumericCount = 0;
        for (let k = 0; k < withoutPadding.length; k++) {
            if (/[0-9A-Z]/.test(withoutPadding[k])) {
                alphanumericCount++;
                if (alphanumericCount === 6) { // flag + keyLen + checksum
                    dataStartIndex = k + 1;
                    break;
                }
            }
        }
        
        const dataPart = withoutPadding.substring(dataStartIndex, withoutPadding.length - keyLength);
        
        // Step 9: Remove obfuscation from data part only
        const cleaned = removeObfuscation(dataPart);
        
        // Step 10: Convert cleaned data back to number array
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
        
        // Step 11: Decrypt with regular key
        let decryptedCodes = xorDecrypt(encryptedData, key);
        
        // Step 12: If secret code was used, decrypt with secret code
        if (hasSecretCode && secretCode) {
            decryptedCodes = xorDecrypt(decryptedCodes, secretCode.trim());
        }
        
        // Step 13: Convert back to text
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


