import { HardhatUserConfig } from "hardhat/config";
// import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const account1: string = String(process.env.PRIVATE_KEY1);
const account2: string = String(process.env.PRIVATE_KEY2);
const account3: string = String(process.env.PRIVATE_KEY3);

const config: HardhatUserConfig = {
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
      accounts: [account1, account2, account3],
      gas: 2100000,
      gasPrice: 8000000000
    }
  },
  solidity: "0.8.4",
};

export default config;
