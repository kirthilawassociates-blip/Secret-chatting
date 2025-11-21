# Build Instructions

This project uses advanced code obfuscation and minification to protect sensitive logic and data.

## Prerequisites

Install Node.js dependencies:

```bash
npm install
```

## Building for Production

Run the build script to create a secure, minified, and obfuscated version:

```bash
npm run build
```

This will:
1. **Obfuscate sensitive strings** (coupon codes, account numbers, UPI IDs)
2. **Minify and obfuscate JavaScript** with multiple passes
3. **Minify CSS** for optimal size
4. **Minify HTML** and update asset references
5. **Remove console statements** and debug code
6. **Apply aggressive code optimization**

## Output

The build process creates a `dist/` directory containing:
- `index.html` - Minified HTML
- `script.min.js` - Obfuscated and minified JavaScript
- `styles.min.css` - Minified CSS

## Security Features

The build process applies multiple layers of security:

### String Obfuscation
- Sensitive strings (coupon codes, account numbers) are encrypted using XOR with rotating keys
- Base36 encoding with variable offsets
- Runtime deobfuscation function (itself obfuscated)

### Code Obfuscation
- Variable name mangling
- Function name obfuscation
- Control flow flattening
- Dead code elimination
- Multiple compression passes
- Inline function optimization

### Protection Applied
- ✅ Coupon code protection
- ✅ Master account number protection
- ✅ UPI ID protection
- ✅ Encryption/decryption logic obfuscation
- ✅ Console statement removal
- ✅ Debug code elimination

## Deployment

Deploy the contents of the `dist/` directory to your hosting service (e.g., Vercel, Netlify).

**Important:** Never commit the `dist/` directory or sensitive build artifacts to version control.

## Development vs Production

- **Development**: Use `index.html`, `script.js`, `styles.css` directly
- **Production**: Always use the minified files from `dist/` directory

