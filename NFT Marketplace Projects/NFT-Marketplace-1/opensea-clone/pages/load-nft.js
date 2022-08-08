import React, { useState, useRef } from 'react';
import { Field, reduxForm } from 'redux-form';
import { ethers } from 'ethers';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { useRouter } from 'next/router';
import Web3Modal from 'web3modal';
import Image from 'next/image';
import { Utilities } from '../config';
// import { EtherscanProvider } from '@ethersproject/providers';
import { nftTokenAddress, nftMarketplaceAddress, nftOtherTokenAddress } from '@cache/deploy';
import NFTToken from "../artifacts/contracts/NFTToken.sol/NFTToken.json";
import NFTMarket from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import OtherNFTToken from "../artifacts/contracts/OtherNFTToken.sol/OtherNFTToken.json";

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');

export default function CreateItem() {
    const [fileUrl, setFileUrl] = useState(null);
    const [formInput, updateFormInput] = useState({ name: '', description: '', tokenAddress: '' });
    const [uploadInput, updateUploadInput] = useState({ tokenAddress: '', tokenId: '', tokenURI: '' });
    const [listingInput, updateListingInput] = useState({ price: '', utility: '', listnft: '' });

    const yesRef = useRef(null);
    const noRef = useRef(null);
    const router = useRouter();

    async function uploadImage(e) {
        const fileObject = e.target.files[0];
        // console.log("The file object is: ", fileObject);
        //try uploading the file
        try {
            const added = await client.add(
                fileObject,
                {
                    progress: (prog) => console.log(`received: ${prog}`)
                }
            );
            //file saved in the url path below
            const ipfsImageURL = `https://ipfs.infura.io/ipfs/${added.path}`;
            setFileUrl(ipfsImageURL);
        } catch (e) {
            console.log('Error uploading file: ', e);
        }
    }

    //1. create item checks form inputs and create NFT Token URI using infuria IPFS
    async function createItem() {
        const { name, description, tokenAddress } = formInput; //get the value from the form input

        //form validation
        if (!tokenAddress || !name || !description || !fileUrl) {
            return;
        }

        //create a tokenURI
        const data = JSON.stringify({
            name, description, image: fileUrl, tokenAddress
        });

        //The NFT token to be listed will be uploaded to IPFS in form of JSON string
        // with {name, description, image, utility} properties
        try {
            const added = await client.add(data);
            const ipfsTokenURI = `https://ipfs.infura.io/ipfs/${added.path}`;

            //pass the tokenURI to create the listing on NFT Marketplace.
            mintToken(ipfsTokenURI);
        } catch (error) {
            console.log(`Error uploading file: `, error);
        }
    }

    //2. List item for sale
    async function mintToken(ipfsTokenURI) {
        // If we use the below it will directly connect to our local ethereum blockchain, but we dont want that.
        // const provider = new ethers.providers.JsonRpcProvider();
        // We want that any transaction that requires money to be send must use metamask
        //to do so we need to use "Web3Modal();"
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);


        //fetch the connected account from metamask
        const signer = provider.getSigner();

        //address of the other contract
        const address_nftTokenContract = formInput.tokenAddress;

        //in our case, we compiled the OtherTokenContract's source code, so we knew its abi.
        const abi_nftTokenContract = OtherNFTToken.abi;

        //create the contract instance using msg.sender's metamask account
        let myOtherNFTToken = new ethers.Contract(address_nftTokenContract, abi_nftTokenContract, signer);

        //create a new token using the tokenURI.
        let transaction = await myOtherNFTToken.createToken(ipfsTokenURI);

        //this transaction.wait() method fetch additional "event" details of the transaction
        let tx = await transaction.wait();

        //we need the tokenId to create
        //get the tokenId from the transaction that occured above
        //there events array that is returned, the first item from that event
        //is the event, third item is the token id.
        console.log('Transaction: ', tx);
        console.log('Transaction events: ', tx.events[0]);
        let event = tx.events[0];   //first event
        let value = event.args[2];  //3rd item of "args" key of first event is tokenId
        //let value = event.args.tokenId;  //tokenId key of item of "args" key of the first event is tokenId
        let tokenId = value.toNumber(); //we need to convert it a number

        //printing details of the minted Token to console.
        console.log("The Token Address is: ", formInput.tokenAddress);
        console.log("The Token ID is: ", tokenId);
        console.log("The Token URI is: ", ipfsTokenURI);

        //know who is the owner of the token
        const nftowner = await myOtherNFTToken.ownerOf(tokenId);
        console.log("The Other NFT (ID=", tokenId, ") owner is : ", nftowner);


    }

    //2. List item for sale
    async function listToken() {
        // If we use the below it will directly connect to our local ethereum blockchain, but we dont want that.
        // const provider = new ethers.providers.JsonRpcProvider();
        // We want that any transaction that requires money to be send must use metamask
        //to do so we need to use "Web3Modal();"
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);

        //fetch the connected account from metamask.
        //Signer needs to be the owner of the smart contract
        const signer = provider.getSigner();

        //Now the token is created and necessary information is captured.
        //Below code is to create the listing of this token

        //create instance of the marketplace contract.
        const myNFTMarket = new ethers.Contract(nftMarketplaceAddress, NFTMarket.abi, signer);

        //get the listing price
        let listingPrice = await myNFTMarket.getListingPrice();
        listingPrice = listingPrice.toString();


        //fetch nft Token details
        const nftOtherTokenAddress = uploadInput.tokenAddress;
        const tokenId = uploadInput.tokenId;

        //fetch listing Inputs
        const price = ethers.utils.parseUnits(listingInput.price, 'ether');
        const utility = listingInput.utility;

        //fetch

        //form validation
        if (!nftOtherTokenAddress || !tokenId || !price || !listingPrice || !utility) {
            return;
        }

        //create the listing item in NFT marketplace + sending the listing amount by msg.sender
        //for wallet handling of the user, we need to connect metamask with our local ethereum blockchain
        //once connected, the below code will trigger metamask transaction window
        //in order to transfer NFT token from the owner (msg.sender) to NFT Marketplace,
        //you need to connect via owner's wallet to market contract.
        const transaction = await myNFTMarket.connect(signer).createMarketItem(
            nftOtherTokenAddress, tokenId, price, { value: listingPrice }
        );

        //fetch the additional "event" data of the transaction.
        await transaction.wait();

        //after fetching the previous line, redirect page to homepage.
        router.push('/');
    }

    async function getPermissionForTransfer() {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);

        //fetch the connected account from metamask.
        //Signer needs to be the owner of the smart contract
        const signer = provider.getSigner();

        const address_nftTokenContract = uploadInput.tokenAddress;
        const tokenId = Number(uploadInput.tokenId);

        //in our case, we compiled the OtherTokenContract's source code, so we knew its abi.
        //create the contract instance using msg.sender's metamask account
        const abi_nftTokenContract = OtherNFTToken.abi;
        let myOtherNFTToken = new ethers.Contract(address_nftTokenContract, abi_nftTokenContract, signer);

        console.log("The NFT Marketplace address is: ", nftMarketplaceAddress);
        console.log("The NFT Other Contract address is: ", address_nftTokenContract);
        console.log("The NFT Token Id is: ", tokenId);
        console.log("The NFT Token Id is: ", uploadInput.tokenId);

        //get permissions to nftMarketplace for this NFT token only
        //in order to give approval to NFT Marketplace, you need to connect via owner's wallet to token contract
        await myOtherNFTToken.connect(signer).approve(nftMarketplaceAddress, tokenId);

        //if all good then create item for listing in marketplace.
        if (listingInput.listnft == 'yes') {
            listToken();
        }
    }

    //handle listing confirmation yes or no
    const handleListingClick = (event, param) => {
        updateListingInput({ ...listingInput, listnft: param });

        if (param == "yes") {
            yesRef.current.classList.remove('bg-blue-500');
            yesRef.current.classList.remove('bg-pink-500');
            yesRef.current.classList.add('bg-pink-500');
            noRef.current.classList.remove('bg-blue-500');
            noRef.current.classList.remove('bg-pink-500');
            noRef.current.classList.add('bg-blue-500');
        };

        if (param == "no") {
            noRef.current.classList.remove('bg-blue-500');
            noRef.current.classList.remove('bg-pink-500');
            noRef.current.classList.add('bg-pink-500');
            yesRef.current.classList.remove('bg-blue-500');
            yesRef.current.classList.remove('bg-pink-500');
            yesRef.current.classList.add('bg-blue-500');
        };
    };

    return (
        <div className="flex justify-center">
            <div className="w-1/2 flex flex-col pb-12">
                <h2 className="text-2xl py-2 bg-black text-white" style={{ marginTop: `20px` }}>Mint Other NFT Token</h2>
                <input
                    placeholder="NFT Token Address"
                    className="mt-8 border rounded p-4"
                    onChange={e => updateFormInput({ ...formInput, tokenAddress: e.target.value })}
                />
                <input
                    placeholder="Asset Name"
                    className="mt-8 border rounded p-4"
                    onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
                />
                <textarea
                    placeholder="Asset description"
                    className="mt-2 border rounded p-4"
                    onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
                />
                <input
                    type="file"
                    name="Asset"
                    className="my-4"
                    onChange={uploadImage}
                />
                {
                    fileUrl && (

                        <Image
                            src={fileUrl}
                            alt="Picture of the author"
                            className="rounded mt-4"
                            width={350}
                            height={500}
                        // blurDataURL="data:..." automatically provided
                        // placeholder="blur" // Optional blur-up while loading
                        />
                    )
                }
                <button style={{ marginTop: `30px` }} onClick={createItem}
                    className="font-bold mt-4 bg-blue-500 text-white text-xl leading-tight uppercase hover:bg-pink-500 hover:shadow-lg focus:bg-pink-500 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-pink-500 active:shadow-lg transition duration-150 ease-in-out rounded p-4 shadow-lg"
                >Create NFT</button>
                <h2 className="text-2xl py-2 bg-black text-white" style={{ marginTop: `20px` }}>List/Load Other NFT Token to Marketplace</h2>
                <input
                    placeholder="NFT Token Address"
                    className="mt-8 border rounded p-4"
                    onChange={e => updateUploadInput({ ...uploadInput, tokenAddress: e.target.value })}
                />
                <input
                    placeholder="NFT Token ID"
                    className="mt-8 border rounded p-4"
                    onChange={e => updateUploadInput({ ...uploadInput, tokenId: e.target.value })}
                />
                <input
                    placeholder="NFT Token URI (optional)"
                    className="mt-8 border rounded p-4"
                    onChange={e => updateUploadInput({ ...uploadInput, tokenURI: e.target.value })}
                />
                <input
                    placeholder="Asset Price in Eth"
                    className="mt-8 border rounded p-4"
                    type="number"
                    onChange={e => updateListingInput({ ...listingInput, price: e.target.value })}
                />
                <h2 className="text-2xl py-2 text-black" style={{ marginTop: `20px` }}>Choose Whether to List the NFT in Marketplace</h2>

                <div className='flex space-x-2 relative justify-center'>
                    <div className='py-4 px-4'>
                        <button
                            id="button-yes"
                            ref={yesRef}
                            className="inline-block px-6 py-2 bg-blue-500 text-white font-medium text-xs leading-tight uppercase rounded-full shadow-md hover:bg-pink-500 hover:shadow-lg focus:bg-pink-500 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-pink-500 active:shadow-lg transition duration-150 ease-in-out"
                            type="button"
                            onClick={event => handleListingClick(event, 'yes')}
                        >
                            Yes
                        </button>
                    </div>
                    <div className='py-4 px-4'>
                        <button
                            id="button-no"
                            ref={noRef}
                            className="inline-block px-6 py-2 bg-blue-500 text-white font-medium text-xs leading-tight uppercase rounded-full shadow-md hover:bg-pink-500 hover:shadow-lg focus:bg-pink-500 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-pink-500 active:shadow-lg transition duration-150 ease-in-out"
                            type="button"
                            onClick={event => handleListingClick(event, 'no')}
                        >
                            No
                        </button>
                    </div>
                </div>
                <h2 className="text-2xl py-2 bg-black text-white" style={{ marginTop: `10px` }}>Select Offer for the NFT.</h2>

                {/* Offer Selection */}
                {
                    Utilities.map((value, key) => (
                        // The key parameter in div is needed to make sure JSX iterator are properly defined
                        <div key={key} >
                            <input type="radio" name="selectOffer" onChange={e => updateListingInput({ ...listingInput, utility: key.toString() })} /> {key}. {value}
                        </div>
                    ))
                }

                <button style={{ marginTop: `30px` }} onClick={getPermissionForTransfer}
                    className="font-bold mt-4 bg-blue-500 text-white text-xl leading-tight uppercase hover:bg-pink-500 hover:shadow-lg focus:bg-pink-500 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-pink-500 active:shadow-lg transition duration-150 ease-in-out rounded p-4 shadow-lg"
                >List NFT</button>
            </div>
        </div >
    );
};;