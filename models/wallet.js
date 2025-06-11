const crypto = require('crypto');

// Wallet class represents a user's wallet for holding and transacting coins
class Wallet {
   
    constructor(pkey = "") {
        this.pkey = pkey || Wallet.generateKey(); // Wallet address
        this.solde = 0; // Balance
        this.sentTransactions = []; // Transactions sent
        this.receivedTransactions = []; // Transactions received
        this.minedTransactions = []; // Transactions mined
    }

    // Generates a random wallet key (address)
    static generateKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    // Sends amount to another wallet (updates balance and records transaction)
    send(amount, receiver) {
        if (this.solde < amount) throw new Error('Insufficient balance');
        this.solde -= amount;
        if (this.solde < 0) this.solde = 0;
        this.sentTransactions.push({ amount, receiver });
    }

    // Receives amount from another wallet (updates balance and records transaction)
    receive(amount, sender) {
        this.solde += amount;
        this.receivedTransactions.push({ amount, sender });
    }
}

module.exports = Wallet;