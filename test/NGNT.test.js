const { TestHelper } = require('@openzeppelin/cli');
const { Contracts, ZWeb3} = require('@openzeppelin/upgrades');

//global.web3 = web3;

ZWeb3.initialize(web3.currentProvider);

const NGNT = Contracts.getFromLocal('NGNT');

contract('NGNT', function (accounts) {
    let ngntProxy;

    beforeEach(async function() {
        console.log(accounts);
        const project = await TestHelper();
        ngntProxy = await project.createProxy(NGNT, {
            initMethod: 'initialize',
            initArgs: ['Nigerian Naira Token', 'NGNT', 'Naira', 1000, accounts[0], accounts[1], accounts[1], accounts[0], 10]
        });
    });

    it('should fetch contract name', async function() {
        const owner = ngntProxy.methods.name().call();
        console.log(owner)
    });
});