import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './styles.css';
import MyTokenABI from './artifacts/contracts/Token.sol/Token.json';

const MyTokenAddress = '0x1fbb37117f1b7edaecb23966451f6e5f79593d56';

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [tokensAmount, setTokensAmount] = useState("");
  const [transactionStatus, setTransactionStatus] = useState({ success: null, message: "" });
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
  const [currentAction, setCurrentAction] = useState("");
  const [estimatedTime, setEstimatedTime] = useState(null);

  const connectToMetaMask = async () => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      try {
        await window.ethereum.enable();
        setWeb3(web3Instance);
        const accs = await web3Instance.eth.getAccounts();
        setAccounts(accs);
        const myTokenContract = new web3Instance.eth.Contract(MyTokenABI.abi, MyTokenAddress);
        setContract(myTokenContract);
        const balance = await myTokenContract.methods.balanceOf(accs[0]).call();
        setBalance(Number(balance));
        setIsMetaMaskConnected(true);
        localStorage.setItem('connectedAccount', accs[0]);
      } catch (error) {
        console.error('Error accessing accounts or contract:', error);
      }
    } else {
      console.error('No Ethereum browser extension detected, please install MetaMask');
    }
  };

  const check_meta = async () => {
    if (window.ethereum && window.ethereum.selectedAddress) {
      const connectedAccount = localStorage.getItem('connectedAccount');

      if (connectedAccount) {
        setAccounts([connectedAccount]);
        setIsMetaMaskConnected(true);

        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        const myTokenContract = new web3Instance.eth.Contract(MyTokenABI.abi, MyTokenAddress);
        setContract(myTokenContract);

        const balance = await myTokenContract.methods.balanceOf(connectedAccount).call();
        setBalance(Number(balance));
      }
    }
  }

  const set_failed = () => {
    setTransactionStatus({ success: false, message: "Transaction failed" });
    localStorage.setItem("transaction_status", JSON.stringify({ success: false, message: "Transaction failed" }));
    localStorage.setItem("estimated_time", null);
    localStorage.setItem("transaction_hash", JSON.stringify(null));
  }

  const set_success = () => {
    setTransactionStatus({ success: true, message: "Transaction successful" });
    localStorage.setItem("transaction_status", JSON.stringify({ success: true, message: "Transaction successful" }));
    localStorage.setItem("estimated_time", null);
    localStorage.setItem("transaction_hash", JSON.stringify(null));
  }

  useEffect(() => {
    const estimated_time = localStorage.getItem("estimated_time");
    setEstimatedTime(estimated_time);
    check_meta()
  }, []);

  const buyTokens = async () => {
    try {
      const transaction = contract.methods.buyTokens(tokensAmount).send({
        from: accounts[0],
        value: web3.utils.toWei(tokensAmount.toString(), 'ether')
      });
      transaction.on('transactionHash', (hash) => {
        estimateTransactionTime();
        localStorage.setItem("transaction_hash", JSON.stringify(hash));
      });
      transaction.on('receipt', (receipt) => {
        const newBalance = contract.methods.balanceOf(accounts[0]).call();
        setBalance(Number(newBalance));
        set_success();
      });

      await transaction.catch((error) => {
        set_failed()
      });
    } catch (error) {
      console.error('Error initiating transaction:', error);
      set_failed();
    }
  };

  const transferTokens = async () => {
    try {
      const transaction = contract.methods.transfer(receiverAddress, tokensAmount).send({ from: accounts[0] });

      transaction.on('transactionHash', (hash) => {
        estimateTransactionTime();
        localStorage.setItem("transaction_hash", JSON.stringify(hash));
      });
      transaction.on('receipt', (receipt) => {
        console.log("receipt : ", receipt);
        const newBalance = contract.methods.balanceOf(accounts[0]).call();
        setBalance(Number(newBalance));
        set_success();
      });
      await transaction.catch((error) => {
        set_failed()
      });
    } catch (error) {
      console.log('Error transferring tokens:', error);
      set_failed();
    }
  };

  async function estimateTransactionTime() {
    try {
      const gasPrice = await web3.eth.getGasPrice();
      const bigIntGasPrice = Number(gasPrice);
      const transactionFee = bigIntGasPrice;
      const latestBlock = await web3.eth.getBlock('latest');

      const bigIntGasUsed = Number(latestBlock.gasUsed);
      const averageBlockTime = 15
      const estimatedTimeInSeconds = Number(transactionFee / bigIntGasUsed * Number(averageBlockTime));
      if (!transactionStatus.success) {
        setEstimatedTime(estimatedTimeInSeconds / 1000);
        localStorage.setItem("estimated_time", estimatedTimeInSeconds);
        localStorage.setItem("transaction_status", JSON.stringify({ success: null, message: "" }));
      }
    } catch (error) {
      console.error('Error estimating transaction time:', error);
    }
  }

  useEffect(() => {

    const handleStorageChange = (event) => {
      if (event.key === 'estimated_time') {
        setEstimatedTime(event.newValue);
      }
      if (event.key === 'transaction_status') {
        setTransactionStatus(JSON.parse(event.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const checkTransactionStatus = async (transactionHash) => {
    try {
      const receipt = await web3.eth.getTransactionReceipt(transactionHash);

      if (receipt) {
        if (Number(receipt.status) === 1) {
          console.log('Transaction successful');
          set_success();
        } else {
          console.error('Transaction failed');
          set_failed();
        }
      } else {
        console.log('Transaction not mined yet');
      }
    } catch (error) {
      console.error('Error checking transaction status:', error);
    }
  };

  useEffect(() => {

    const hash = localStorage.getItem("transaction_hash");
    if (JSON.parse(hash) != null && web3) {
      checkTransactionStatus(JSON.parse(hash));
    }
  }, [web3])

  return (
    <div className="body">
      <h1>
        Transfer App
      </h1>
      {!isMetaMaskConnected && !window.ethereum?.selectedAddress && (
        <button style={{ cursor: 'pointer' }} className="button" onClick={connectToMetaMask}>
          Connect to MetaMask
        </button>
      )}

      {(isMetaMaskConnected || window.ethereum?.selectedAddress) && (
        <div className="container">
          <h2 className="heading">My Token Wallet</h2>
          <p className="subtext">Account: {accounts[0]}</p>
          <p className="subtext">Tokens Owned: {balance}</p>
          {estimatedTime == null || estimatedTime == "null" ? (
            <div>
              {currentAction === "buy" && (
                <div>
                  <label className="input-label">
                    Amount of Tokens:
                    <input
                      type="text"
                      value={tokensAmount}
                      onChange={(e) => setTokensAmount(e.target.value)}
                      className="input-field"
                    />
                  </label>
                  <button className="action-button" onClick={buyTokens}>
                    Buy Tokens
                  </button>
                </div>
              )}

              {currentAction === "transfer" && (
                <div>
                  <label className="input-label">
                    Receiver Address:
                    <input
                      type="text"
                      value={receiverAddress}
                      onChange={(e) => setReceiverAddress(e.target.value)}
                      className="input-field"
                    />
                  </label>
                  <label className="input-label">
                    Amount of Tokens:
                    <input
                      type="text"
                      value={tokensAmount}
                      onChange={(e) => setTokensAmount(e.target.value)}
                      className="input-field"
                    />
                  </label>
                  <button className="action-button" onClick={transferTokens}>
                    Transfer Tokens
                  </button>
                </div>
              )}

              <button className="action-button" onClick={() => setCurrentAction("buy")}>
                Show Buy Option
              </button>
              <button className="action-button" onClick={() => setCurrentAction("transfer")}>
                Show Transfer Option
              </button>

            </div>
          ) : ""}
          {transactionStatus.success !== null && (
            <div className={`transaction-status ${transactionStatus.success ? 'success' : 'error'}`}>
              <p>
                Transaction Status: {transactionStatus.success ? 'Success' : 'Error'} - {transactionStatus.message}
              </p>
              <p>
                Please refresh the page to load current details.
              </p>
              {transactionStatus.transactionHash && (
                <p>
                  Transaction Hash: {transactionStatus.transactionHash} (
                  )
                </p>
              )}
            </div>
          )}
          {estimatedTime !== null && estimatedTime !== "null" && transactionStatus.success == null && (
            <div>
              <p className="subtext">Estimated Transaction Time: {estimatedTime} seconds</p>
              <p>
                Transaction Status: Pending
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

};

export default App;
