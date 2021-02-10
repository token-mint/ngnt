require("dotenv").config()
const {GSNProvider} = require("@openzeppelin/gsn-provider");
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
    networks: {
        development: {
            provider: function () {
                return new GSNProvider("http://localhost:8545", {useGSN: false})
            },
            network_id: "*",
            gas: 4600000
        },
        bsctestnet: {
            provider: () =>
              new HDWalletProvider(
                process.env.MNEMONIC,
                `https://data-seed-prebsc-1-s1.binance.org:8545`
              ),
            networkId: 97,
            gasPrice: 25000000000,
          },
          bscmainnet: {
            provider: () =>
              new HDWalletProvider(
                process.env.MNEMONIC,
                'https://bsc-dataseed.binance.org/'
              ),
            networkId: 56,
            gasPrice: 25000000000,
          }
    },

    compilers: {
        solc: {
            version: "0.5.5",
            docker: false,
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                },
                evmVersion: "byzantium"
            }
        }
    }
}
