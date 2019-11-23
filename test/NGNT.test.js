// const { TestHelper } = require('@openzeppelin/cli');
// const { Contracts, ZWeb3} = require('@openzeppelin/upgrades');
// const {fromInjected } = require('@openzeppelin/network');
// const { BN, constants, ether, expectEvent, expectRevert} = require('@openzeppelin/test-helpers');
// const { registerRelay, deployRelayHub, fundRecipient, withdraw, runRelayer, balance, getRelayHub } = require('@openzeppelin/gsn-helpers');
//
// ZWeb3.initialize(web3.currentProvider);
// const NGNT = Contracts.getFromLocal('NGNT');
// const LimitedUpgradesProxyAdmin = Contracts.getFromLocal('LimitedUpgradesProxyAdmin');
//
// contract('NGNT', function (accounts) {
//     let ngntProxy;
//     let limitedUpgradesProxyAdmin;
//
//     const tokenName = 'Naira Token';
//     const symbol = 'NGNT';
//     const currency = 'Naira';
//     const decimals = 18;
//     const masterMinter = accounts[0];
//     const pauser = accounts[1];
//     const blacklister = accounts[1];
//     const owner = accounts[0];
//     const gsnFee = 10;
//
//     before(async function() {
//         try {
//             const project = await TestHelper();
//             limitedUpgradesProxyAdmin = await project.createMinimalProxy(LimitedUpgradesProxyAdmin, {
//                 initMethod: 'initialize',
//                 initArgs: [ owner, 1]
//             });
//
//             const adminAddress = limitedUpgradesProxyAdmin.options.address;
//             ngntProxy = await project.createProxy(NGNT, {
//                 initMethod: 'initialize',
//                 initArgs: [tokenName, symbol, currency , decimals, masterMinter, pauser, blacklister, owner, gsnFee],
//                 admin: adminAddress
//             });
//         } catch (error) {
//             console.log(error);
//         }
//     });
//
//     describe('contract should be properly initialized',  () => {
//         it('contract should have correct initialization values', async function() {
//             const _tokenName = await ngntProxy.methods.name().call();
//             const _symbol = await ngntProxy.methods.symbol().call();
//             const _currency = await ngntProxy.methods.currency().call();
//             const _decimals = await ngntProxy.methods.decimals().call();
//             const _masterMinter = await ngntProxy.methods.masterMinter().call();
//             const _pauser = await ngntProxy.methods.pauser().call();
//             const _blacklister = await ngntProxy.methods.blacklister().call();
//             const _owner = await ngntProxy.methods.owner().call();
//             const _gsnFee = await ngntProxy.methods.gsnFee().call();
//
//             assert.equal(_tokenName, tokenName);
//             assert.equal(_symbol,symbol);
//             assert.equal(_currency,currency);
//             assert.equal(_decimals,decimals);
//             assert.equal(_pauser,pauser);
//             assert.equal(_masterMinter,masterMinter);
//             assert.equal(_blacklister,blacklister);
//             assert.equal(_owner,owner);
//             assert.equal(_gsnFee,gsnFee);
//         });
//     });
//
//     describe('contract functions that should called by master minter only', () => {
//         const nonMasterMinter = accounts[9];
//         const minter = accounts[3];
//         const minterAllowedAmount = 100;
//
//         //add test for events later
//         // blocks should ne bases on roles
//         it('contract should not configure minter if function call not from master minter ', async function() {
//             expect( async function (){
//                 await ngntProxy.methods.configureMinter(minter, minterAllowedAmount).send({
//                     from: nonMasterMinter, gas: 50000, gasPrice: 1e6
//                 }).to.throw();
//             })
//         });
//
//     });
//
//     describe('')
// });