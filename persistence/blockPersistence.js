const pathFolder = "database/blocks"
const fs = require("fs")
const Block = require("../models/block")

// Ensures the blocks directory exists
const ensureBlocksDir = async () => {
    if (!fs.existsSync(pathFolder)) {
        await fs.promises.mkdir(pathFolder, { recursive: true })
    }
}

// Loads all blocks from the blocks directory, sorted by height
const loadBlocks = async () => {
    await ensureBlocksDir()
    try {
        let listFiles = await fs.promises.readdir(pathFolder)
        let sortedFiles = listFiles.sort((file1, file2) => {
            let numeroFile1 = parseInt(file1.slice(6, -5))
            let numeroFile2 = parseInt(file2.slice(6, -5))
            return numeroFile1 - numeroFile2
        })
        const blocks = []
        for (const file of sortedFiles) {
            const data = await fs.promises.readFile(`${pathFolder}/${file}`)
            blocks.push(JSON.parse(data))
        }
        return blocks
    } catch (error) {
        return []
    }
}

// Saves an array of blocks to the blocks directory
const saveBlocks = async (blocks) => {
    await ensureBlocksDir()
    for (const block of blocks) {
        await saveBlock(block)
    }
}

// Saves a single block as a JSON file
const saveBlock = async (block) => {
    await ensureBlocksDir()
    const filename = `${pathFolder}/block_${block.height}.json`
    await fs.promises.writeFile(filename, JSON.stringify(block, null, 2))
}

// Gets a block by its hash
const getBlock = async (hash) => {
    const blocks = await loadBlocks()
    return blocks.find(b => b.hash === hash) || null
}

// Gets a block by its height
const getBlockByHeight = async (height) => {
    const filename = `${pathFolder}/block_${height}.json`
    try {
        const data = await fs.promises.readFile(filename)
        return JSON.parse(data)
    } catch {
        return null
    }
}

module.exports = {
    loadBlocks,
    saveBlocks,
    saveBlock,
    getBlock,
    getBlockByHeight
}