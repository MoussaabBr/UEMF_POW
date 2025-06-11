const Block = require('./block');
const Transaction = require('./transaction');
const Wallet = require('./wallet');
const crypto = require('crypto');

// Blockchain class manages the chain of blocks and provides methods to interact with it
class Blockchain {
   
    constructor(name = "uemfBlockchain", difficulty = 6,
        miningInterval = 600, blockReward = 50, denom = "uemfCoin"
    ) {
        this.name = name; // Blockchain name
        this.difficulty = difficulty; // Mining difficulty
        this.miningInterval = miningInterval; // Target block time
        this.blockReward = blockReward; // Mining reward
        this.denom = denom; // Coin name
        this.chain = [this.createGenesisBlock()]; // Array of blocks
    }

    // Creates the first block in the chain
    createGenesisBlock() {
        return new Block(0, "0", Date.now(), this.difficulty, this.blockReward, "genesis", [], 0);
    }

    // Returns the latest (most recent) block in the chain
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    // Adds a new block to the chain
    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        this.chain.push(newBlock);
    }
}

module.exports = Blockchain
