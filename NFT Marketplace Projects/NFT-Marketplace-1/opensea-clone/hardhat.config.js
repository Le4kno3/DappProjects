require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

const fs = require("fs");
// const privateKey = process.env.PROJECT_SECRET;
// const projectId = process.env.PROJECT_ID;
// const endpoint = process.env.ENDPOINT;

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
// task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
//   const accounts = await hre.ethers.getSigners();

//   for (const account of accounts) {
//     console.log(account.address);
//   }
// });

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const privateKey = String(process.env.PRIVATE_KEY);

module.exports = {
  defaultNetwork: "mumbaiPolygonTestnet",
  networks: {
    hardhat: {
    },
    hardhat_local: {
      url: 'http://127.0.0.1:8545',
      accounts: [
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
        "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
        "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba"
      ],
      gas: 2100000,
      gasPrice: 8000000000
    },
    mumbaiPolygonTestnet: {
      url: process.env.MUMBAITESTNET_URL,
      accounts: [process.env.PRIVATE_KEY1, process.env.PRIVATE_KEY2, process.env.PRIVATE_KEY3],
      gas: 2100000,
      gasPrice: 8000000000
    }
  },
  // solidity: "0.8.4",
  solidity: {
    compilers: [
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ]
  },
};
