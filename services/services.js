const fs = require("fs")
const BlockChain = require("../models/blockchain")
const Bloc = require("../models/bloc")
const Transaction = require("../models/transaction")
const TransactionReward = require("../models/transactionReward")
const { verifyCustom, generateHashCustom } = require("../utils")
const load = async (path) => {
    //returns blockchain
    let data = await fs.promises.readFile(path)
    data = JSON.parse(data).blockchain
    const blockchain = new BlockChain(data.name, data.blockReward, data.difficuly,
        data.cyrptoFunction, data.proofStyle)

    data.blocs.forEach(element => {
        const transactionReward = new TransactionReward(element.transactionReward.sender,
            element.transactionReward.amount, element.transactionReward.signture)
        const transactions = element.transactions.map(tx => {
            return new Transaction(tx.sender, tx.receipient, tx.amount, tx.fees, tx.signture)
        })
        const bloc = new Bloc(element.peviousHash, element.nonce, element.height,
            element.hash, transactionReward, transactions)
        transactionReward.bloc = bloc
        transactions.forEach(tx => tx.bloc = bloc)

        bloc.previous = blockchain.lastBlock
        blockchain.lastBlock = bloc
    })
    return blockchain


}
//load("../bd/blockchain_v1.json").then(res => console.log(res));




const save = (blockchain, path) => {
    const data = {
        blockchain: {
            name: blockchain.name,
            blockReward: blockchain.blockReward,
            difficuly: blockchain.difficuly,
            cyrptoFunction: blockchain.cyrptoFunction,
            proofStyle: blockchain.proofStyle,
            blocs: []
        }
    }
    const tmpBlocs = []
    let tete = blockchain.lastBlock
    while (tete != null) {
        const bloc = {
            peviousHash: tete.previous,
            nonce: tete.nonce,
            height: tete.height,
            hash: tete.hash,
            transactionReward: {
                sender: tete.transactionReward.sender,
                amount: tete.transactionReward.amount,
                signature: tete.transactionReward.signature
            },
            transactions: tete.transactions.map(ele => {
                return {
                    sender: ele.sender,
                    receipient: ele.receipient,
                    amount: ele.amount,
                    fees: ele.fees,
                    signature: ele.signature
                }
            })
        }
        tmpBlocs.push(bloc)
        tete = tete.previous
    }
    data.blockchain.blocs = tmpBlocs.reverse()
    fs.writeFile(path, JSON.stringify(data), (err) => {// data ??
        if (err)
            console.log("eerreur ecriture du fichier")
    });
}
const getSolde = (address, bloc) => {
    //returns amount of coins (float)
    let solde = 0
    let teteBlock = bloc
    while (teteBlock != null) {
        let isMiner = address == teteBlock.transactionReward.sender
        if (isMiner) // si miner
            solde += parseFloat(teteBlock.transactionReward.amount)
        // solde += blockchain.blockReward (seulement si le blockreward va etre fixe)
        teteBlock.transactions.forEach(tx => {
            if (isMiner)
                solde += parseFloat(tx.fees)

            if (tx.receipient == address)
                solde += tx.amount
            if (tx.sender == address)
                solde -= (tx.amount + tx.fees)

        })
        teteBlock = teteBlock.previous
    }
    return solde
}
const verifierTransaction = (transaction, bloc) => {
    //returs true or flase
    // verifier la forme => ex: sender => non null et represente une clef public
    if (transaction.sender == "" || transaction.receipient == ""
        || transaction.amount <= 0 || transaction.fees < 0 || transaction.signature == "")
        return {
            valid: false,
            error: "format incorrect"
        }

    let data = transaction.sender + transaction.amount + transaction.receipient + transaction.fees
    let validSignature = verifyCustom(data, transaction.sender, transaction.signature)
    if (!validSignature)
        return {
            valid: false,
            error: "invalid signature"
        }

    let solde = getSolde(transaction.sender, bloc)
    if (solde < transaction.amount + transaction.fees)
        return {
            valid: false,
            error: "pas de solde"
        }

    return {
        valid: true
    }

}
const getBlockByHash = (blockchain, blockHash) => {
    let tete = blockchain.lastBlock
    while (tete != null) {
        if (tete.hash == blockHash)
            return tete;
        tete = tete.previous
    }
    return null
}
const verifierBloc = (bloc) => {
    //returs true or flase
    // forme
    if (bloc.previousHash == "" || bloc.height < 0 || bloc.transactions.length > 20)
        return {
            valid: false,
            error: "format invalid"
        }

    // liason
    if (bloc.previousHash == null) {
        if (bloc.height != 0)
            return {
                valid: false,
                error: "height must be 0 => genesis block"
            }

    }
    else {
        let previousBlock = getBlockByHash(blockchain, bloc.previousHash)
        if (!previousBlock)
            return {
                valid: false,
                error: "invalid previousHash"
            }

        if (bloc.height != previousBlock.height + 1)
            return {
                valid: false,
                error: "height invalid"
            }
    }
    // verifier hash
    //previousHash+signatureTx1+..+signatureTxn+height+signatureReward+nonce
    let signatures;
    if (bloc.transactions.length == 0)
        signatures = ""
    else
        signatures = bloc.transactions.map(tx => tx.signature).reduce((a, b) => a + b)
    let data
    if (bloc.previousHash == null)
        data = signatures + bloc.height + bloc.transactionReward.signature + bloc.nonce + bloc.difficulty
    else data = bloc.previousHash + signatures + bloc.height + bloc.transactionReward.signature + bloc.nonce + bloc.difficulty
    console.log(data);
    let hashData = generateHashCustom(data)
  
    if (bloc.hash != hashData)
        return {
            valid: false,
            error: "invalid hash"
        }
    // verifier difficulty
    let str = "0".repeat(bloc.difficulty)
    if (!bloc.hash.startsWith(str))
        return {
            valid: false,
            error: "invalid proof of work"
        }
    for (let i = 0; i < bloc.transactions.length; i++) {
        if (!verifierTransaction(bloc.transactions[i], bloc))
            return {
                valid: false,
                error: "the bloc contains invalid transaction"
            }
    }
    return {
        valid: true
    }
}
const ajouterBloc = (blockchain, bloc) => {
    //returs true or flase
    let { valid } = verifierBloc(bloc)
    if (!valid)
        return false;
    // verifier is genesis bloc
    if (blockchain.lastBlock == null) {
        if (bloc.previousHash != null || bloc.height != 0)
            return false
    }
    else {
        if (blockchain.lastBlock.height != bloc.height - 1)
            return false;
        if (blockchain.lastBlock.hash != bloc.previousHash)
            return false;
    }
    bloc.previous = blockchain.lastBlock
    blockchain.lastBlock = bloc
    return true;


}
const verifierBlockchain = (blockchain) => {
    //returs true or flase
    let tete = blockchain.lastBlock
    while (tete != null) {
        if (!verifierBloc(tete))
            return false;
        tete = tete.previous
    }
    return true
}
module.exports = {
    load,
    save,
    getSolde,
    verifierBloc,
    verifierBlockchain,
    verifierTransaction,
    ajouterBloc
}