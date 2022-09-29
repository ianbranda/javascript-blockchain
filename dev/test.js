const Blockchain = require("./blockchain");

const jsCoin = new Blockchain();

const bc1 = {
	chain: [
		{
			index: 0,
			timestamp: 1664471439645,
			transactions: [],
			nonce: 0,
			hash: "0",
			previousBlockHash: "0",
		},
		{
			index: 1,
			timestamp: 1664471932314,
			transactions: [],
			nonce: 53901,
			hash: "00009a5055cd9a756df37c0aa3c5ab4f3695e8e57cf5ead7d781abb29411ebd7",
			previousBlockHash: "0",
		},
		{
			index: 2,
			timestamp: 1664471956659,
			transactions: [
				{
					id: "ca2875d0401a11edb0ab5d4a3d51c5b3",
					amount: 6.9,
					sender: "00",
					recipient: "a47e3cd0401911edb0ab5d4a3d51c5b3",
				},
			],
			nonce: 95344,
			hash: "0000fb0cd9fdcf53bc5e01930a7b6209eba1c91c25cd1132b8d6b783fe6121a1",
			previousBlockHash:
				"00009a5055cd9a756df37c0aa3c5ab4f3695e8e57cf5ead7d781abb29411ebd7",
		},
		{
			index: 3,
			timestamp: 1664471987756,
			transactions: [
				{
					id: "d8a8c560401a11edb0ab5d4a3d51c5b3",
					amount: 6.9,
					sender: "00",
					recipient: "a47e3cd0401911edb0ab5d4a3d51c5b3",
				},
				{
					id: "e5662f40401a11edb0ab5d4a3d51c5b3",
					amount: 420,
					sender: "0F5G6DB76D5V6D6V8S79",
					recipient: "K6JK2K4J5K3J4K25K3G2VV",
				},
				{
					id: "e7db26e0401a11edb0ab5d4a3d51c5b3",
					amount: 69,
					sender: "0F5G6DB76D5V6D6V8S79",
					recipient: "K6JK2K4J5K3J4K25K3G2VV",
				},
			],
			nonce: 2758,
			hash: "00006a2d6a62a97bb607c31850e5423a134fc476ca94c6d03022a40f10ca47d5",
			previousBlockHash:
				"0000fb0cd9fdcf53bc5e01930a7b6209eba1c91c25cd1132b8d6b783fe6121a1",
		},
		{
			index: 4,
			timestamp: 1664472026508,
			transactions: [
				{
					id: "eb31cbf0401a11edb0ab5d4a3d51c5b3",
					amount: 6.9,
					sender: "00",
					recipient: "a47e3cd0401911edb0ab5d4a3d51c5b3",
				},
				{
					id: "f76879a0401a11edb0ab5d4a3d51c5b3",
					amount: 12,
					sender: "0F5G6DB76D5V6D6V8S79",
					recipient: "K6JK2K4J5K3J4K25K3G2VV",
				},
				{
					id: "f94772d0401a11edb0ab5d4a3d51c5b3",
					amount: 22,
					sender: "0F5G6DB76D5V6D6V8S79",
					recipient: "K6JK2K4J5K3J4K25K3G2VV",
				},
				{
					id: "fb1d4440401a11edb0ab5d4a3d51c5b3",
					amount: 32,
					sender: "0F5G6DB76D5V6D6V8S79",
					recipient: "K6JK2K4J5K3J4K25K3G2VV",
				},
				{
					id: "fd00f860401a11edb0ab5d4a3d51c5b3",
					amount: 42,
					sender: "0F5G6DB76D5V6D6V8S79",
					recipient: "K6JK2K4J5K3J4K25K3G2VV",
				},
			],
			nonce: 60725,
			hash: "00000530d827fd6ddb00415e15961d708916e88c78b1e99e7e41f69bfa0158e4",
			previousBlockHash:
				"00006a2d6a62a97bb607c31850e5423a134fc476ca94c6d03022a40f10ca47d5",
		},
		{
			index: 5,
			timestamp: 1664472035741,
			transactions: [
				{
					id: "024abae0401b11edb0ab5d4a3d51c5b3",
					amount: 6.9,
					sender: "00",
					recipient: "a47e3cd0401911edb0ab5d4a3d51c5b3",
				},
			],
			nonce: 47822,
			hash: "0000831fc8b10fa1b8daf5ab158434dbe94283d2ffffcbcadd7e5ce8d7e72335",
			previousBlockHash:
				"00000530d827fd6ddb00415e15961d708916e88c78b1e99e7e41f69bfa0158e4",
		},
		{
			index: 6,
			timestamp: 1664472036821,
			transactions: [
				{
					id: "07cb92f0401b11edb0ab5d4a3d51c5b3",
					amount: 6.9,
					sender: "00",
					recipient: "a47e3cd0401911edb0ab5d4a3d51c5b3",
				},
			],
			nonce: 6752,
			hash: "000076d7307b91181195d053e035d8d8f3b5c049383d5c6f1df2f5cde564f404",
			previousBlockHash:
				"0000831fc8b10fa1b8daf5ab158434dbe94283d2ffffcbcadd7e5ce8d7e72335",
		},
		{
			index: 7,
			timestamp: 1664472037986,
			transactions: [
				{
					id: "0870ac90401b11edb0ab5d4a3d51c5b3",
					amount: 6.9,
					sender: "00",
					recipient: "a47e3cd0401911edb0ab5d4a3d51c5b3",
				},
			],
			nonce: 66868,
			hash: "000046f17378fc4d529ef50baf2949fcc4eae8acc2b33e447a098be03d5ea3a5",
			previousBlockHash:
				"000076d7307b91181195d053e035d8d8f3b5c049383d5c6f1df2f5cde564f404",
		},
	],
	pendingTransactions: [
		{
			id: "09222240401b11edb0ab5d4a3d51c5b3",
			amount: 6.9,
			sender: "00",
			recipient: "a47e3cd0401911edb0ab5d4a3d51c5b3",
		},
	],
	currentNodeUrl: "http://localhost:3001",
	networkNodes: [],
};

console.log("VALID BLOCKCHAIN:",jsCoin.chainIsValid(bc1.chain))