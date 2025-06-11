// addTransactionMempool
// removeTransactionMempool
// getAllTransactionsMempool
// saveMempool
const pathDb = "database/mempool.json"
const fs = require("fs")

// Ensures the mempool file exists
const ensureMempoolFile = async () => {
    if (!fs.existsSync(pathDb)) {
        await fs.promises.writeFile(pathDb, JSON.stringify([], null, 2))
    }
}

// Loads all transactions from the mempool file
const getAllTransactionsMempool = async () => {
    await ensureMempoolFile();
    try {
        let transactions = JSON.parse(await fs.promises.readFile(pathDb))
        return transactions;
    }
    catch (e) {
        throw e
    }
}

// Saves the entire mempool to the file
const saveMempool = async (mempool) => {
    await ensureMempoolFile();
    try {
        await fs.promises.writeFile(pathDb, JSON.stringify(mempool, null, 3))
    } catch (error) {
        throw error
    }
}

// Adds a transaction to the mempool
const addTransactionMempool = async (transaction) => {
    await ensureMempoolFile();
    try {
        const mempool = await getAllTransactionsMempool()
        mempool.push(transaction)
        await saveMempool(mempool)
    }
    catch (error) {
        throw error
    }
}

/*
const user = {name:"mehdi",age:32}
undefined
const hello = ({name})=>console.log(name)
undefined
hello(user)
VM1046:1 mehdi
 */
// Removes a transaction from the mempool by signature
const removeTransactionMempool = async ({ signature }) => {
    await ensureMempoolFile();
    try {
        let mempool = await getAllTransactionsMempool()
        mempool = mempool.filter(tx => tx.signature != signature)
        await saveMempool(mempool)
    }
    catch (error) {
        throw error
    }
}
module.exports = {
    addTransactionMempool, getAllTransactionsMempool,
    removeTransactionMempool, saveMempool
}