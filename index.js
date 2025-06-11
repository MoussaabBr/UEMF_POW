require('dotenv').config();
const Blockchain = require('./models/blockchain');
const Block = require('./models/block');
const Transaction = require('./models/transaction');
const Wallet = require('./models/wallet');
const { saveBlockchain, loadBlockchain } = require('./persistence/blockchainPersitence');
const { saveBlock, loadBlocks } = require('./persistence/blockPersistence');
const readline = require('readline');

// Main function to run the blockchain CLI
async function main() {
    // Load blockchain metadata/config from file
    let blockchainData = await loadBlockchain();
    let blockchain = new Blockchain(
        blockchainData.name,
        blockchainData.difficulty,
        blockchainData.miningInterval,
        blockchainData.blockReward,
        blockchainData.denom
    );
    // Load blocks from disk and set the chain
    const blocks = await loadBlocks();
    if (blocks.length > 0) {
        blockchain.chain = blocks;
    }

    // Setup CLI interface
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // Prints the CLI menu
    function printMenu() {
        console.log('\n--- Blockchain CLI ---');
        console.log('1. Print blockchain');
        console.log('2. Mine new block');
        console.log('3. Exit');
    }

    // Handles user input from the CLI
    async function handleInput(choice) {
        switch (choice.trim()) {
            case '1':
                // Print the entire blockchain
                console.log(JSON.stringify(blockchain.chain, null, 2));
                break;
            case '2':
                // For demo, create a dummy transaction and mine a block
                const tx = new Transaction('miner', 'receiver', 10, 1);
                const latest = blockchain.getLatestBlock();
                const newBlock = new Block(
                    latest.height + 1,
                    latest.hash,
                    Date.now(),
                    blockchain.difficulty,
                    blockchain.blockReward,
                    'miner',
                    [tx],
                    0
                );
                // Simple proof-of-work: find a hash with leading zeros (difficulty)
                while (!newBlock.hash.startsWith('0'.repeat(blockchain.difficulty))) {
                    newBlock.nonce++;
                    newBlock.hash = newBlock.calculateHash();
                }
                blockchain.addBlock(newBlock);
                await saveBlock(newBlock);
                await saveBlockchain(blockchain);
                console.log('Block mined and added!');
                break;
            case '3':
                // Exit the CLI
                rl.close();
                process.exit(0);
            default:
                console.log('Invalid choice.');
        }
        printMenu();
        rl.question('Choose an option: ', handleInput);
    }

    printMenu();
    rl.question('Choose an option: ', handleInput);
}

main(); 