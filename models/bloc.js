class Bloc{
    constructor(previousHash,nonce,height,hash,transactionReward,transactions,previous,difficulty){
        this.previousHash=previousHash;
        this.nonce=nonce;
        this.height=height;
        this.hash=hash;
        this.transactionReward=transactionReward;
        this.transactions=transactions;
        this.previous=previous;
        this.difficulty=difficulty
    }
}
module.exports=Bloc;



               