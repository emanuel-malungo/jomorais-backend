import { hashLegacyPassword, compareLegacyPasswords } from './src/utils/encryption.utils.js';

const password = 'Malungo@123';
const hash = hashLegacyPassword(password);

console.log('Senha original:', password);
console.log('Hash MD5:', hash);
console.log('Tamanho do hash:', hash.length);
console.log('Comparação:', compareLegacyPasswords(password, hash));

// Testar com hash existente do banco
const existingHash = '63a9f0ea7bb98050796b649e85481845';
console.log('\nTeste com hash existente:');
console.log('Hash existente:', existingHash);
console.log('Tamanho:', existingHash.length);