const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const Blockchain = require('./models/blockchain');
const Block = require('./models/block');
const Transaction = require('./models/transaction');
const { loadBlockchain, saveBlockchain } = require('./persistence/blockchainPersitence');
const { loadBlocks, saveBlock } = require('./persistence/blockPersistence');
const { getAllTransactionsMempool, addTransactionMempool, removeTransactionMempool, saveMempool } = require('./persistence/mempoolPersistence');
const { getAllWallets, saveAllWallets } = require('./persistence/walletPersistence');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Serve static files for the web UI from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Helper: Load blockchain and blocks from disk
async function getBlockchainInstance() {
    const blockchainData = await loadBlockchain();
    const blockchain = new Blockchain(
        blockchainData.name,
        blockchainData.difficulty,
        blockchainData.miningInterval,
        blockchainData.blockReward,
        blockchainData.denom
    );
    const blocks = await loadBlocks();
    if (blocks.length > 0) blockchain.chain = blocks;
    return blockchain;
}

// GET /blocks - Returns the full blockchain
app.get('/blocks', async (req, res) => {
    const blockchain = await getBlockchainInstance();
    res.json(blockchain.chain);
});

// GET /mempool - Returns all pending transactions
app.get('/mempool', async (req, res) => {
    const mempool = await getAllTransactionsMempool();
    res.json(mempool);
});

// GET /wallets - Returns all wallet balances
app.get('/wallets', async (req, res) => {
    const wallets = await getAllWallets();
    res.json(wallets.map(w => ({ pkey: w.pkey, solde: w.solde })));
});

// POST /transactions - Submit a new transaction
app.post('/transactions', async (req, res) => {
    try {
        const { sender, receiver, amount, fees, signature } = req.body;
        if (!sender || !receiver || !amount || !signature) {
            return res.status(400).json({ error: 'Missing transaction fields.' });
        }
        // Check sender balance (except for SYSTEM)
        if (sender !== 'SYSTEM') {
            const wallets = await getAllWallets();
            const senderWallet = wallets.find(w => w.pkey === sender);
            const senderSolde = senderWallet ? senderWallet.solde : 0;
            if (senderSolde < (amount + (fees || 0))) {
                return res.status(400).json({ error: 'Insufficient funds.' });
            }
        }
        // Create and validate transaction
        const tx = new Transaction(sender, receiver, amount, fees, signature);
        // TODO: Add signature verification and balance check here
        await addTransactionMempool(tx);
        res.json({ message: 'Transaction added to mempool.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /mine - Submit a mined block
app.post('/mine', async (req, res) => {
    try {
        const { block } = req.body;
        if (!block) return res.status(400).json({ error: 'No block provided.' });
        // Reconstruct the block as a Block class instance
        const minedBlock = new Block(
            block.height,
            block.previousHash,
            block.timestamp,
            block.difficulty,
            block.blockReward,
            block.miner,
            block.transactions,
            block.nonce
        );
        minedBlock.hash = block.hash; // Use the hash found by the client
        // TODO: Validate block (proof-of-work, transactions, etc.)
        const blockchain = await getBlockchainInstance();
        blockchain.addBlock(minedBlock);
        await saveBlock(minedBlock);
        await saveBlockchain(blockchain);
        // Remove included transactions from mempool
        const mempool = await getAllTransactionsMempool();
        const txHashes = minedBlock.transactions.map(tx => tx.signature);
        const newMempool = mempool.filter(tx => !txHashes.includes(tx.signature));
        await saveMempool(newMempool);
        // Update wallets based on block transactions
        let wallets = await getAllWallets();
        for (const tx of minedBlock.transactions) {
            // Find or create receiver wallet
            let receiverWallet = wallets.find(w => w.pkey === tx.receiver);
            if (!receiverWallet) {
                receiverWallet = {
                    pkey: tx.receiver,
                    solde: 0,
                    sentTransactions: [],
                    receivedTransactions: [],
                    minedTransactions: []
                };
                wallets.push(receiverWallet);
            }
            if (tx.sender === 'SYSTEM') {
                // Mining reward: add to receiver only
                receiverWallet.solde += tx.amount;
                receiverWallet.minedTransactions.push(tx);
            } else {
                // Find or create sender wallet
                let senderWallet = wallets.find(w => w.pkey === tx.sender);
                if (!senderWallet) {
                    senderWallet = {
                        pkey: tx.sender,
                        solde: 0,
                        sentTransactions: [],
                        receivedTransactions: [],
                        minedTransactions: []
                    };
                    wallets.push(senderWallet);
                }
                // Subtract from sender (amount + fees)
                senderWallet.solde -= (tx.amount + (tx.fees || 0));
                if (senderWallet.solde < 0) senderWallet.solde = 0;
                senderWallet.sentTransactions.push(tx);
                // Add to receiver
                receiverWallet.solde += tx.amount;
                receiverWallet.receivedTransactions.push(tx);
                // Optionally: handle fees (e.g., add to miner)
            }
        }
        await saveAllWallets(wallets);
        res.json({ message: 'Block added to blockchain.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Blockchain server running at http://localhost:${PORT}`);
}); 