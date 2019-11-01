const { TestHelper } = require('@openzeppelin/cli');
const { Contracts, ZWeb3} = require('@openzeppelin/upgrades');

ZWeb3.initialize(web3.currentProvider);
const NGNT = Contracts.getFromLocal('NGNT');

contract('NGNT', function (accounts) {
    let ngntProxy;
    const tokenName = 'Nigerian Naira Token';
    const symbol = 'NGNT';
    const currency = 'Naira';
    const decimals = 100;
    const masterMinter = accounts[0];
    const pauser = accounts[1];
    const blacklister = accounts[1];
    const owner = accounts[0];
    const gsnFee = 10;

    beforeEach(async function() {
        console.log(accounts);
        const project = await TestHelper();
        ngntProxy = await project.createProxy(NGNT, {
            initMethod: 'initialize',
            initArgs: [tokenName, symbol, currency , decimals, masterMinter, pauser, blacklister, owner, gsnFee]
        });
    });

    describe('contract should be properly initialized',  () => {
        it('contract should have correct initialization values', async function() {
            const _tokenName = await ngntProxy.methods.name().call();
            const _symbol = await ngntProxy.methods.symbol().call();
            const _currency = await ngntProxy.methods.currency().call();
            const _decimals = await ngntProxy.methods.decimals().call();
            const _masterMinter = await ngntProxy.methods.masterMinter().call();
            const _pauser = await ngntProxy.methods.pauser().call();
            const _blacklister = await ngntProxy.methods.blacklister().call();
            const _owner = await ngntProxy.methods.owner().call();
            const _gsnFee = await ngntProxy.methods.gsnFee().call();

            assert.equal(_tokenName, tokenName);
            assert.equal(_symbol,symbol);
            assert.equal(_currency,currency);
            assert.equal(_decimals,decimals);
            assert.equal(_pauser,pauser);
            assert.equal(_masterMinter,masterMinter);
            assert.equal(_blacklister,blacklister);
            assert.equal(_owner,owner);
            assert.equal(_gsnFee,gsnFee);
        });
    });

    describe('contract should configure a minter', () => {
        const nonMasterMinter = accounts[9];
        const minter = accounts[3];
        const minterAllowedAmount = 100;

        //add test for events later
        it('contract should not configure minter', async function() {
            expect( async function (){
                await ngntProxy.methods.configureMinter(minter, minterAllowedAmount).send({
                    from: nonMasterMinter, gas: 50000, gasPrice: 1e6
                }).to.throw();
            })
        });
    });

});