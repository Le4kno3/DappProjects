const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const { interface, bytecode } = require('../compile');

let players;
let lottery;
let accounts;

// deploy fresh smart contract, before every "it" check
beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: '1000000' });
});

describe('Lottery Contract', () => {
    it('deploys a contract', () => {
        assert.ok(lottery.options.address);
    });

    it('allows one account to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether'),
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0],
        });

        assert.strictEqual(accounts[0], players[0]);
        assert.strictEqual(1, players.length);
    });

    it('allows multiple accounts to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether'),
        });

        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether'),
        });

        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02', 'ether'),
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0],
        });

        assert.strictEqual(accounts[0], players[0]);
        assert.strictEqual(accounts[1], players[1]);
        assert.strictEqual(accounts[2], players[2]);
        assert.strictEqual(3, players.length);
    });

    it('requires a minimum amout of ether to enter', async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei('0.02', 'ether'),
            });
            assert(false); // else assert false
        } catch (err) {
            assert(err);
            // console.log('Amount of money sent is less than what is required to enter');
        }
    });

    it('only manager can call pick winner', async () => {
        try {
            await lottery.methods.pickWinner().send({
                from: accounts[1],
            });
            assert(false); // else assert false, means automatically fail test.
        } catch (err) {
            assert(err);
            // console.log('Amount of money sent is less than what is required to enter');
        }
    });

    it('sends money to the winner and resets the players array', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether'),
        });

        initialBalance = await web3.eth.getBalance(accounts[0]);

        await lottery.methods.pickWinner().send({
            from: accounts[0],
        });

        finalBalance = await web3.eth.getBalance(accounts[0]);

        const difference = finalBalance - initialBalance;
        console.log(difference);
        assert(difference > web3.utils.toWei('1.8', 'ether'));
    });
});
