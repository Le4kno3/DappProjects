import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'

import { PRIVATE_KEY } from './src/config'

const privateKey = String(PRIVATE_KEY)

const config: HardhatUserConfig = {
  paths: {
    root: './src'
  },
  solidity: {
    compilers: [
      {
        version: '0.8.18',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  defaultNetwork: 'polygon_mumbai_testnet', //hardhat-network-helpers: can only be used in "hardhat" or the "runtime" network. If you want to run the test script on some other blockchain, make sure to remove the use of this library.
  networks: {
    hardhat: {
      chainId: 31337
    },
    hardhat_local_node: {
      url: 'http://localhost:8545',
      accounts: [
        '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
        '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
        '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a'
      ],
      chainId: 31337,
      gasPrice: 470000000000
    }
  }
}

export default config
