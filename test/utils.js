if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const HDNode = require('ethers').utils.HDNode;
const mnemonic = process.env.DEV_MNEMONIC;
const masterNode = HDNode.fromMnemonic(mnemonic);


const initializeFunctionParameters = [{
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
        {
            "name": "",
            "type": "uint256"
        }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
    }
];


function getSigningKey(index){
    const derivationPath = "m/44'/60'/0'/0/" + index.toString();
    const addressNode = masterNode.derivePath(derivationPath);
    return addressNode.privateKey;
}

module.exports = {
    initializeFunctionParameters,
    getSigningKey
};
