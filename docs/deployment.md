# Deployment Process

This details the steps involved in deploying the NGNT contract using [openzeppelin-cli](https://github.com/OpenZeppelin/openzeppelin-sdk). 
You can read more about the design we're trying to achieve in the [Token Design](tokendesign.md) 

### 1. Deploy Gnosis Safe contract

1. Clone https://github.com/Kifen/safe-contracts
2. Run npm install
3. Create .env - touch .env, and add MNEMONIC={BSC wallet mnemonic}
4. Run truffle compile
5. Deploy gnosis contract on BSC main net (and take note of the contract address):   truffle deploy --network bsctmainnet

### 2. Deploy NGNT Contract

1. Checkout to bep20 branch and run npm install
2. Create .env - touch .env, and add MNEMONIC={BSC wallet mnemonic}
3. Run oz compile
4. Deploy:  oz deploy 

	- 	select upgradeable
	-	select bscmainnet
	-	select NGNT
	-	enter Y
	- 	select initialize (ensure the parameters match that of NGNT initialize function) 
	-	Enter the token details as follows:

        `_name`: Naira Token
       `_symbol`: NGNT
        `_decimals`: 2
        `_masterMinter`, `_pauser`, `_blacklister`, `_owner` shall be (multisig contract) addresses obtained from Token Mint  Center.


### 3. Set NGNT Contract Admin to GnosisSafe
- Run: oz set-admin [NGNT proxy address] [address of new admin]
- Select bscmainnet

Finally, in the `.openzeppelin` folder, there's a `<network>.json` file (if you're deploying to Rinkeby, it'll be `rinkeby.json`).
Change the value of the `proxyAdmin`'s address (at the bottom of the file) to the address of your deployed `GnosisSafe` contract.
