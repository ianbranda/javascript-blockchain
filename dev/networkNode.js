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

// Only register nodes that aren't the current node and that aren't already registered
function shouldRegisterNode(node) {
	const notCurrentNode = node !== jsCoin.currentNodeUrl;
	const notAlreadyRegistered = jsCoin.networkNodes.indexOf(node) == -1;
	return notCurrentNode && notAlreadyRegistered;
}

// Register a node and broadcast that node to the whole network
app.post("/register-and-broadcast-node", async (req, res) => {
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
		uri: newNodeUrl + "/register-nodes-bulk",
		method: "POST",
		body: {
			allNetworkNodes: [...jsCoin.networkNodes, jsCoin.currentNodeUrl],
		},
		json: true,
	};

	await rp(bulkRegisterOptions);

	res.json({ note: "New node registered with network" });
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
app.post("/register-nodes-bulk", (req, res) => {
	const allNetworkNodes = req.body.allNetworkNodes;
	allNetworkNodes.forEach((networkNodeUrl) => {
		if (shouldRegisterNode(networkNodeUrl)) {
			jsCoin.networkNodes.push(networkNodeUrl);
		}
	});
	res.json({ note: "All exisiting nodes registered" });
});

app.listen(PORT, () => console.log("Listening on port:", PORT));
