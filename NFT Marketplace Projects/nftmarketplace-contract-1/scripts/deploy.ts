import { ethers } from "hardhat";
// import { ethers } from "@nomiclabs/hardhat-ethers";
import fs from "fs";

async function main() {

  const [signer] = await ethers.getSigners();
  // Promise<ethers.Signer[]>
  // We get the contract to deploy

  const NFTMarket = await ethers.getContractFactory("NFTMarket");
  const myNFTMarket = await NFTMarket.deploy();
  await myNFTMarket.deployed();

  const signerAddress = await signer.getAddress();
  console.log("Owner address:", signerAddress);
  console.log("NFTMarket contract deployed to:", myNFTMarket.address);

  // We get the contract to deploy
  const NFTToken = await ethers.getContractFactory("NFTToken");
  const myNFTToken = await NFTToken.deploy(myNFTMarket.address);

  await myNFTToken.deployed();

  console.log("NFTToken contract deployed to:", myNFTToken.address);

  //Mint A token from other contract.
  const OtherNFTToken = await ethers.getContractFactory("OtherNFTToken");
  const myOtherNFTToken = await OtherNFTToken.deploy();

  await myOtherNFTToken.deployed();

  console.log("OtherNFTToken contract deployed to:", myOtherNFTToken.address);

  let config = `
  export const nftMarketplaceAddress = "${myNFTMarket.address}"
  export const nftTokenAddress = "${myNFTToken.address}"
  export const nftOtherTokenAddress = "${myOtherNFTToken.address}"
  `;

  let data = JSON.stringify(config);
  fs.writeFileSync('cache/deploy.js', JSON.parse(data));
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });