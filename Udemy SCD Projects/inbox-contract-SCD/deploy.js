const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');
const provider = new HDWalletProvider(
    'rebuild length hour spike quantum leisure auto trigger copy include october brief',
    'https://rinkeby.infura.io/v3/727d0d61d64c4e898030416aa397cc3b'
);

const web3 = new Web3(provider); //now this "web3" is completed configured to connect to Rinkeby Network

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    console.log('Attempting to deply from accounts', accounts[0]);

    const result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode, arguments: ['Hi there!'] })
        .send({ gas: '1000000', gasPrice: '5000000000', from: accounts[0] });

    console.log('Contract deployed to', result.options.address);
};
deploy();
