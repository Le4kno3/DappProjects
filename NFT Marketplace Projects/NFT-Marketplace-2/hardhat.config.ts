import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from 'dotenv';
dotenv.config();

const PrivateKey: string = String(process.env.PRIVATEKEY);

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  defaultNetwork: "polygonMumbai_testnet",
  networks: {
    polygonMumbai_testnet: {
      url: process.env["NODE_URL"],
      accounts: [PrivateKey]
    }
  }
};



export default config;
