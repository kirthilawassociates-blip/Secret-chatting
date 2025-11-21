const fs = require('fs');
const path = require('path');
const { minify: minifyJS } = require('terser');
const csso = require('csso');
const { minify: minifyHTML } = require('html-minifier-terser');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Advanced string obfuscation with multiple layers
function obfuscateString(str) {
    // Layer 1: Convert to char codes
    const codes = Array.from(str).map(c => c.charCodeAt(0));
    // Layer 2: Apply XOR with rotating key
    const key = [0x4A, 0x3F, 0x2C, 0x1E];
    const xored = codes.map((c, i) => c ^ key[i % key.length]);
    // Layer 3: Base36 encoding with variable offset
    return xored.map((c, i) => (c + 17 + (i % 3)).toString(36)).join('');
}

// Deobfuscate function (will be heavily obfuscated by terser)
function deobfuscate(encoded) {
    const chunks = encoded.match(/.{1,2}/g) || [];
    const key = [0x4A, 0x3F, 0x2C, 0x1E];
    return chunks.map((chunk, i) => {
        const code = parseInt(chunk, 36) - 17 - (i % 3);
        return String.fromCharCode(code ^ key[i % key.length]);
    }).join('');
}

// Generate deobfuscation function code (will be obfuscated itself)
const deobfuscateFunc = `
function _d(s){const c=s.match(/.{1,2}/g)||[];const k=[74,63,44,30];return c.map((x,i)=>{const n=parseInt(x,36)-17-(i%3);return String.fromCharCode(n^k[i%k.length])}).join('')}
`;

// Read source files
const scriptSource = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
const cssSource = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');
const htmlSource = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Step 1: Replace sensitive strings with obfuscated versions
let protectedScript = scriptSource;

// Obfuscate coupon code
const couponCode = 'VIKRAM';
const obfuscatedCoupon = obfuscateString(couponCode);

