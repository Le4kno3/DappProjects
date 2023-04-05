import { ethers } from 'ethers'
import { polygonMumbai, polygon, mainnet } from '@wagmi/chains'

/**========================================================================
 *                           BACKEND
 *========================================================================**/

// export const BASE_URL = 'https://www.cotry-api.club';
export const BASE_URL = 'http://localhost:5000'

/**========================================================================
 *                           BLOCKCHAIN CONFIG
 *========================================================================**/

export const AlchemyProviderPolygonMainnet_RPC =
  'https://polygon-mainnet.g.alchemy.com/v2/iJupCofKYkhzpRUkYSIM4y3M3WcRlKqA'
export const AlchemyProviderPolygonTestnet_RPC =
  'https://polygon-mumbai.g.alchemy.com/v2/iVPTZIEAoP-KO9SBUEydAsoSmX2fEQOv'

export const LOCALTESTNET_URL = 'http://localhost:8545'
// export const PRIVATE_KEY =
//     '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';

export const POLYGON_URL = AlchemyProviderPolygonTestnet_RPC
// export const PRIVATE_KEY =
//     '5e23a883de8d55415ac055277b689c4ae7c2f760d235cef741ba722fe67ccad3';  //account1
export const PRIVATE_KEY =
  'a3d6219c85a35d36cbaa58f7fcb53d5eb2582a38e581e131a260058a89c3a1d3' //account4

export const RINKEBY_URL =
  'https://rinkeby.infura.io/v3/d6892d3cbbc64ac09fd71d1a0de1d2bc'
// export const PRIVATE_KEY =
//     '5e23a883de8d55415ac055277b689c4ae7c2f760d235cef741ba722fe67ccad3';

export const AlchemyProviderPolygonMainnet_APIKey =
  'iJupCofKYkhzpRUkYSIM4y3M3WcRlKqA'
export const AlchemyProviderPolygonTestnet_APIKey =
  'iVPTZIEAoP-KO9SBUEydAsoSmX2fEQOv'
export const AlchemyProviderCurrent_APIKey =
  AlchemyProviderPolygonTestnet_APIKey

export const CURRENT_WAGMI_CHAIN = polygonMumbai

export const CURRENT_RPC_URL = POLYGON_URL

/**========================================================================
 *                           WALLET AND AUTH
 *========================================================================**/

export const WEB3AUTH_TESTNET_clientId =
  'BOHrdSSDRK9JWH95FVP6GQkEa9506CH4qockqwRNkS-cGfE99A22wfuAJLWadgda3jCkhy_Tt0Uj5-UXJU__bPI'

export const WEB3AUTH_MAINNNET_clientId =
  'BOCXpW85icNLlRSxN3TQ2hnEIfm3lOihKk0yonH4P5TssSqEnHOk4z9DsqBzWoJEyl9hNgjBGyyCa1z-rGdCOyc'

export const TESTNET_ChainConfig = {
  rpcTarget:
    'https://polygon-mumbai.g.alchemy.com/v2/iVPTZIEAoP-KO9SBUEydAsoSmX2fEQOv',
  displayName: 'Polygon Testnet',
  blockExplorer: 'https://mumbai.polygonscan.com/',
  ticker: 'MATIC',
  tickerName: 'Matic',
  chainNamespace: 'PENDING',
  chainId: ethers.utils.hexlify(80001)
}

export const Web3AuthNetwork = 'aqua' //visit web3auth verifier to get the first name of the environment, testnet, cyan, aqua, celestial, mainnet

export const CLIENTID_GOOGLE_DEV =
  '1003833138269-8619c6urnapceai7bscvg4e1v2vfd7g2.apps.googleusercontent.com'

export const CLIENTID_GOOGLE_PROD =
  '1003833138269-n6th6n82lee6pdvhduhsgdtpdfhhtre9.apps.googleusercontent.com'

/**========================================================================
 *                           REST CONFIG
 *========================================================================**/

export const WEB3STORAGE_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDVCRWUxNzNFQmNFMWNjOTNFMEFCNUY3QkMxOGI3NGUxNjlDODFGZEYiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjM4MTg0NTkxODksIm5hbWUiOiJDb3RyeUFwcElQRlMifQ.4nzSRidEyrdQFtKZHa-EtzLyD4RZOj6fsW39KQX_aHA'

export const NEXT_PUBLIC_INFURA_ID = '460f40a260564ac4a4f4b3fffb032dad'
export const ETHERSCAN_API_KEY = 'ABC123ABC123ABC123ABC123ABC123ABC1'
