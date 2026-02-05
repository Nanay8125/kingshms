
async function checkHash() {
    const password = 'SecurePass123!';
    const salt = 'luxestay_salt_2024';
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    // Use Web Crypto API which is available in global scope in modern environments, 
    // or import from node:crypto if needed.
    // However, in standard Node environment, crypto.subtle might be under require('crypto').webcrypto
    // But since we are using tsx, we can try global crypto depending on environment, or import.

    // Using import for reliability in module environment
    const { webcrypto } = await import('node:crypto');
    const subtle = webcrypto.subtle;

    const hashBuffer = await subtle.digest('SHA-256', data);
    const hashHex = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    console.log('Calculated Hash:', hashHex);
    console.log('Expected Hash:  ', 'efe5e46562838eb6afd1cb753f27a7616bf474188899dc69e0e733aa4c3d3de0');
    console.log('Match:', hashHex === 'efe5e46562838eb6afd1cb753f27a7616bf474188899dc69e0e733aa4c3d3de0');
}

checkHash();
