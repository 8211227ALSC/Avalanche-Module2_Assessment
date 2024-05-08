import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethereumWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [userATM, setATM] = useState(undefined);
  const [userBalance, setBalance] = useState(undefined);
  const [error, setError] = useState(null);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    try {
      if (window.ethereum) {
        setEthWallet(window.ethereum);
      }

      if (ethereumWallet) {
        const accounts = await ethereumWallet.request({ method: "eth_accounts" });
        handleAccount(accounts);
      }
    } catch (error) {
      setError("Error connecting to wallet");
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    try {
      if (!ethereumWallet) {
        throw new Error("MetaMask wallet is required to connect");
      }

      const accounts = await ethereumWallet.request({ method: "eth_requestAccounts" });
      handleAccount(accounts);

      // once wallet is set we can get a reference to our deployed contract
      getATMContract();
    } catch (error) {
      setError(error.message);
    }
  };

  const getATMContract = () => {
    try {
      const provider = new ethers.providers.Web3Provider(ethereumWallet);
      const signer = provider.getSigner();
      const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

      setATM(atmContract);
    } catch (error) {
      setError("Error getting ATM contract");
    }
  };

  const getBalance = async () => {
    try {
      if (userATM) {
        setBalance((await userATM.getBalance()).toNumber());
      }
    } catch (error) {
      setError("Error getting balance");
    }
  };

  const deposit = async () => {
    try {
      if (userATM) {
        let tx = await userATM.deposit(1);
        await tx.wait();
        getBalance();
      }
    } catch (error) {
      setError("Error depositing");
    }
  };

  const withdraw = async () => {
    try {
      if (userATM) {
        let tx = await userATM.withdraw(1);
        await tx.wait();
        getBalance();
      }
    } catch (error) {
      setError("Error withdrawing");
    }
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethereumWallet) {
      return <p className="message">Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return (
        <button className="connect-button" onClick={connectAccount}>
          Please connect your Metamask wallet
        </button>
      );
    }

    if (userBalance === undefined) {
      getBalance();
    }

    return (
      <div className="user-info">
        <p className="account">Your Account: {account}</p>
        <p className="balance">Your Balance: {userBalance}</p>
        <div className="buttons">
          <button onClick={deposit}>Deposit 1 ETH</button>
          <button onClick={withdraw}>Withdraw 1 ETH</button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {error && <p className="error">Error: {error}</p>}
      {initUser()}
      <style jsx global>{`
        body {
          font-family: Arial, sans-serif;
          background-color: #222;
          color: #fff;
          margin: 0;
          padding: 0;
        }

        .container {
          text-align: center;
          margin-top: 50px;
        }

        .message {
          color: red;
          font-weight: bold;
        }

        .connect-button {
          margin-top: 20px;
          padding: 10px 20px;
          background-color: #FF00ED;
          color: white;
          border: none;
          border-radius: 50px; /* Rounder button */
          cursor: pointer;
          font-size: 16px;
        }

        .connect-button:hover {
          background-color: #86057D;
        }

        .user-info {
          margin-top: 20px;
        }

        .account,
        .balance {
          margin-bottom: 10px;
        }

        .buttons button {
          margin: 5px;
          padding: 10px 20px;
          background-color: #FF00ED;
          color: white;
          border: none;
          border-radius: 50px; /* Rounder button */
          cursor: pointer;
          font-size: 16px;
        }

        .buttons button:hover {
          background-color: #86057D;
        }

        .error {
          color: red;
          font-weight: bold;
        }
      `}</style>
    </main>
  );
}
