
const crypto = require('crypto');

async function checkHash() {
    const password = 'SecurePass123!';
    const salt = 'luxestay_salt_2024';
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashHex = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    console.log('Calculated Hash:', hashHex);
    console.log('Expected Hash:  ', 'efe5e46562838eb6afd1cb753f27a7616bf474188899dc69e0e733aa4c3d3de0');
    console.log('Match:', hashHex === 'efe5e46562838eb6afd1cb753f27a7616bf474188899dc69e0e733aa4c3d3de0');
}

checkHash();
