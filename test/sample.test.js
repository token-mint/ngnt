// const { BN, constants, ether, expectEvent, expectRevert} = require('@openzeppelin/test-helpers');
// const NGNT = artifacts.require('NGNT');

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
    
//     beforeEach(async function () {
//         ngnt = await NGNT.new();
//         ngnt.initialize(tokenName, symbol, currency , decimals, masterMinter, pauser, blacklister, owner, gsnFee);
//     });

//     it("should behave well", async () => {
//         const minter = accounts[3];
//         const recipientA = accounts[2];
//         const recipientB = accounts[4];

//         console.log(await ngnt.name());
//         console.log((await ngnt.gsnFee()).toString());

//         //await ngnt.updateGsnFee(70, {from: owner});

//         await ngnt.configureMinter(minter, 5000, { from: masterMinter });

//         await ngnt.mint(minter, 500, { from: minter });

//         const res = await ngnt.transfer(recipientA, 50, { from: minter });
//         console.log(res);
//     });
// })