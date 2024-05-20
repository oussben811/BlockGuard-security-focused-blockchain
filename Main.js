const Bloc = require("./models/bloc");
const BlockChain = require("./models/blockchain");
const TransactionReward = require("./models/transactionReward");
const { verifierBloc, ajouterBloc } = require("./services/services");
const { generateKeyPairsCustom, signCustom, generateHashCustom, isValidPOW } = require("./utils");

/* 
1- creer une instance du Blockchain
 ( name = EDH Blockchain,
    difficulty: 4 => hash debute par 4 zeros,
    blockReward : 50 EDH,
    crypthoFct : SHA256,
    proofStyle: Proof of Work)
2- creer des wallets => generer public/private keys
3- creer une transaction (si c'est possible)
4- creer un bloc => creation du transaction bloc reward + mining
5- ajouter le bloc a la blockchain
6- on va refaire step 2 to 5
7- verifier la blockchain (avec des tentaatives de fraud)
8- save
9- load 
*/
const edhBlockchain = new BlockChain("EDH Blockchain", 50, 4, "sha256", "proof of work")
// 2-generer 4 identite
const users = [generateKeyPairsCustom(), generateKeyPairsCustom(), generateKeyPairsCustom(), generateKeyPairsCustom()]
// 3- on va la sauter vu que on a pas de EDH pour le moment

//4-
// 4-a creer transaction du bloc reward
const txReward = new TransactionReward(users[0].publicKey, 50, null)
//(miner+reward+height)
let height = edhBlockchain.lastBlock == null ? 0 : edhBlockchain.lastBlock.height + 1;

const rawTxReward = txReward.sender + txReward.amount + height
const singatureTxReward = signCustom(rawTxReward, users[0].privateKey)

txReward.signature = singatureTxReward

// 4-b mining = previousHash+signatureTx1+..+signatureTxn+height+signatureReward+nonce

let lastHash = edhBlockchain.lastBlock == null ? null : edhBlockchain.lastBlock.hash
let nonce = 0
const bloc1 = new Bloc(lastHash, nonce, height, null, txReward, [], null, edhBlockchain.difficulty)
let hashBloc1
while (true) {
    let rawHashBloc1;
    if (bloc1.previousHash == null)
        rawHashBloc1 =bloc1.height + bloc1.transactionReward.signature + bloc1.nonce + bloc1.difficulty
    else rawHashBloc1 = bloc1.previousHash + bloc1.height + bloc1.transactionReward.signature + bloc1.nonce + bloc1.difficulty
    console.log(rawHashBloc1s);
    hashBloc1 = generateHashCustom(rawHashBloc1)
    let res = isValidPOW(hashBloc1, edhBlockchain.difficulty)
    if (res)
        break;
    else
        bloc1.nonce++
    //console.log(hashBloc1);
}
console.log(hashBloc1);
console.log("nonce est : " + bloc1.nonce)
bloc1.hash=hashBloc1
//5- ajouter le bloc a la blockchain
let resAjout = ajouterBloc(edhBlockchain, bloc1)
console.log(resAjout);
//console.log(verifierBloc(bloc1));
