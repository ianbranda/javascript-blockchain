const express = require("express");
const bodyParser = require("body-parser");
const Blockchain = require("./blockchain");
const uuid = require("uuid");
const rp = require("request-promise");

var app = express();
const PORT = process.argv[2];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const jsCoin = new Blockchain();
const nodeAddress = uuid.v1().split("-").join("");

app.get("/", (req, res) => {
	res.sendFile("./explorer/index.html", {root: __dirname})
})

app.get("/blockchain", (req, res) => {
	// Return the entire blockchain
	res.send(jsCoin);
});

app.post("/transaction", (req, res) => {
	const newTransaction = req.body.newTransaction;
	const blockIndex = jsCoin.addToPendingTransactions(newTransaction);
	res.json({ note: `Transaction will be added in block ${blockIndex}.` });
});

app.post("/transaction/broadcast", async (req, res) => {
	// Create new transaction
	const newTransaction = jsCoin.createNewTransaction(
		req.body.amount,
		req.body.sender,
		req.body.recipient
	);
	jsCoin.addToPendingTransactions(newTransaction);

	// Broadcast new transaction to all other nodes
	const requestPromises = [];
	jsCoin.networkNodes.forEach((networkNodeUrl) => {
		const requestOptions = {
			uri: networkNodeUrl + "/transaction",
			method: "POST",
			body: { newTransaction: newTransaction },
			json: true,
		};
		requestPromises.push(rp(requestOptions));
	});
	await Promise.all(requestPromises);

	res.json({ note: "Transaction successfully created and broadcast." });
});

app.post("/new-block", (req, res) => {
	const newBlock = req.body.newBlock;

	// Verify the new block:
	const correctHash = newBlock.previousBlockHash === jsCoin.lastBlock.hash;
	const correctIndex = newBlock.index === jsCoin.lastBlock.index + 1;

	if (correctHash && correctIndex) {
		jsCoin.chain.push(newBlock);
		jsCoin.pendingTransactions = [];
		res.json({ note: "New block received and accepted" });
	} else {
		res.json({ note: "New block rejected", block: newBlock });
	}
});

app.get("/new-block/broadcast", async (req, res) => {
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
	// Add the verified block to the blockchain
	const newBlock = jsCoin.createNewBlock(nonce, previousBlockHash, hash);

	// Broadcast block to network
	const requestPromises = [];
	jsCoin.networkNodes.forEach((networkNodeUrl) => {
		const requestOptions = {
			uri: networkNodeUrl + "/new-block",
			method: "POST",
			body: { newBlock: newBlock },
			json: true,
		};
		requestPromises.push(rp(requestOptions));
	});

	await Promise.all(requestPromises);

	// Reward the miner for their work
	const requestOptions = {
		uri: jsCoin.currentNodeUrl + "/transaction/broadcast",
		method: "POST",
		body: { amount: 6.9, sender: "00", recipient: nodeAddress },
		json: true,
	};

	await rp(requestOptions);

	res.json({ note: "New block broadcast successfully!", block: newBlock });
});

// Only register nodes that aren't the current node and that aren't already registered
function shouldRegisterNode(node) {
	const notCurrentNode = node !== jsCoin.currentNodeUrl;
	const notAlreadyRegistered = jsCoin.networkNodes.indexOf(node) == -1;
	return notCurrentNode && notAlreadyRegistered;
}

// Register a node and broadcast that node to the whole network
app.post("/register-node/broadcast", async (req, res) => {
	const newNodeUrl = req.body.newNodeUrl;
	// Register the new node with the current node
	if (shouldRegisterNode(newNodeUrl)) {
		jsCoin.networkNodes.push(newNodeUrl);
	}

	// Broadcast new node to the rest of the network
	const registerNodePromises = [];

	jsCoin.networkNodes.forEach((networkNodeUrl) => {
		const requestOptions = {
			uri: networkNodeUrl + "/register-node",
			method: "POST",
			body: { newNodeUrl: newNodeUrl },
			json: true,
		};

		registerNodePromises.push(rp(requestOptions));
	});

	await Promise.all(registerNodePromises);

	// Register exisiting nodes with new node
	const bulkRegisterOptions = {
		uri: newNodeUrl + "/register-node/bulk",
		method: "POST",
		body: {
			allNetworkNodes: [...jsCoin.networkNodes, jsCoin.currentNodeUrl],
		},
		json: true,
	};

	await rp(bulkRegisterOptions);

	const consensusOptions = {
		uri: newNodeUrl + "/consensus",
		method: "GET",
		json: true,
	};

	await rp(consensusOptions);

	res.json({
		note: "New node registered with network and blockchain retrieved.",
	});
});

// Register a node with the network when recieving a new node from broadcast
app.post("/register-node", (req, res) => {
	const newNodeUrl = req.body.newNodeUrl;
	if (shouldRegisterNode(newNodeUrl)) {
		jsCoin.networkNodes.push(newNodeUrl);
	}

	res.json({ note: "New node registered successfully" });
});

// Register multiple nodes at once
app.post("/register-node/bulk", (req, res) => {
	const allNetworkNodes = req.body.allNetworkNodes;
	allNetworkNodes.forEach((networkNodeUrl) => {
		if (shouldRegisterNode(networkNodeUrl)) {
			jsCoin.networkNodes.push(networkNodeUrl);
		}
	});
	res.json({ note: "All exisiting nodes registered" });
});

app.get("/consensus", async (req, res) => {
	// Get blockchains from all other nodes
	const requestPromises = [];
	jsCoin.networkNodes.forEach((networkNodeUrl) => {
		const requestOptions = {
			uri: networkNodeUrl + "/blockchain",
			method: "GET",
			json: true,
		};
		requestPromises.push(rp(requestOptions));
	});

	const blockchains = await Promise.all(requestPromises);

	// Identify if one of the blockchains on the network is loinger than the currently hosted chain
	const currentChainLength = jsCoin.chain.length;
	let maxChainLength = currentChainLength;
	let newLongestChain = null;
	let newPendingTransactions = null;

	blockchains.forEach((blockchain) => {
		if (blockchain.chain.length > maxChainLength) {
			maxChainLength = blockchain.chain.length;
			newLongestChain = blockchain.chain;
			newPendingTransactions = blockchain.pendingTransactions;
		}
	});

	if (!newLongestChain) {
		res.json({
			note: "Current chain is the longest chain.",
			chain: jsCoin.chain,
		});
	} else if (!jsCoin.chainIsValid(newLongestChain)) {
		res.json({
			note: "New longest chain is invalid. Keeping current chain.",
			chain: jsCoin.chain,
		});
	} else {
		jsCoin.chain = newLongestChain;
		jsCoin.pendingTransactions = newPendingTransactions;
		res.json({
			note: "Current chain has been replaced by a longer chain.",
			chain: jsCoin.chain,
		});
	}
});

app.get("/block/:blockHash", (req, res) => {
	const block = jsCoin.getBlock(req.params.blockHash);
	res.json({ block: block });
});

app.get("/transaction/:transactionId", (req, res) => {
	const transactionData = jsCoin.getTransaction(req.params.transactionId);
	res.json(transactionData);
});

app.get("/address/:address", (req, res) => {
	const addressData = jsCoin.getAddressData(req.params.address);
	res.json({addressData: addressData});
});

app.listen(PORT, () => console.log("Listening on port:", PORT));
