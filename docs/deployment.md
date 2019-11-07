# Deployment Process

This details the steps involved in deploying the NGNT contract using [openzeppelin-cli](https://github.com/OpenZeppelin/openzeppelin-sdk). 
You can read more about the design we're trying to achieve in the [Token Design](tokendesign.md) 


### 1. Deploy Proxy Admin Owner

This should be a multisig wallet contract that will be the `owner` of the [proxy admin contract](https://github.com/buycoinsafrica/one-time-upgrade-proxy-admin).
We recommend (and use) [Gnosis MultiSigWallet](https://github.com/gnosis/MultiSigWallet) to deploy our multisig wallet contracts.


There are a few gotchas to keep in mind while using the MultiSigWallet tool:
- Do not use the online/hosted version of the tool, download or clone the repo and use the GUI from your local server/machine.
- You need to use Node.js v8.x.x otherwise `npm install` will not work.
- You need to use Node.js v8.5.x (and above but not v9) otherwise the application will not start.

### 2. Deploy Proxy Admin Contract

The [Proxy Admin contract](../contracts/ProxyAdmin.sol) is one that allows us to limit the amount of times a contract can get upgraded. 
NGNT will only be upgradeable **once**. You can read more on that [here](../README.md#upgradebility).

This contract will be deployed with the `--minimal` flag because we do not need it to be upgradeable. You can read more about this from the [openzepplin-cli docs](https://docs.openzeppelin.com/sdk/2.5/api/cli#create).
Upon deployment, the `initalize(address _owner, uint256 allowedUpgrades)` function MUST be called and the arguments should be set as follows:

1. The `_owner` should be the address of the proxy admin owner multisig contract that was deployed in the first step above.
2. `allowedUpgrades` should be set to 1.

### 3. Deploy NGNT Contract

Deploy the NGNT contract using `openzeppelin create` as one would normally do.
Immediately after, this function 
```
initialize(
    string memory _name, 
    string memory _symbol, 
    uint8 _decimals, 
    address _masterMinter, 
    address _pauser, 
    address _blacklister, 
    address _owner, 
    uint256 _gsnFee)
```

MUST be called and the arguments set as follows:

1. `_name`: Naira Token
2. `_symbol`: NGNT
3. `_decimals`: 2
4. `_masterMinter`, `_pauser`, `_blacklister`, `_owner` shall be (multisig contract) addresses obtained from Token Mint Center.
5. `gsnFee`: 5000

### 4. Set NGNT Contract Admin
Using [`openzeppelin-cli`'s `set-admin` command](https://docs.openzeppelin.com/sdk/2.5/api/cli#set-admin) to change the admin of
the NGNT Proxy contract to the address of the Proxy Admin contract deployed in [step 2](#2-deploy-proxy-admin-contract).

