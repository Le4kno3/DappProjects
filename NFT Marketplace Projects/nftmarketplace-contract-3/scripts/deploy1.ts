import * as fs from 'fs';
import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {

  const [owner, nftbuyer, nftseller] = await ethers.getSigners();
  // Promise<ethers.Signer[]>
  // We get the contract to deploy

  const NFTMarket = await ethers.getContractFactory("NFTMarket", owner);
  const myNFTMarket = await NFTMarket.deploy();
  await myNFTMarket.deployed();

  const signerAddress = await owner.getAddress();
  const nftBuyerAddress = await nftbuyer.getAddress();
  const nftSellerAddress = await nftseller.getAddress();
  console.log("Owner address:", signerAddress);
  console.log("NFT buyer address:", nftBuyerAddress);
  console.log("NFT seller address:", nftSellerAddress);
  console.log("NFTMarket contract deployed to:", myNFTMarket.address);

  // We get the contract to deploy
  const NFTToken = await ethers.getContractFactory("NFTToken", owner);
  const myNFTToken = await NFTToken.deploy(myNFTMarket.address);

  await myNFTToken.deployed();

  console.log("NFTToken contract deployed to:", myNFTToken.address);

  let config = `
  export const nftMarketplaceAddress = "${myNFTMarket.address}"
  export const nftTokenAddress = "${myNFTToken.address}"
  export const nftContractOwner = "${signerAddress}"
  export const nftBuyer = "${nftBuyerAddress}"
  export const nftSeller = "${nftSellerAddress}"`;

  let data = JSON.stringify(config);
  fs.writeFileSync('cache/deploy.ts', JSON.parse(data));
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });