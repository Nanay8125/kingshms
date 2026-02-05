
const password = 'SecurePass123!';
const saltCounter = 'luxestay_salt_2024';

async function test() {
    const encoder = new TextEncoder();
    const legacyData = encoder.encode(password + saltCounter);
    const legacyHashBuffer = await crypto.subtle.digest('SHA-256', legacyData);
    const legacyHashHex = Array.from(new Uint8Array(legacyHashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    console.log('Legacy Hash:', legacyHashHex);
}

test();