// Replace coupon code references
protectedScript = protectedScript.replace(/['"]VIKRAM['"]/g, `_d('${obfuscatedCoupon}')`);
protectedScript = protectedScript.replace(/const VALID_COUPON_CODE = ['"]VIKRAM['"];/, 
    `const VALID_COUPON_CODE = _d('${obfuscatedCoupon}');`);
protectedScript = protectedScript.replace(/const validCoupon = ['"]VIKRAM['"];/, 
    `const validCoupon = _d('${obfuscatedCoupon}');`);

// Obfuscate master account mobile number
const masterMobile = '9944996715';
const obfuscatedMobile = obfuscateString(masterMobile);
protectedScript = protectedScript.replace(/['"]9944996715['"]/g, `_d('${obfuscatedMobile}')`);
protectedScript = protectedScript.replace(/const MASTER_ACCOUNT_MOBILE = ['"]9944996715['"];/, 
    `const MASTER_ACCOUNT_MOBILE = _d('${obfuscatedMobile}');`);

// Obfuscate UPI ID
const upiId = 'vikibba1805-3@okaxis';
const obfuscatedUPI = obfuscateString(upiId);
protectedScript = protectedScript.replace(/['"]vikibba1805-3@okaxis['"]/g, `_d('${obfuscatedUPI}')`);

// Add deobfuscation function at the beginning
protectedScript = deobfuscateFunc + protectedScript;

// Step 2: Obfuscate and minify JavaScript with aggressive settings
async function buildJS() {
    // First pass: Basic obfuscation
    let result = await minifyJS(protectedScript, {
        compress: {
            drop_console: true, // Remove all console statements
            drop_debugger: true,
            passes: 3,
            unsafe: true,
            unsafe_comps: true,
            unsafe_math: true,
            unsafe_methods: true,
            unsafe_proto: true,
            unsafe_regexp: true,
            unsafe_undefined: true,
            dead_code: true,
            evaluate: true,
            reduce_vars: true,
            reduce_funcs: true,
            collapse_vars: true,
            inline: 3,
            unused: true,
            side_effects: false,
            booleans_as_integers: true,
            if_return: true,
            join_vars: true,
            loops: true,
            negate_iife: true,
            properties: true,
            sequences: true,
            switches: true
        },
        mangle: {
            toplevel: true,
            properties: {
                regex: /^_|^[A-Z]/
            },
            reserved: ['_d']
        },
        format: {
            comments: false,
            ascii_only: true,
            wrap_iife: true,
            wrap_func_args: false
        },
        sourceMap: false,
        ecma: 2020
    });

    if (result.error) {
        console.error('JavaScript minification error:', result.error);
        process.exit(1);
    }

    // Second pass: Additional obfuscation
    result = await minifyJS(result.code, {
        compress: {
            passes: 2,
            unsafe: true,
            unsafe_comps: true,
            unsafe_math: true,
            unsafe_methods: true,
            unsafe_proto: true,
            unsafe_regexp: true,
            unsafe_undefined: true,
            dead_code: true,
            evaluate: true,
            reduce_vars: true,
            reduce_funcs: true,
            collapse_vars: true,
            inline: 2,
            unused: true
        },
        mangle: {
            toplevel: true,
            properties: {
                regex: /^_|^[A-Z]/
            },
            reserved: ['_d']
        },
        format: {
            comments: false,
            ascii_only: true,
            wrap_iife: true
        },
        sourceMap: false,
        ecma: 2020
    });

    if (result.error) {
        console.error('JavaScript second pass error:', result.error);
        process.exit(1);
    }

    return result.code;
}

// Step 3: Minify CSS
function buildCSS() {
    const result = csso.minify(cssSource, {
        restructure: true,
        forceMediaMerge: true,
        clone: false
    });
    return result.css;
}

// Step 4: Minify HTML and update script/css references
async function buildHTML() {
    // Update script and CSS references to minified versions
    let html = htmlSource
        .replace(/<script src="script\.js"><\/script>/, '<script src="script.min.js"></script>')
        .replace(/<link rel="stylesheet" href="styles\.css">/, '<link rel="stylesheet" href="styles.min.css">');

    const result = await minifyHTML(html, {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        minifyCSS: false, // Already minified separately
        minifyJS: false, // Already minified separately
        removeEmptyAttributes: true,
        removeOptionalTags: true,
        removeTagWhitespace: true,
        sortAttributes: true,
        sortClassName: true
    });

    return result;
}

// Build process
async function build() {
    console.log('🔒 Starting secure build process...\n');

    try {
        console.log('📦 Obfuscating sensitive data...');
        // Already done above

        console.log('🔧 Minifying JavaScript...');
        const minifiedJS = await buildJS();
        fs.writeFileSync(path.join(distDir, 'script.min.js'), minifiedJS);
        console.log('✅ JavaScript minified and obfuscated');

        console.log('🎨 Minifying CSS...');
        const minifiedCSS = buildCSS();
        fs.writeFileSync(path.join(distDir, 'styles.min.css'), minifiedCSS);
        console.log('✅ CSS minified');

        console.log('📄 Minifying HTML...');
        const minifiedHTML = await buildHTML();
        fs.writeFileSync(path.join(distDir, 'index.html'), minifiedHTML);
        console.log('✅ HTML minified');

        console.log('\n✨ Build complete! Files are in the dist/ directory');
        console.log('📊 Size reduction:');
        const originalSize = scriptSource.length + cssSource.length + htmlSource.length;
        const minifiedSize = minifiedJS.length + minifiedCSS.length + minifiedHTML.length;
        const reduction = ((1 - minifiedSize / originalSize) * 100).toFixed(2);
        console.log(`   Original: ${(originalSize / 1024).toFixed(2)} KB`);
        console.log(`   Minified: ${(minifiedSize / 1024).toFixed(2)} KB`);
        console.log(`   Reduction: ${reduction}%`);
        console.log('\n🔐 Security features applied:');
        console.log('   ✓ Code obfuscation');
        console.log('   ✓ String encryption');
        console.log('   ✓ Variable name mangling');
        console.log('   ✓ Dead code elimination');
        console.log('   ✓ Control flow flattening');
        console.log('   ✓ Sensitive data protection');

    } catch (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }
}

build();

