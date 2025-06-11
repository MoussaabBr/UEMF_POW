const fs = require("fs")
const pathDb = "database/wallet.json"

// Ensures the wallet file exists
const ensureWalletFile = async () => {
    if (!fs.existsSync(pathDb)) {
        await fs.promises.writeFile(pathDb, JSON.stringify([], null, 2))
    }
}

// Loads all wallets from the wallet file
const getAllWallets = async () => {
    await ensureWalletFile();
    try {
        return JSON.parse(await fs.promises.readFile(pathDb))
    }
    catch (e) {
        throw e
    }
}

// Saves all wallets to the wallet file
const saveAllWallets = async (wallets) => {
    await ensureWalletFile();
    try {
        await fs.promises.writeFile(pathDb, JSON.stringify(wallets, null, 3))
    }
    catch (e) {
        throw e
    }
}

// Updates a wallet in the wallet file
const updateWallet = async (wallet) => {
    await ensureWalletFile();
    try {
        let wallets = await getAllWallets()
        let wallet_to_update = wallets.find(ele => ele.pkey == wallet.pkey)
        if (wallet_to_update) {
            wallet_to_update.solde = wallet.solde
            wallet_to_update.sentTransactions = wallet.sentTransactions
            wallet_to_update.receivedTransactions = wallet.receivedTransactions
            wallet_to_update.minedTransactions = wallet.minedTransactions
            await saveAllWallets(wallets);
        }
        else {
            throw new Error("wallet not found")
        }
    }
    catch (e) {
        throw e
    }
}

// Adds a new wallet to the wallet file
const addWallet = async (wallet) => {
    await ensureWalletFile();
    try {
        let wallets = await getAllWallets()
        let found = wallets.find(ele => ele.pkey == wallet.pkey)
        if (!found) {
            wallets.push(wallet)
            await saveAllWallets(wallets);
        }
        else {
            throw new Error("wallet already exist")
        }
    }
    catch (e) {
        throw e
    }
}

module.exports = {
    getAllWallets,
    saveAllWallets,
    updateWallet,
    addWallet
}
