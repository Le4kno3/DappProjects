import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import Image from 'next/image';
import NFTToken from "../artifacts/contracts/NFTToken.sol/NFTToken.json";
import NFTMarket from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import OtherNFTToken from "../artifacts/contracts/OtherNFTToken.sol/OtherNFTToken.json";

import { Headers } from "./headers.js";
import { nftTokenAddress, nftMarketplaceAddress, nftOtherTokenAddressN, Utilities, availableVouchers } from "../config";
import { messagePrefix } from "@ethersproject/hash";

const Home = () => {
  //Refresh page if any new nft is listed or sold on the NFT Marketplace
  const [nfts, setNfts] = useState([]);
  //Blockchain transaction takes time to execute, hence we always need a state which resets to "not-loaded", 
  //and when the transaction finished execution, refresh the page.
  const [loadingState, setLoadingState] = useState("not-loaded");


  //kind of like automatic run the function "loadNFTs", it will not be executed automatically in state change., after the state is updated.
  useEffect(() => {
    loadNFTs();
  }, []);

  const loadNFTs = async () => {
    //fetches the default provider from hardhat.config.js
    // const provider = new ethers.providers.JsonRpcProvider();
    const provider = ethers.getDefaultProvider();

    //create an instance of the on-chain NFT Token contract using its on-chain address, interface and provider.
    const myNFTToken = new ethers.Contract(
      nftTokenAddress,
      NFTToken.abi,
      provider
    );

    //create an instance of the on-chain Other NFT Token contract using its on-chain address, interface and provider.
    const myOtherNFTToken = new ethers.Contract(
      nftOtherTokenAddressN,
      OtherNFTToken.abi,
      provider
    );

    //create an instance of the on-chain NFT Marketplace contract using its on-chain address, interface and provider.
    const myNFTMarket = new ethers.Contract(
      nftMarketplaceAddress,
      NFTMarket.abi,
      provider
    );

    //returns an array of unsold market items
    const data = await myNFTMarket.fetchRemainingMarketItems();

    //transform the result as per our need + any additions
    const items = await Promise.all(
      data.map(async i => {
        //this code can be improved to take N number of different token,
        //by storing the token address and its abi in a data structure.
        //handle any nft Token contract
        if (i.nftContract == nftOtherTokenAddressN) {
          const nftowner = await myOtherNFTToken.ownerOf(i.tokenId);
          console.log("The Other NFT (ID=", i.tokenId, ") owner is : ", nftowner);

          const tokenUri = await myOtherNFTToken.tokenURI(i.tokenId);
          //fetch metadata related to the image.
          const meta = await axios.get(tokenUri);

          let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
          let item = {
            price,
            tokenId: i.tokenId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            image: meta.data.image,
            name: meta.data.name,
            description: meta.data.description,
            nftContract: i.nftContract,
            utility: Utilities[parseInt(meta.data.utility)]
          };
          return item;
        }
        if (i.nftContract == nftTokenAddress) {
          const tokenUri = await myNFTToken.tokenURI(i.tokenId);
          //fetch metadata related to the image.
          const meta = await axios.get(tokenUri);

          let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
          let item = {
            price,
            tokenId: i.tokenId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            image: meta.data.image,
            name: meta.data.name,
            description: meta.data.description,
            utility: Utilities[parseInt(meta.data.utility)]
          };
          return item;
        }
      })
    );

    setNfts(items);
    setLoadingState('loaded');


  };

  async function buyNFT(nft) {
    // If we use the below it will directly connect to our local ethereum blockchain, but we don't want that.
    // const provider = new ethers.providers.JsonRpcProvider();
    // We want that any transaction that requires money to be send must use metamask
    //to do so we need to use "Web3Modal();"
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    //get msg.sender wallet
    //this will be the buyer address
    const signer = provider.getSigner();

    //buyer should not be the seller of the NFT token.

    let currentVoucher = '';

    //create an instance of the on-chain NFT Token contract using its on-chain address, interface and provider.
    const myNFTToken = new ethers.Contract(
      nftTokenAddress,
      NFTToken.abi,
      signer
    );

    //create an instance of the on-chain Other NFT Token contract using its on-chain address, interface and provider.
    const myOtherNFTToken = new ethers.Contract(
      nftOtherTokenAddressN,
      OtherNFTToken.abi,
      provider
    );

    //create an instance of the on-chain NFT Marketplace contract using its on-chain address, interface and provider.
    const myNFTMarket = new ethers.Contract(
      nftMarketplaceAddress,
      NFTMarket.abi,
      signer
    );

    //This will store the tokenURI data
    const nftTokenId = nft.tokenId;
    let nftTokenUri = '';
    let meta = '';

    //get the price of nft token to buy
    // const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');
    const price = ethers.utils.parseEther(nft.price.toString());

    console.log(nft);

    if (nft.nftContract == nftOtherTokenAddressN) {
      //fetch data and meta data
      nftTokenUri = await myOtherNFTToken.tokenURI(nftTokenId);
      meta = await axios.get(nftTokenUri);

      const nftowner = await myOtherNFTToken.getApproved(nftTokenId);
      console.log("The Other NFT owner is : ", nftowner);
      //buy the token
      const transaction = await myNFTMarket.createMarketSale(nftOtherTokenAddressN, nft.tokenId, {
        value: price
      });
      await transaction.wait();
    }

    if (nft.nftContract == nftTokenAddress) {
      //fetch data and meta data
      nftTokenUri = await myNFTToken.tokenURI(nftTokenId);

      const nftowner = await myNFTToken.getApproved(nftTokenId);
      console.log("The NFT owner is : ", nftowner);

      //buy the token
      const transaction = await myNFTMarket.connect(signer).createMarketSale(nftTokenAddress, nft.tokenId, {
        value: price
      });
      await transaction.wait();
    }

    //update the user database entry
    //get the signers address
    // const signerAddress = (await signer.getAddress()).toString();

    //check if offer applicable - currently only checks for the `1` offer.
    meta = await axios.get(nftTokenUri);
    const utilityId = meta.data.utility;
    if (utilityId === '1') {
      //if vouchers avaiable
      if (availableVouchers.length > 0) {
        currentVoucher = availableVouchers.pop();
        console.log('Your Voucher is:', currentVoucher);
      }
    }

    //as there is no state change done, we need to refresh manually.
    loadNFTs();
  };

  if (loadingState == 'loaded' && !nfts.length) return (
    <h1 className="px-20 py-10 text-3xl">No items found in marketplace.</h1>
  );

  return (
    <>
      {/* <Headers /> */}
      <div className="flex justify-center">
        <div className="px-4" style={{ maxWidth: '1600px' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {
              nfts.map((nft, i) => (
                <div key={i} className="border shadow rounded-xl overflow-hidden">
                  <Image
                    src={nft.image}
                    alt="Picture of the author"
                    width={500}
                    height={500}
                  />
                  <div className="p-4">
                    <p style={{ height: '64px' }} className="text-2xl font-semi">
                      {nft.name}
                    </p>
                    <div style={{ height: '70px', overflow: 'hidden' }}>
                      <p className="text-gray-400">{nft.description}</p>
                    </div>
                    <div style={{ height: '70px', overflow: 'hidden' }}>
                      <p className="text-purple-500">Offer: {nft.utility}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-black">
                    <p className="text-2xl mb-4 font-bold text-white">{nft.price} ETH</p>
                    <button className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNFT(nft)}>Buy NFT</button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </>
  );
};
export default Home;
