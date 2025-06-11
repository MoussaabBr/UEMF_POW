const crypto = require('crypto');

// Transaction class represents a transfer of coins from one wallet to another
class Transaction {
   
    constructor(sender, receiver, amount, fees = 0, signature = "") {
        this.sender = sender; // Sender's address
        this.receiver = receiver; // Receiver's address
        this.amount = amount; // Amount to transfer
        this.fees = fees; // Transaction fees
        this.signature = signature; // Digital signature
        this.mempool = null; // Reference to mempool (optional)
        this.block = null; // Reference to block (optional)
    }

    // Signs the transaction using the sender's private key
    sign(privateKey) {
        // Hash the transaction data with the private key for a simple signature
        const data = this.sender + this.receiver + this.amount + this.fees;
        this.signature = crypto.createHmac('sha256', privateKey).update(data).digest('hex');
    }
}

module.exports = Transaction;