import * as dotenv from "dotenv";
import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-toolbox";

dotenv.config();
const privateKey = String(process.env.PRIVATE_KEY);

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.15",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ]
  },
  defaultNetwork: "hardhat", //hardhat-network-helpers: can only be used in "hardhat" or the "runtime" network. If you want to run the test script on some other blockchain, make sure to remove the use of this library.
  networks: {
    hardhat: {
      chainId: 31337
    },
    hardhat_local_node: {
      url: "http://localhost:8545",
      accounts: ["0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"],
      chainId: 80001,
      gasPrice: 470000000000,
    },
    polygon_mumbai_testnet: {
      url: process.env.MUMBAITESTNET_URL,
      accounts: [privateKey],
      chainId: 80001,
      gasPrice: 470000000000,
    },
    // polygon_mainnet: {},
    /* avalanche_testnet_fuji: {
      url: 'https://api.avax-test.network/ext/bc/C/rpc',
      gasPrice: 470000000000,
      chainId: 43113,
      accounts: []
    },
    avalanche_mainnet: {
      url: 'https://api.avax.network/ext/bc/C/rpc',
      gasPrice: 470000000000,
      chainId: 43114,
      accounts: []
    } */

    // ropsten: {
    //   url: process.env.ROPSTEN_URL || "",
    //   accounts:
    //     privateKey !== undefined ? [privateKey] : [],
    // },
  },
};

export default config;
