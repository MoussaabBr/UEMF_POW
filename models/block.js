const crypto = require('crypto')

// Block class represents a single block in the blockchain
class Block {
  
    constructor(height, previousHash, timestamp, difficulty, blockReward, miner, transactions = [], nonce = 0) {
        this.height = height; // Block number
        this.previousHash = previousHash; // Link to previous block
        this.timestamp = timestamp; // When block was created
        this.difficulty = difficulty; // Mining difficulty
        this.blockReward = blockReward; // Reward for mining
        this.miner = miner; // Who mined this block
        this.transactions = transactions; // Transactions included
        this.nonce = nonce; // Proof-of-work nonce
        this.hash = this.calculateHash(); // Block's hash
        this.blockchain = null; // Reference to blockchain (optional)
        this.previousBlock = null; // Reference to previous block (optional)
    }

    // Calculates the SHA-256 hash of the block's contents
    calculateHash() {
        return crypto.createHash('sha256').update(
            this.height + this.previousHash + this.timestamp + this.difficulty + this.blockReward + 
            this.miner + JSON.stringify(this.transactions) + this.nonce
        ).digest('hex');
    }

    // Adds a transaction to the block and recalculates the hash
    addTransaction(transaction) {
        this.transactions.push(transaction);
        this.hash = this.calculateHash();
    }
}

module.exports = Block;