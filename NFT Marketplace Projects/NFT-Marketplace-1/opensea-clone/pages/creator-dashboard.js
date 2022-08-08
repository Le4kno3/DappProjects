import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Web3Modal from "web3modal";
import Image from 'next/image';

import {
    nftTokenAddress, nftMarketplaceAddress, nftOtherTokenAddressN, Utilities
} from '../config';
import NFTToken from "../artifacts/contracts/NFTToken.sol/NFTToken.json";
import NFTMarket from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import OtherNFTToken from "../artifacts/contracts/OtherNFTToken.sol/OtherNFTToken.json";


export default function CreatorDashboard() {
    const [nfts, setNfts] = useState([]);
    const [sold, setSold] = useState([]);
    const [loadingState, setLoadingState] = useState('not-loaded');
    useEffect(() => {
        loadNFTs();
    }, []);

    async function loadNFTs() {
        const web3Modal = new Web3Modal(
            //     {
            //   network: "mainnet",
            //   cacheProvider: true,
            // }
        );
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        //create the contract instance using msg.sender's metamask account
        const myNFTMarket = new ethers.Contract(nftMarketplaceAddress, NFTMarket.abi, signer);
        const myNFTToken = new ethers.Contract(nftTokenAddress, NFTToken.abi, provider);
        //create an instance of the on-chain Other NFT Token contract using its on-chain address, interface and provider.
        const myOtherNFTToken = new ethers.Contract(
            nftOtherTokenAddressN,
            OtherNFTToken.abi,
            provider
        );

        const data = await myNFTMarket.fetchMyItemsCreated();

        const items = await Promise.all(
            data.map(async i => {
                //this code can be improved to take N number of different token,
                //by storing the token address and its abi in a data structure.
                //handle any nft Token contract
                if (i.nftContract == nftOtherTokenAddressN) {
                    const nftowner = await myOtherNFTToken.ownerOf(i.tokenId);
                    // console.log("The Other NFT (ID=", i.tokenId, ") owner is : ", nftowner);

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
        /* create a filtered array of items that have been sold */
        const soldItems = items.filter(i => i.sold);
        setSold(soldItems);
        setNfts(items);
        setLoadingState('loaded');
    }
    if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No assets created</h1>);
    return (
        <div>
            <div className="p-4">
                <h2 className="text-2xl py-2 bg-blue-600 text-white">Items Created</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    {
                        nfts.map((nft, i) => (
                            <div key={i} className="border shadow rounded-xl overflow-hidden">


                                <Image
                                    src={nft.image}
                                    alt="Picture of the author"
                                    className="rounded"
                                    width={300}
                                    height={300}
                                // blurDataURL="data:..." automatically provided
                                // placeholder="blur" // Optional blur-up while loading
                                />

                                <div className="p-4 bg-black">
                                    <p className="text-2xl font-bold text-white">Price - {nft.price} Eth</p>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
            <div className="px-4">
                {
                    Boolean(sold.length) && (
                        <div>
                            <h2 className="text-2xl py-2 bg-red-400">Items sold</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                                {
                                    sold.map((nft, i) => (
                                        <div key={i} className="border shadow rounded-xl overflow-hidden">
                                            <Image
                                                src={nft.image}
                                                alt="Picture of the author"
                                                className="rounded"
                                                width={300}
                                                height={300}
                                            // blurDataURL="data:..." automatically provided
                                            // placeholder="blur" // Optional blur-up while loading
                                            />
                                            <div className="p-4 bg-black">
                                                <p className="text-2xl font-bold text-white">Price - {nft.price} Eth</p>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    );
}