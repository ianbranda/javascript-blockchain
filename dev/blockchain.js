const sha256 = require("sha256");
const currentNodeUrl = process.argv[3];
const uuid = require("uuid");

class Blockchain {
	constructor() {
		this.chain = [];
		this.pendingTransactions = [];

		this.currentNodeUrl = currentNodeUrl;
		this.networkNodes = [];

		this.createNewBlock(0, "0", "0");
	}

	createNewBlock(nonce, previousBlockHash, hash) {
		const newBlock = {
			index: this.chain.length,
			timestamp: Date.now(),
			transactions: this.pendingTransactions,
			nonce: nonce,
			hash: hash,
			previousBlockHash: previousBlockHash,
		};

		this.pendingTransactions = [];
		this.chain.push(newBlock);

		return newBlock;
	}

	get lastBlock() {
		return this.chain[this.chain.length - 1];
	}

	createNewTransaction(amount, sender, recipient) {
		const newTransaction = {
			id: uuid.v1().split("-").join(""),
			amount: amount,
			sender: sender,
			recipient: recipient,
		};

		return newTransaction;
	}

	addToPendingTransactions(newTransaction) {
		this.pendingTransactions.push(newTransaction);
		return this.lastBlock.index + 1;
	}

	hashBlock(previousBlockHash, currentBlockData, nonce) {
		const dataAsString =
			previousBlockHash +
			nonce.toString() +
			JSON.stringify(currentBlockData);

		const hash = sha256(dataAsString);

		return hash;
	}

	proofOfWork(previousBlockHash, currentBlockData) {
		let nonce = 0;
		let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
		while (hash.substring(0, 4) !== "0000") {
			nonce++;
			hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
		}

		return nonce;
	}

	chainIsValid(blockchain) {
		for (var i = 1; i < blockchain.length; i++) {
			const currentBlock = blockchain[i];
			const previousBlock = blockchain[i - 1];

			if (currentBlock.previousBlockHash !== previousBlock.hash) {
				return false;
			}

			const blockHash = this.hashBlock(
				previousBlock.hash,
				{
					transactions: currentBlock.transactions,
					index: currentBlock.index,
				},
				currentBlock.nonce
			);

			if (blockHash.substring(0, 4) !== "0000") {
				return false;
			}
		}

		const genesisBlock = blockchain[0];

		if (
			genesisBlock.nonce !== 0 ||
			genesisBlock.previousBlockHash !== "0" ||
			genesisBlock.hash !== "0" ||
			genesisBlock.transactions.length !== 0
		) {
			return false;
		}

		return true;
	}

	getBlock(blockHash) {
		return (
			this.chain.filter((block) => block.hash === blockHash)[0] ?? null
		);
	}

	getTransaction(transactionId) {
		for (const block of this.chain) {
			for (const transaction of block.transactions) {
				if (transaction.id === transactionId) {
					return { transaction: transaction, block: block };
				}
			}
		}

		return { transaction: null, block: null };
	}

	getAddressData(address) {
		const addressTransactions = [];
		let balance = 0;
		this.chain.forEach((block) => {
			block.transactions.forEach((transaction) => {
				if (address === transaction.sender) {
					addressTransactions.push(transaction);
					balance -= transaction.amount;
				} else if (address === transaction.recipient) {
					addressTransactions.push(transaction);
					balance += transaction.amount;
				}
			});
		});

		return { addressTransactions: addressTransactions, addressBalance: balance };
	}
}

module.exports = Blockchain;
