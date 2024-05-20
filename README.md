# BlockGuard Blockchain

BlockGuard is a security-focused blockchain implementation based on the proof of work consensus mechanism. It provides a secure and decentralized platform for executing transactions while ensuring data integrity and resistance to tampering.

## Features

- **Proof of Work:** BlockGuard utilizes the proof of work consensus mechanism to achieve distributed consensus and secure the network against malicious actors.
- **Block Reward:** Miners are rewarded with 50 eDH (example Digital Hecoins) for successfully mining a block.
- **Hash/Sign Function:** SHA-256 hashing algorithm is used for generating hashes and signatures, ensuring cryptographic security.
- **Transaction Structure:** Transactions include sender, recipient, amount, and fees, each verified with digital signatures.
- **Block Structure:** Each block consists of a list of transactions, the previous block's hash, a nonce, block height, and a reward transaction for the miner.
- **Security:** BlockGuard prioritizes security by implementing robust cryptographic techniques and consensus mechanisms.

## Block Structure

A block in BlockGuard consists of the following components:

- List of transactions (up to 20)
- Previous block hash
- Nonce
- Block height
- Reward transaction for the miner

## Transaction Structure

Transactions in BlockGuard include the following fields:

- Sender (public key)
- Recipient (public key)
- Amount (eDH)
- Fees (eDH)
- Signature

## Reward Transaction

The reward transaction for miners includes:

- Miner (public key)
- Reward (eDH)
- Height
- Signature

## Usage

To use BlockGuard, follow these steps:

1. Clone the BlockGuard repository.
2. Build and deploy the blockchain network.
3. Start mining or execute transactions on the network.
4. Monitor network activity and security measures.

## Technology Stack

BlockGuard is coded with JavaScript, leveraging its versatility and popularity in the development community.

## Contributing

Contributions to BlockGuard are welcome! If you have any suggestions, bug reports, or feature requests, feel free to open an issue or submit a pull request.


