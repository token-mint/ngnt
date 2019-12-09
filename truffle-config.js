const {GSNProvider} = require("@openzeppelin/gsn-provider");


module.exports = {
    networks: {
        development: {
            provider: function () {
                return new GSNProvider("http://localhost:8545", {useGSN: false})
            },
            network_id: "*",
            gas: 4600000
        },
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
