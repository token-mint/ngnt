const RelayedCallHelper = artifacts.require('RelayedCallHelper.sol');
const NGNT = artifacts.require('NGNT.sol');

module.exports = function (deployer) {
    deployer.deploy(RelayedCallHelper).then(() => {
        deployer.link(RelayedCallHelper, NGNT);
        return deployer.deploy(NGNT);
    });
};