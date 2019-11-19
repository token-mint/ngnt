const { TestHelper } = require('@openzeppelin/cli');
const { Contracts, ZWeb3} = require('@openzeppelin/upgrades');
const { fromConnection } = require('@openzeppelin/network');
const { BN, constants, ether, expectEvent, expectRevert} = require('@openzeppelin/test-helpers');
const { registerRelay, deployRelayHub, fundRecipient, withdraw, runRelayer, balance, getRelayHub } = require('@openzeppelin/gsn-helpers');

ZWeb3.initialize(web3.currentProvider);
const NGNT = Contracts.getFromLocal('NGNT');
const NGNTJson = require("../build/contracts/NGNT.json");

contract('NGNT', function (accounts) {
    let ngntProxy;
    let ngntAddress;
    let context;
    let ngntInstance;
    let ngntInstanceWithGSN;

    const tokenName = 'Naira Token';
    const symbol = 'NGNT';
    const currency = 'Naira';
    const decimals = 18;
    const masterMinter = accounts[0];
    const pauser = accounts[1];
    const blacklister = accounts[1];
    const owner = accounts[0];
    const gsnFee = 10; 

    before(async function() {
        try {
            const project = await TestHelper();
            ngntProxy = await project.createProxy(NGNT, {
                initMethod: 'initialize',
                initArgs: [tokenName, symbol, currency , decimals, masterMinter, pauser, blacklister, owner, gsnFee]
            });
            
            ngntAddress = ngntProxy.options.address;
            // await fundRecipient(web3, {
            //     recipient: ngntProxy.options.address, 
            //     amount: ether('1'),
            //     from: accounts[0]
            // });

            const localWeb3WithGSN = await fromConnection('http://127.0.0.1:8545', {gsn: {dev: true }});
            const {lib} = localWeb3WithGSN;
            
            ngntInstanceWithGSN = new lib.eth.Contract(NGNTJson.abi, ngntProxy.options.address);
            const fund = await fundRecipient(web3, {
                recipient: ngntInstanceWithGSN.options.address
            });
            console.log(fund.toString(), 'was funded');
        } catch (error) {
            console.log(error);
        }
    });

    // beforeEach(async function() {
    //     const project = await TestHelper();
    //     ngntProxy = await project.createProxy(NGNT, {
    //         initMethod: 'initialize',
    //         initArgs: [tokenName, symbol, currency , decimals, masterMinter, pauser, blacklister, owner, gsnFee]
    //     });
    // });

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

    describe('contract functions that should called by master minter only', () => {
        const nonMasterMinter = accounts[9];
        const minter = accounts[3];
        const minterAllowedAmount = 100;

        //add test for events later
        // blocks should ne bases on roles
        it('contract should not configure minter if function call not from master minter ', async function() {
            expect( async function (){
                await ngntProxy.methods.configureMinter(minter, minterAllowedAmount).send({
                    from: nonMasterMinter, gas: 50000, gasPrice: 1e6
                }).to.throw();
            })
        });

        //it('conrtact should configure master minter from')
    });

    describe('contract should be act correctly as a GSN recipient', () => {
        it('jhdafba', async() => {
            const minter = accounts[3];
            console.log(await ngntInstanceWithGSN.methods.getHubAddr().call());
            const bal = await balance(web3, {
                recipient: ngntInstanceWithGSN.options.address,
              });
              console.log(bal);
            
            await ngntInstanceWithGSN.methods.updateGsnFee(50).send({
                from: owner
            });

            // await ngntInstanceWithGSN.methods.mint(minter, 5000).send({
            //     from: nonMasterMinter, gas: 50000, gasPrice: 1e6
            // })

            // console.log(await ngntInstanceWithGSN.methods.transfer(accounts[2], 5).send({
            //     from: minter
            // }));
        });
        // const from = accounts[2];
        // const recipient = ngntAddress;
        // const transactionFee = 10;
        // const gasPrice = 10;
        // const gasLimit = 1000000;
        // const nonce = 0
        // const approvalData = "0x";


        // const _to = accounts[2];
        // const _value = 30;
        // const encodedTransferFunction = web3.eth.abi.encodeFunctionCall({
        //     name: "transfer",
        //     type: "function",
        //     inputs: [{
        //         type: "address",
        //         name: "_to"
        //     },{
        //         type: "uint256",
        //         name: "_value"
        //     }]
        // }, [_to, _value]);
        // console.log(encodedTransferFunction);


        // const relayHub = getRelayHub(web3);
        // it('should get the correct relay hub', async() => {
        //     assert.equal(relayHub.options.address, "0xD216153c06E857cD7f72665E0aF1d7D82172F494");
        // });

        // it('should relay the transfer call to the NGNT contract', async() => {
        //     const transaction = ngntProxy.methods.transfer(accounts[2], 30).encodeABI();
        //     console.log(transaction);
        //     //const digest = await utils.getTransactionHash(from, to, )

        // });
    });
});