const { TestHelper } = require('@openzeppelin/cli');
const { Contracts, ZWeb3} = require('@openzeppelin/upgrades');

ZWeb3.initialize(web3.currentProvider);
const NGNT = Contracts.getFromLocal('NGNT');
const LimitedUpgradesProxyAdmin = Contracts.getFromLocal('LimitedUpgradesProxyAdmin');

const Chance = require('chance');
const chance = new Chance();

contract('LimitedUpgradesProxyAdmin', function (accounts) {
    let ngnt;
    let ngntProxy;
    let limitedUpgradesProxyAdmin;
    let project;
    let numberOfUpgrades;

    const tokenName = 'Naira Token';
    const symbol = 'NGNT';
    const currency = 'Naira';
    const decimals = 18;
    const masterMinter = accounts[0];
    const pauser = accounts[1];
    const blacklister = accounts[1];
    const owner = accounts[0];
    const gsnFee = 10;

    beforeEach(async function() {
        project = await TestHelper();
        numberOfUpgrades = chance.integer({min: 1, max: 10});
        limitedUpgradesProxyAdmin = await project.createMinimalProxy(LimitedUpgradesProxyAdmin, {
            initMethod: 'initialize',
            initArgs: [ owner, numberOfUpgrades]
        });

        const adminAddress = limitedUpgradesProxyAdmin.options.address;
        ngntProxy = await project.createProxy(NGNT, {
            initMethod: 'initialize',
            initArgs: [tokenName, symbol, currency , decimals, masterMinter, pauser, blacklister, owner, gsnFee],
            admin: adminAddress
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

    context('Test limited Upgrades Proxy Admin upgrade function', function () {
        let previousProxyAddress;
        let newImplementationAddress;

        it(`should upgrade proxy admin contract not more than ${numberOfUpgrades} times`, async function() {
            previousProxyAddress = ngntProxy.options.address;

            for(let upgrades = 1; upgrades <= numberOfUpgrades; upgrades++){
                ngnt = await NGNT.new({from: accounts[1], gas: 4600000});
                await ngnt.methods.initialize(tokenName, symbol, currency , decimals, masterMinter, pauser, blacklister, owner, gsnFee);
                newImplementationAddress = ngnt.options.address;

                await limitedUpgradesProxyAdmin.methods.upgrade(previousProxyAddress, newImplementationAddress).send({
                    from: owner, gas: 4600000, gasPrice: 1e6
                });

            }

            ngnt = await NGNT.new({from: accounts[1], gas: 4600000});
            await ngnt.methods.initialize(tokenName, symbol, currency , decimals, masterMinter, pauser, blacklister, owner, gsnFee);
            newImplementationAddress = ngnt.options.address;

            expect( async function (){
                await limitedUpgradesProxyAdmin.methods.upgrade(previousProxyAddress, newImplementationAddress).send({
                    from: owner, gas: 4600000, gasPrice: 1e6
                }).to.throw();
            })
        });

        it('should only be upgradable by owner', async () => {
            const notOwner = accounts[3];
            expect( async function (){
                await limitedUpgradesProxyAdmin.methods.upgrade(previousProxyAddress, newImplementationAddress).send({
                    from: notOwner, gas: 4600000, gasPrice: 1e6
                }).to.throw();
            })
        });
    });

    context('Test limited Upgrades Proxy Admin upgradeAndCall function', function () {
        let previousProxyAddress;
        let newImplementationAddress;
        let encodedInitializerFunction = web3.eth.abi.encodeFunctionCall({
            "name": "totalSupply",
            "type": "function",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ]
        }, []);

        it(`should upgrade proxy admin contract and call encodedFunction not more than ${numberOfUpgrades} times `, async function() {
            previousProxyAddress = ngntProxy.options.address;

            for(let upgrades = 1; upgrades <= numberOfUpgrades; upgrades++) {
                ngnt = await NGNT.new({from: accounts[1], gas: 4600000});
                newImplementationAddress = ngnt.options.address;

                await limitedUpgradesProxyAdmin.methods.upgradeAndCall(previousProxyAddress, newImplementationAddress, encodedInitializerFunction).send({
                    from: owner, gas: 4600000, gasPrice: 1e6
                });
            }

            ngnt = await NGNT.new({from: accounts[1], gas: 4600000});
            newImplementationAddress = ngnt.options.address;

            expect( async function (){
                await limitedUpgradesProxyAdmin.methods.upgrade(previousProxyAddress, newImplementationAddress, encodedInitializerFunction).send({
                    from: owner, gas: 4600000, gasPrice: 1e6
                }).to.throw();
            })
        });

        it('should not call upgradableAndCall by non contract owner', async () => {
            const notOwner = accounts[3];
            expect( async function (){
                await limitedUpgradesProxyAdmin.methods.upgradeAndCall(previousProxyAddress, newImplementationAddress, encodedInitializerFunction).send({
                    from: notOwner, gas: 4600000, gasPrice: 1e6
                }).to.throw();
            })
        });
    });
});