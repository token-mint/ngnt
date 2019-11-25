# OpenZeppelin SDK
This project makes use of the [openzeppelin-sdk](https://github.com/OpenZeppelin/openzeppelin-sdk) for compiling, 
upgrading, deploying and interacting with the contracts.

## Upgradeable Contracts

OpenZeppelin SDK allows one to create and deploy **upgradeable** contracts. 
You can read more about how this works in the [OpenZeppelin docs](https://docs.openzeppelin.com/sdk/2.5/pattern.html).

# Gas Station Network Intro
The [Gas Station Network](https://docs.openzeppelin.com/openzeppelin/gsn/faq.html) (GSN) is a decentralized network of relayers which can be used to sign and send Ethereum transactions without
 the original sender (the end-users) paying for gas.
 
This is particularly useful for NGNT's use-case because gas is usually paid in Ether. 
Having to acquire and store Ether before being able to transfer tokens (especially one like NGNT) is a difficult, generally bad user experience.

The main contract `NGNT.sol` inherits from `GSNRecipient` and as such, can accept transactions from Relayers on the Gas Station Network. 
More on this below. 

# Contracts

## NGNT

The main contract `NGNT.sol` implements the ERC20 interface. It also offers other abilities, which will be briefly explained below.
There are more [detailed design docs](./docs/tokendesign.md) in the `docs` folder.

Other things peculiar to the NGNT contract are as follows.

### GSN

NGNT's implementation of GSN only accepts relayed calls for the `transfer`, `transferFrom` and `approve`.
This simply means that it is possible to call those functions without paying Ether for gas. 
 
However, users will still get charged for these transactions in NGNT. 
The amount of NGNT that will be charged is determined by the `gsnFee`. The purpose of said fee is to balance out the cost of paying for the transfers in Ether on behalf of the users.
The `gsnFee` amount is currently determined and can be updated manually by the contract `owner` because of Ether price and fiat exchange rate fluctuations. 
We're currently researching the possibility of an automatic and onchain mechanism for updating this fee. 


### Upgradebility

The NGNT token contract will be upgradeable **just once**. This is achieved by restrictions in the [`ProxyAdmin.sol`](contracts/LimitedUpgradesProxyAdmin.sol) contract that will be deployed and set as the Proxy contract's Admin.
The motivation for this decision is to retain the advantages of the immutability of the smart contracts while still giving us the opportunity to effect any (or all) of the following changes:

1. GSN is still relatively new technology, we think it is a good idea to allow for the opportunity to fix any major vulnerability that may be found.
2. We would love to be able to implement an automatic and onchain mechanism for updating the `gsnFee`. 

Details about deployment and upgrading can be found [here](./docs/deployment.md)

## Other Capabilities

The capabilites touched on below are a clone from Centre's [USDC](https://www.centre.io/usdc) token design 
as at [this commit](https://github.com/centrehq/centre-tokens/commit/3ba876b5e96eec6955733e7e008d85f419ec44a5) (from the master branch).

### ERC20 compatible
The FiatToken implements the ERC20 interface.

### Pausable
The entire contract can be frozen, in case a serious bug is found or there is a serious key compromise. No transfers can take place while the contract is paused.
Access to the pause functionality is controlled by the `pauser` address.

### Blacklist
The contract can blacklist certain addresses which will prevent those addresses from transferring or receiving tokens.
Access to the blacklist functionality is controlled by the `blacklister` address.

### Minting/Burning
Tokens can be minted or burned on demand. The contract supports having multiple minters simultaneously. There is a
`masterMinter` address which controls the list of minters and how much each is allowed to mint. The mint allowance is
similar to the ERC20 allowance - as each minter mints new tokens their allowance decreases. When it gets too low they will
need the allowance increased again by the `masterMinter`.

### Ownable
The contract has an Owner, who can change the `owner`, `pauser`, `blacklister`, or `masterMinter` addresses. The `owner` can not change
the `proxyOwner` address.

## Running Tests
To run the tests, in the project path on your terminal, run `npm test`