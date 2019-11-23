// const { registerRelay, deployRelayHub, fundRecipient, balance, runRelayer } = require('@openzeppelin/gsn-helpers');
// const { BN, constants, ether, expectEvent, expectRevert} = require('@openzeppelin/test-helpers');
// const gsn = require('@openzeppelin/gsn-helpers');
// const IRelayHub = artifacts.require('IRelayHub');
//
// const NGNT = artifacts.require('NGNT');
//
// contract("NGNT", function (accounts) {
//     let ngnt;
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
//     beforeEach(async function () {
//         ngnt = await NGNT.new();
//         await ngnt.initialize(tokenName, symbol, currency , decimals, masterMinter, pauser, blacklister, owner, gsnFee);
//
//
//         await deployRelayHub(web3, {
//             from: accounts[0]
//         });
//
//         await runRelayer({
//             relayUrl: 'http://localhost:8090',
//             workdir: process.cwd(),
//             devMode: true,
//             ethereumNodeURL: 'http://localhost:8545',
//             gasPricePercent: 0,
//             port: 8090,
//             quiet: true
//         });
//
//         await registerRelay(web3, {
//             relayUrl: 'http://localhost:8090',
//             stake: ether('1'),
//             unstakeDelay: 604800,
//             funds: ether('5'),
//             from: accounts[0]
//         });
//
//         await fundRecipient(web3, {
//             recipient: ngnt.address,
//             amount: ether('2'),
//             from: accounts[0]
//         });
//
//         const bal = await balance(web3, {
//             recipient: ngnt.address,
//         });
//         console.log(bal.toString());
//     });
//
//     context('when ngnt is called', function () {
//         beforeEach(async function () {
//             await gsn.fundRecipient(web3, { recipient: ngnt.address });
//             this.relayHub = await IRelayHub.at('0xD216153c06E857cD7f72665E0aF1d7D82172F494');
//         });
//
//         it("should behave well", async () => {
//             const minter = accounts[3];
//             const recipientA = accounts[2];
//             const recipientB = accounts[4];
//
//             console.log(await ngnt.name());
//             console.log((await ngnt.gsnFee()).toString());
//
//
//             // const ngntEthPreBalance = await this.relayHub.balanceOf(ngnt.address)
//
//             await ngnt.configureMinter(minter, 50000, { from: masterMinter });
//
//             await ngnt.mint(minter, 5000, { from: minter });
//
//             const {tx} = await ngnt.transfer(recipientA, 500, { from: minter , useGSN: true});
//             //const {tx} = await ngnt.updateGsnFee( 15, { from: minter , useGSN: true});
//
//             await expectEvent.inTransaction(tx, IRelayHub, 'TransactionRelayed', { status: '0' });
//
//             const senderPostBalance = await ngnt.balanceOf(minter);
//             expect(senderPostBalance.toString()).equal((5000-500-10).toString());
//             // console.log(tx);
//         });
//     });
//
// });