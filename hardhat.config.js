// hardhat.config.js
require("dotenv").config();

require("@nomiclabs/hardhat-ethers");
require('@openzeppelin/hardhat-upgrades');

const mnemonic = process.env.MNEMONIC;

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

 module.exports = {
  solidity: "0.6.2",
  networks: {
    bsctestnet: {
      url: `https://data-seed-prebsc-1-s1.binance.org:8545`,
      accounts: {mnemonic: mnemonic}
    }
  }
};