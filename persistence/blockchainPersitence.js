const fs = require("fs")
const pathDb = "database/blockchain.json"

// Ensures the blockchain metadata file exists
const ensureBlockchainFile = async () => {
    if (!fs.existsSync(pathDb)) {
        await fs.promises.writeFile(pathDb, JSON.stringify({
            name: "Uemf",
            difficulty: 6,
            miningInterval: 300,
            blockReward: 50,
            denom: "uemfCoin",
            head: null
        }, null, 2))
    }
}

// Saves the blockchain metadata/configuration to file
const saveBlockchain = async (blockchain) => {
    await ensureBlockchainFile();
    let { name, difficulty, miningInterval, blockReward, denom, head } = blockchain
    if (head && head.hash) {
        head = head.hash
    }
    try {
        await fs.promises.writeFile(pathDb, JSON.stringify(
            {
                name, difficulty, miningInterval, blockReward, denom, head
            }, null, 3
        ))
        return true;
    }
    catch (e) {
        console.error(e)
        throw e
    }
}

// Loads the blockchain metadata/configuration from file
const loadBlockchain = async () => {
    await ensureBlockchainFile();
    return new Promise((resolve, reject) => {
        fs.promises.readFile(pathDb)
            .then(data => {
                data = JSON.parse(data)
                resolve(data)
            })
            .catch(e => {
                console.error(e)
                reject(null)
            })
    })
}

module.exports = {
    loadBlockchain, saveBlockchain
}
