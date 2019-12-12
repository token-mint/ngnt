# Deployment Process

This details the steps involved in deploying the NGNT contract using [openzeppelin-cli](https://github.com/OpenZeppelin/openzeppelin-sdk). 
You can read more about the design we're trying to achieve in the [Token Design](tokendesign.md) 

### 1. Deploy Proxy Admin Contract

The [Limited Upgrades Proxy Admin contract](../contracts/LimitedUpgradesProxyAdmin.sol) is one that allows us to limit the amount of times a contract can get upgraded. 
NGNT will only be upgradeable **once**. You can read more on that [here](../README.md#upgradebility).

This contract will be deployed with the `--minimal` flag because we do not need it to be upgradeable. You can read more about this from the [openzepplin-cli docs](https://docs.openzeppelin.com/sdk/2.5/api/cli#create).
Upon deployment, the `initalize(address _owner, uint256 allowedUpgrades)` function MUST be called and the arguments should be set as follows:

1. The `_owner` should be an address that will be the transaction sender in step 2 below. This owner address will be able to upgrade the contract.
2. `allowedUpgrades` should be set to 1.

### 2. Deploy NGNT Contract

Deploy the NGNT contract using `openzeppelin create` as one would normally do.
Use `--from` to specify the transaction sender (this should be the same address as the `_owner` in step 1)

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

### 3. Set NGNT Contract Admin
Using [`openzeppelin-cli`'s `set-admin` command](https://docs.openzeppelin.com/sdk/2.5/api/cli#set-admin) to change the admin of
the NGNT Proxy contract to the address of your `LimitedUpgradesProxyAdmin` deployed in [step 2](#2-deploy-proxy-admin-contract).

Finally, in the `.openzeppelin` folder, there's a `<network>.json` file (if you're deploying to Rinkeby, it'll be `rinkeby.json`).
Change the value of the `proxyAdmin`'s address (at the bottom of the file) to the address of your deployed `LimitedUpgradesProxyAdmin` contract.
