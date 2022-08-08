import logo from './logo.svg';
import './App.css';
import React from 'react';
import web3 from './web3';
import lottery from './lottery'; //we will use this smart contract object to send and receive transactions to ehtereum network

class App extends React.Component {
    state = {
        manager: '',
        players: [],
        balance: '',
        value: '',
        message: '',
    };

    // we dont have to call "componentDidMount()" it will be executed automatically
    async componentDidMount() {
        const manager = await lottery.methods.manager().call(); //we dont have to specify "from" it takes it from metamask integration 1st account from metasmak.
        const players = await lottery.methods.getPlayers().call();
        const balance = await web3.eth.getBalance(lottery.options.address); // balance is not actually a number. Hence we always initialize numbers as string.

        this.setState({ manager, players, balance });
    }

    onSubmit = async (event) => {
        event.preventDefault(); // to not perform default behavior of "submit". It will send http response.

        const accounts = await web3.eth.getAccounts();

        this.setState({ message: 'Waiting on transaction success...' });

        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei(this.state.value, 'ether'),
        });

        this.setState({ message: 'You have been entered!' });
    };

    onClick = async () => {
        //
        const accounts = await web3.eth.getAccounts();

        this.setState({ message: 'Waiting on transaction success...' });

        await lottery.methods.pickWinner().send({
            from: accounts[0],
        });

        this.setState({ message: 'A Winner has been picked!' });
    };

    render() {
        return (
            <div>
                <h2> Lottery contract </h2>
                <p>
                    This contract is managed by {this.state.manager}
                    There are currently {this.state.players.length} people entered, competing to win
                    {web3.utils.fromWei(this.state.balance, 'ether')} ether!
                </p>
                <hr />

                <form onSubmit={this.onSubmit}>
                    <h4> Want to try your luck?</h4>
                    <div>
                        <label> Amount of ether to enter </label>
                        <input
                            value={this.state.value}
                            onChange={(event) => this.setState({ value: event.target.value })}
                        />
                    </div>
                    <button> Enter</button>
                </form>

                <hr />

                <h4> Ready to pic a winner?</h4>
                <button onClick={this.onClick}>Pic a winner!</button>

                <hr />

                <h1>{this.state.message}</h1>
            </div>
        );
    }
}
export default App;
