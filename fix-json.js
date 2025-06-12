const fs = require('fs');
fs.writeFileSync('database/blockchain.json', JSON.stringify({
  name: "Uemf",
  difficulty: 6,
  miningInterval: 300,
  blockReward: 50,
  denom: "uemfCoin",
  head: null
}, null, 2), { encoding: 'utf8' });

fs.writeFileSync('database/wallet.json', '[]', { encoding: 'utf8' });
fs.writeFileSync('database/mempool.json', '[]', { encoding: 'utf8' });
console.log('All files fixed!'); 