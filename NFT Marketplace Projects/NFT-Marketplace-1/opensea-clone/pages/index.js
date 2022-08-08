import { useState, useEffect } from "react";
import Router from 'next/router';
import { sequence } from '0xsequence';
import { OpenWalletIntent, Settings } from "@0xsequence/provider";
import styles from '../styles/Home.module.css';
import { configureLogger } from "@0xsequence/utils";
import { Home } from './home.js';

// This assumes your dapp runs on Ethereum mainnet
const wallet = sequence.initWallet('polygon');

const UserLogin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (isAuthenticated) {
    Router.push('/home');
  }

  const connect = async () => {
    // Get sequence wallet instance
    const wallet = sequence.getWallet();
    const connectDetails = await wallet.connect({
      app: 'Your Dapp name',
      authorize: true,
      // And pass settings if you would like to customize further
      settings: {
        theme: "light",
        bannerUrl: "https://yoursite.com/banner-image.png",  // 3:1 aspect ratio, 1200x400 works best
        includedPaymentProviders: ["moonpay", "ramp"],
        defaultFundingCurrency: "matic",
        lockFundingCurrencyToDefault: false,
      }
    });
    console.log('user accepted connect?', connectDetails.connected);
    console.log('users signed connect proof to valid their account address:', connectDetails.proof);
    if (connectDetails.connected) {
      setIsAuthenticated(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <button type="button" onClick={connect} className="text-white bg-[#3b5998] hover:bg-[#3b5998]/90 focus:ring-4 focus:outline-none focus:ring-[#3b5998]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#3b5998]/55 mr-2 mb-2">
        Sign in with Web3Auth
      </button>
    </div>
  );
};


export default UserLogin;