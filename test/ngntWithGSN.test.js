const {registerRelay, deployRelayHub, fundRecipient, balance, runRelayer} = require('@openzeppelin/gsn-helpers');
const {BN, constants, ether, expectEvent, expectRevert} = require('@openzeppelin/test-helpers');
const gsn = require('@openzeppelin/gsn-helpers');
const IRelayHub = artifacts.require('IRelayHub');

const NGNT = artifacts.require('NGNT');

contract("NGNT with GSN", function (accounts) {
    let ngnt;
    const tokenName = 'Naira Token';
    const symbol = 'NGNT';
    const currency = 'Naira';
    const decimals = 18;
    const masterMinter = accounts[0];
    const pauser = accounts[1];
    const blacklister = accounts[1];
    const owner = accounts[0];
    const minter = accounts[3];
    const minterAllowedAmount = 50000;
    let mintedAmount = 5000;
    const gsnFee = 10;

    before(async function () {
        ngnt = await NGNT.new();
        await ngnt.initialize(tokenName, symbol, currency, decimals, masterMinter, pauser, blacklister, owner, gsnFee);


        await deployRelayHub(web3, {
            from: accounts[0]
        });

        await runRelayer({
            relayUrl: 'http://localhost:8090',
            workdir: process.cwd(),
            devMode: true,
            ethereumNodeURL: 'http://localhost:8545',
            gasPricePercent: 0,
            port: 8090,
            quiet: true
        });

        await registerRelay(web3, {
            relayUrl: 'http://localhost:8090',
            stake: ether('1'),
            unstakeDelay: 604800,
            funds: ether('5'),
            from: accounts[0]
        });

        await fundRecipient(web3, {
            recipient: ngnt.address,
            amount: ether('2'),
            from: accounts[0]
        });
    });

    context('when transfer is called', function () {
        beforeEach(async function () {
            await gsn.fundRecipient(web3, {recipient: ngnt.address});
            this.relayHub = await IRelayHub.at('0xD216153c06E857cD7f72665E0aF1d7D82172F494');

            await ngnt.configureMinter(minter, minterAllowedAmount, {from: masterMinter});
            await ngnt.mint(minter, mintedAmount, {from: minter});
        });

        it("should transfer the right amount of tokens", async () => {
            const transferAmount = mintedAmount - gsnFee;
            const recipient = accounts[2];

            const recipientPreviousBalance = await ngnt.balanceOf(recipient);


            const {tx} = await ngnt.transfer(recipient, transferAmount, {
                from: minter,
                useGSN: true
            });

            await expectEvent.inTransaction(tx, IRelayHub, 'TransactionRelayed', {status: '0'});

            const senderNewBalance = await ngnt.balanceOf(minter);
            const recipientNewBalance = await ngnt.balanceOf(recipient);

            // TODO: Fix issues with chai bignumber
            // expect(senderNewBalance).to.be.a.bignumber.that.equals(mintedAmount - transferAmount);
            // expect(recipientNewBalance).to.be.a.bignumber.that.equals(recipientPreviousBalance + transferAmount);
            expect(senderNewBalance.toString()).equals((mintedAmount - transferAmount).toString());
        });

        context('when the sender does not have enough tokens', async () => {

            it("should reject the transaction", async () => {
                const transferAmount = mintedAmount; // will be less than required because of  gsnFee
                const recipient = accounts[2];

                expect(async function () {
                    await ngnt.transfer(recipient, transferAmount, {
                        from: minter,
                        useGSN: true
                    }).to.throw();
                })
            });
        });
    });


    context('when approve is called', function () {
        beforeEach(async function () {
            mintedAmount = gsnFee;
            await gsn.fundRecipient(web3, {recipient: ngnt.address});
            this.relayHub = await IRelayHub.at('0xD216153c06E857cD7f72665E0aF1d7D82172F494');

            await ngnt.configureMinter(minter, minterAllowedAmount, {from: masterMinter});
            await ngnt.mint(minter, mintedAmount, {from: minter});
        });

        it("should approve spender without any issues", async () => {
            const allowedAmount = 1000;
            const spender = accounts[4];


            const {tx} = await ngnt.approve(spender, allowedAmount, {
                from: minter,
                useGSN: true
            });

            await expectEvent.inTransaction(tx, IRelayHub, 'TransactionRelayed', {status: '0'});

            const allowance = await ngnt.allowance(minter, spender);

            // TODO: Use bignumber equals
            expect(allowance.toString()).equals((allowedAmount).toString());

        });

        context('when the user does not have up to gsnFee', async () => {
            beforeEach(async function () {
                mintedAmount = gsnFee - 1;
                await gsn.fundRecipient(web3, {recipient: ngnt.address});
                this.relayHub = await IRelayHub.at('0xD216153c06E857cD7f72665E0aF1d7D82172F494');

                await ngnt.configureMinter(minter, minterAllowedAmount, {from: masterMinter});
                await ngnt.mint(minter, mintedAmount, {from: minter});
            });

            it("should reject the transaction", async () => {
                const allowedAmount = 1000;
                const spender = accounts[4];

                expect(async function () {
                    await ngnt.approve(spender, allowedAmount, {
                        from: minter,
                        useGSN: true
                    }).to.throw();
                })
            });
        });
    });

    context('when a function that is not approve, transfer or transferFrom is called', function () {
        beforeEach(async function () {
            await gsn.fundRecipient(web3, {recipient: ngnt.address});
            this.relayHub = await IRelayHub.at('0xD216153c06E857cD7f72665E0aF1d7D82172F494');
        });

        it("should work without GSN", async () => {
            expect(async function () {
                await ngnt.totalSupply({
                    from: minter
                }).to.not.throw();
            })
        });

        it("should reject the transaction with GSN", async () => {
            expect(async function () {
                await ngnt.totalSupply({
                    from: minter,
                    useGSN: true
                }).to.throw();
            })
        });
    });

});
