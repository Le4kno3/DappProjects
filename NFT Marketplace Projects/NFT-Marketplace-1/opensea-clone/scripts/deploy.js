// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
// const hre = require("hardhat");
const fs = require("fs");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // const provider = new network.providers.JsonRpcProvider();

  //the first private key in hardhat.config.js is the owner of
  //both NFTMarket and NFT Token contracts
  const signer = ethers.provider.getSigner();
  // We get the contract to deploy

  const NFTMarket = await ethers.getContractFactory("NFTMarket", signer);
  const myNFTMarket = await NFTMarket.deploy();
  await myNFTMarket.deployed();

  const signerAddress = await signer.getAddress();
  console.log("Owner address:", signerAddress);
  console.log("NFTMarket contract deployed to:", myNFTMarket.address);

  // We get the contract to deploy
  const NFTToken = await hre.ethers.getContractFactory("NFTToken", signer);
  const myNFTToken = await NFTToken.deploy(myNFTMarket.address);

  await myNFTToken.deployed();

  console.log("NFTToken contract deployed to:", myNFTToken.address);

  //Mint A token from other contract.
  const OtherNFTToken = await hre.ethers.getContractFactory("OtherNFTToken", signer);
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
