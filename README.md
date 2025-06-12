# UEMF Proof-of-Work Blockchain

A simple local blockchain with proof-of-work, wallet management, transaction pool (mempool), and a web interface, built with Node.js.

## Features
- Block, Blockchain, Wallet, and Transaction models
- File-based persistence (blockchain, wallets, mempool)
- Proof-of-work mining
- Web UI for blockchain, mempool, wallets, and mining

## Quick Start
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the server:**
   ```bash
   node server.js
   ```
3. **Open in browser:**
   Visit [http://localhost:3000](http://localhost:3000)

## File Structure
```
├── models/           # Core blockchain models
├── persistence/      # Data persistence logic
├── database/         # JSON data storage
│   ├── blockchain.json  # Blockchain config
│   ├── wallet.json      # Wallets
│   └── mempool.json     # Mempool 
├── public/           # Web UI
├── server.js         # Main server
```

### Example blockchain.json
```json
{
  "name": "Uemf",
  "difficulty": 4,
  "miningInterval": 300,
  "blockReward": 50,
  "denom": "uemfCoin"
}
```




