import { ethers } from "hardhat";
import * as fs from 'fs';

import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const Market = await ethers.getContractFactory("Market");
  const market = await Market.deploy();
  await market.deployed();
  console.log(`market contract deployed to ${market.address}`);

  const NFT = await ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(market.address);
  await nft.deployed();
  console.log(`nft contract deployed to ${nft.address}`);

  const rpc_url = process.env.MUMBAITESTNET_URL;

  let config = `
  export const nftmarketaddress = "${market.address}"
  export const nftaddress = "${nft.address}"
  export const rpc_url = "${rpc_url}"`;

  let data = JSON.stringify(config);
  fs.writeFileSync('cache/deploy.ts', JSON.parse(data));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
