const express = require("express");
const bodyParser = require("body-parser");
const Blockchain = require("./blockchain");
const uuid = require("uuid");

var app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const jsCoin = new Blockchain();
const nodeAddress = uuid.v1().split("-").join("");

app.get("/blockchain", (req, res) => {
	// Return the entire blockchain
	res.send(jsCoin);
});

app.post("/transaction", (req, res) => {
	// Create a new transaction with the amount, sender, and recipient in the body of the request
	const blockIndex = jsCoin.createNewTransaction(
		req.body.amount,
		req.body.sender,
		req.body.recipient
	);
	res.json({ note: `Transaction will be added in block ${blockIndex}.` });
});

app.get("/mine", (req, res) => {
	// Get the previous block's hash and the block data
	const previousBlockHash = jsCoin.lastBlock.hash;
	const currentBlockData = {
		transactions: jsCoin.pendingTransactions,
		index: jsCoin.lastBlock.index + 1,
	};
	// Get the prrof of work
	const nonce = jsCoin.proofOfWork(previousBlockHash, currentBlockData);
	// Create the new hash
	const hash = jsCoin.hashBlock(previousBlockHash, currentBlockData, nonce);
	// Reward the miner for their work
	jsCoin.createNewTransaction(6.9, "00", nodeAddress);
	// Add the verified block to the blockchain
	const newBlock = jsCoin.createNewBlock(nonce, previousBlockHash, hash);

	res.json({ note: "New block mined successfully!", block: newBlock });
});

app.listen(PORT, () => console.log("Listening on port:", PORT));
