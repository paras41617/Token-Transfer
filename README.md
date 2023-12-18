
# Token Transfer

Token Transfer is an APP through which a user can transfer ERC-20 tokens.



## Documentation

Currently it only supports a test token which the user can buy to see the functionality of the APP.

TestToken (TT) is an ERC-20 token.

A user can buy one TT with 1 ETH.

Features : 
 - The App supports Metamask Wallet.
 - The App shows connected address along with the tokens associated with that address.
 - Transaction Status is shown to specify whether the trasaction was successful or not.
 - In case the transaction is pending, transaction status "pending" along with estimated time is shown.
 - Estmimated Time and Transaction Status is consistent across tabs and Windows.

## Run Locally

Clone the project

```bash
  git clone https://github.com/paras41617/Token-Transfer
```

Go to the project directory

```bash
  cd token-transfer
```

Install dependencies

```bash
  npm install
```

Open a terminal to start local node using hardhat

```bash
  npx hardhat node
```

Open another terminal to deploy the smart contract

```bash
  npx hardhat run deploy.js
```

Start the server

```bash
  npm start
```

The APP can be accessed through url

```bash
  http://localhost:3000/
```