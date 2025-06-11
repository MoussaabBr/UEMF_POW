// Tab switching logic
const tabs = [
    { btn: 'tab-blockchain', section: 'section-blockchain' },
    { btn: 'tab-mempool', section: 'section-mempool' },
    { btn: 'tab-wallets', section: 'section-wallets' },
    { btn: 'tab-transaction', section: 'section-transaction' },
    { btn: 'tab-wallet-tools', section: 'section-wallet-tools' }
];

tabs.forEach(({ btn, section }) => {
    document.getElementById(btn).addEventListener('click', () => {
        tabs.forEach(({ btn: b, section: s }) => {
            document.getElementById(s).style.display = 'none';
            document.getElementById(b).classList.remove('active');
        });
        document.getElementById(section).style.display = 'block';
        document.getElementById(btn).classList.add('active');
    });
});

document.getElementById('tab-blockchain').classList.add('active');

// Fetch and display blockchain
async function loadBlockchain() {
    const res = await fetch('/blocks');
    const chain = await res.json();
    document.getElementById('blockchain-list').innerHTML =
        '<pre>' + JSON.stringify(chain, null, 2) + '</pre>';
}

// Fetch and display mempool
async function loadMempool() {
    const res = await fetch('/mempool');
    const mempool = await res.json();
    document.getElementById('mempool-list').innerHTML =
        '<pre>' + JSON.stringify(mempool, null, 2) + '</pre>';
}

// Fetch and display wallets
async function loadWallets() {
    const res = await fetch('/wallets');
    const wallets = await res.json();
    document.getElementById('wallets-list').innerHTML =
        '<pre>' + JSON.stringify(wallets, null, 2) + '</pre>';
}

// Handle transaction form submission
const txForm = document.getElementById('transaction-form');
txForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const sender = document.getElementById('tx-sender').value.trim();
    const receiver = document.getElementById('tx-receiver').value.trim();
    const amount = parseFloat(document.getElementById('tx-amount').value);
    const fees = parseFloat(document.getElementById('tx-fees').value) || 0;
    const signature = document.getElementById('tx-signature').value.trim();
    const resultDiv = document.getElementById('tx-result');
    resultDiv.textContent = 'Submitting...';
    try {
        const res = await fetch('/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sender, receiver, amount, fees, signature })
        });
        const data = await res.json();
        if (res.ok) {
            resultDiv.textContent = data.message;
            txForm.reset();
            loadMempool();
        } else {
            resultDiv.textContent = data.error || 'Error submitting transaction.';
        }
    } catch (err) {
        resultDiv.textContent = 'Network error.';
    }
});

// Wallet Generation (using browser crypto)
function generateWallet() {
    // Generate 32 random bytes as private key
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    const privKey = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    // For demo, public key = private key (not secure, but matches backend logic)
    const pubKey = privKey;
    return { privKey, pubKey };
}

document.getElementById('generate-wallet-btn').addEventListener('click', () => {
    const { privKey, pubKey } = generateWallet();
    document.getElementById('wallet-info').innerHTML =
        `<b>Private Key:</b> <span style="word-break:break-all">${privKey}</span><br>` +
        `<b>Public Key:</b> <span style="word-break:break-all">${pubKey}</span><br>` +
        `<button onclick="navigator.clipboard.writeText('${privKey}')">Copy Private Key</button> ` +
        `<button onclick="navigator.clipboard.writeText('${pubKey}')">Copy Public Key</button>`;
});

// Transaction Signing (HMAC-SHA256, matches backend logic)
async function signTransaction(privKey, sender, receiver, amount, fees) {
    const data = sender + receiver + amount + fees;
    const enc = new TextEncoder();
    const key = await window.crypto.subtle.importKey(
        'raw',
        hexToBytes(privKey),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const sig = await window.crypto.subtle.sign('HMAC', key, enc.encode(data));
    return bytesToHex(new Uint8Array(sig));
}

function hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
}
function bytesToHex(bytes) {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Handle sign form
const signForm = document.getElementById('sign-form');
signForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const privKey = document.getElementById('sign-privkey').value.trim();
    const sender = document.getElementById('sign-sender').value.trim();
    const receiver = document.getElementById('sign-receiver').value.trim();
    const amount = parseFloat(document.getElementById('sign-amount').value);
    const fees = parseFloat(document.getElementById('sign-fees').value) || 0;
    const resultDiv = document.getElementById('sign-result');
    resultDiv.textContent = 'Signing...';
    try {
        const signature = await signTransaction(privKey, sender, receiver, amount, fees);
        resultDiv.innerHTML = `<b>Signature:</b> <span style="word-break:break-all">${signature}</span> <button onclick="navigator.clipboard.writeText('${signature}')">Copy</button>`;
    } catch (err) {
        resultDiv.textContent = 'Error signing transaction.';
    }
});

// Mining logic
async function mineBlock() {
    const mineResult = document.getElementById('mine-result');
    mineResult.textContent = 'Mining...';
    try {
        // Fetch blockchain and mempool
        const [chainRes, mempoolRes] = await Promise.all([
            fetch('/blocks'),
            fetch('/mempool')
        ]);
        const chain = await chainRes.json();
        const mempool = await mempoolRes.json();
        if (!chain.length) throw new Error('No blockchain found.');
        // For demo, miner is a random address
        const miner = 'miner_' + Math.random().toString(36).slice(2, 10);
        const latest = chain[chain.length - 1];
        // Block params (match backend logic)
        const difficulty = latest.difficulty || 6;
        const blockReward = latest.blockReward || 50;
        const height = latest.height + 1;
        const previousHash = latest.hash;
        const timestamp = Date.now();
        const transactions = mempool;
        let nonce = 0;
        // Build block object
        let hash = '';
        // Simple PoW: hash must start with N zeros
        while (true) {
            const blockData = height + previousHash + timestamp + difficulty + blockReward + miner + JSON.stringify(transactions) + nonce;
            hash = await digestSHA256(blockData);
            if (hash.startsWith('0'.repeat(difficulty))) break;
            nonce++;
            // For UI responsiveness, yield every 10000 tries
            if (nonce % 10000 === 0) await new Promise(r => setTimeout(r, 1));
        }
        // Submit block
        const block = { height, previousHash, timestamp, difficulty, blockReward, miner, transactions, nonce, hash };
        const res = await fetch('/mine', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ block })
        });
        const data = await res.json();
        if (res.ok) {
            mineResult.textContent = data.message;
            loadBlockchain();
            loadMempool();
            loadWallets();
        } else {
            mineResult.textContent = data.error || 'Error mining block.';
        }
    } catch (err) {
        mineResult.textContent = 'Mining error: ' + err.message;
    }
}
async function digestSHA256(str) {
    const enc = new TextEncoder();
    const buf = await window.crypto.subtle.digest('SHA-256', enc.encode(str));
    return bytesToHex(new Uint8Array(buf));
}

document.getElementById('mine-block-btn').addEventListener('click', mineBlock);

// Initial load
loadBlockchain();
loadMempool();
loadWallets();

// Reload data when switching tabs
['tab-blockchain', 'tab-mempool', 'tab-wallets'].forEach(id => {
    document.getElementById(id).addEventListener('click', () => {
        if (id === 'tab-blockchain') loadBlockchain();
        if (id === 'tab-mempool') loadMempool();
        if (id === 'tab-wallets') loadWallets();
    });
}); 