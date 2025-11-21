# Secret Chat - Encrypt & Decrypt Messages

A beautiful Notion-style web application for encrypting and decrypting messages with randomized encryption keys. Features smart detection that automatically encrypts plain text or decrypts encrypted code.

## Features

- 🔐 **Smart Encryption/Decryption**: Automatically detects whether input is plain text or encrypted code
- 🎨 **Notion-style Design**: Clean, modern UI with smooth animations
- 🌓 **Light/Dark Mode**: Toggle between light and dark themes
- 🔒 **Randomized Encryption**: Each encryption uses a unique random key for maximum security
- ✨ **Unicode Support**: Handles emojis, symbols, and all Unicode characters
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices

## Tech Stack

- HTML5
- CSS3 (with CSS Variables for theming)
- Vanilla JavaScript
- Font Awesome Icons

## Deployment

This project is deployed on Vercel and can be accessed at: [Your Vercel URL]

### Deploy to Vercel

1. **Via Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import the repository: `kirthilawassociates-blip/Secret-chatting`
   - Vercel will automatically detect it's a static site
   - Click "Deploy"

2. **Via Vercel CLI**:
   ```bash
   npm i -g vercel
   vercel
   ```

## Security & Build Process

This project includes advanced code obfuscation and minification to protect sensitive logic and data.

### Building for Production

**Important**: Always use the production build for deployment to protect:
- Encryption/decryption algorithms
- Coupon codes
- Master account numbers
- UPI payment details
- All sensitive business logic

```bash
# Install dependencies
npm install

# Build production version
npm run build
```

This creates a `dist/` directory with:
- **Obfuscated JavaScript**: All sensitive strings encrypted, variable names mangled
- **Minified CSS**: Optimized stylesheet
- **Minified HTML**: Compressed markup

**Security Features Applied:**
- ✅ Multi-layer string obfuscation (XOR + Base36 encoding)
- ✅ Variable and function name mangling
- ✅ Dead code elimination
- ✅ Control flow flattening
- ✅ Console statement removal
- ✅ Multiple compression passes
- ✅ Sensitive data protection

### Local Development

For development, use the source files directly:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx http-server -p 8000
```

Then visit `http://localhost:8000`

**Note**: The source files (`script.js`, `styles.css`, `index.html`) are for development only. Never deploy these directly to production.

## How It Works

1. **Encryption**: 
   - Generates a unique random key for each encryption
   - Converts text to Unicode code points
   - Applies multi-layer XOR encryption
   - Encodes and obfuscates the result

2. **Decryption**:
   - Detects encrypted code format
   - Extracts the embedded key
   - Reverses the encryption process
   - Converts back to original text

## License

MIT License

