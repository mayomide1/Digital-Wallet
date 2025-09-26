import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "./Dashboard.css";
import { RiUploadLine, RiDownloadLine } from "react-icons/ri";
import { TbSend } from "react-icons/tb";
import TransactionTable from "./TransactionTable";

const Dashboard = () => {
  const [activeModal, setActiveModal] = useState(null);
const [transactions, setTransactions] = useState([]) 
const [depositAmount, setDepositAmount] = useState("");
const [withdrawAmount, setWithdrawAmount] = useState("");

useEffect(() => { axios.get("http://localhost:8081/wallet") 
    .then(res => { 
        console.log(res.data) 
        setTransactions(res.data[0]) 
    }) 
    .catch(err => console.log(err)) },[])

const handleDeposit = async (e) => {
  e.preventDefault();

  try {
    await axios.post("http://localhost:8081/deposit", {
      wallet_id: 1,  
      amount: parseFloat(depositAmount),
    });

    // Refresh wallet + transactions after deposit
    const walletRes = await axios.get("http://localhost:8081/wallet");
    setTransactions(walletRes.data[0]);

    setActiveModal(null); // close modal
  } catch (err) {
    console.error(err);
  }
};

const handleWithdraw = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post("http://localhost:8081/withdraw", {
      wallet_id: 1,   // use dynamic wallet_id if available
      amount: parseFloat(withdrawAmount),
    });

    console.log(res.data); // check response

    if (res.data.success) {
      alert("Withdrawal successful!");
      // Refresh wallet
      const walletRes = await axios.get("http://localhost:8081/wallet");
      setTransactions(walletRes.data[0]); 
      console.log(walletRes.data[0])
      setActiveModal(null);
    } else {
      alert(res.data.error || "Withdrawal failed");
    }
  } catch (err) {
    console.error("Withdraw error:", err);
  }
};


  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard">
        <Header />
        <p className="page-title">Dashboard</p>

        <div className="wallet">
          <div className="wallet-balance">
            <p>Wallet Balance</p>
            <p>₦ {transactions.balance}</p>
          </div>
          <PaymentActions
            icon={<RiUploadLine size={20} />}
            description="Deposit"
            onClick={() => setActiveModal("deposit")}
          />
          <PaymentActions
            icon={<RiDownloadLine size={20} />}
            description="Withdraw"
            onClick={() => setActiveModal("withdraw")}
          />
          <PaymentActions
            icon={<TbSend size={20} />}
            description="Send Money"
            onClick={() => setActiveModal("send")}
          />
        </div>

        <div className="transaction-history">
          <p className="header">
            <span>Transaction History</span>
          </p>
          <TransactionTable />
        </div>
      </div>

      {activeModal === "deposit" && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Deposit Money</h2>
            <form onSubmit={handleDeposit}>
              <label>Amount</label>
                <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Enter amount"
                />
              <button type="submit">Deposit</button>
            </form>
            <button className="close-btn" onClick={() => setActiveModal(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {activeModal === "withdraw" && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Withdraw Money</h2>
            <form onSubmit={handleWithdraw}>
              <label>Amount</label>
                <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount"
                />
              <button type="submit">Withdraw</button>
            </form>
            <button className="close-btn" onClick={() => setActiveModal(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {activeModal === "send" && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Send Money</h2>
            <form>
              <label>Recipient Account Number</label>
              <input type="text" placeholder="Enter account number" />
              <label>Amount</label>
              <input type="number" placeholder="Enter amount" />
              <button type="submit">Send</button>
            </form>
            <button className="close-btn" onClick={() => setActiveModal(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function PaymentActions({ icon, description, onClick }) {
  return (
    <div className="payment-actions" onClick={onClick}>
      <p>{icon}</p>
      <p>{description}</p>
    </div>
  );
}

export default Dashboard;
