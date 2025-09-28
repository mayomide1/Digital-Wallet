import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "./Dashboard.css";
import { RiUploadLine, RiDownloadLine } from "react-icons/ri";
import { TbSend } from "react-icons/tb";
import TransactionTable from "./TransactionTable";
import { Link } from "react-router-dom";


const Dashboard = () => {
  const [activeModal, setActiveModal] = useState(null);
const [wallet, setWallet] = useState('') 
const [deposit, setDeposit] = useState();
const [withdrawAmount, setWithdrawAmount] = useState("");
const [withdrawalError, setWithdrawalError] = useState("");
const [expense, setExpense] = useState("");
const [expenseDesc, setExpenseDesc] = useState("");
const [savingsDesc, setSavingsDesc] = useState("");
const [savings, setSavings] = useState("");

useEffect(() => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  if (!storedUser) return;

  axios.get(`http://localhost:8081/wallet/${storedUser.id}`)
    .then(res => {
      setWallet(res.data[0]);
    })
    .catch(err => console.log(err));
}, []);


async function handleDeposit(e) {
  e.preventDefault();
  try {
    await axios.post("http://localhost:8081/deposit", { 
      wallet_id: wallet.wallet_id,
      amount: parseFloat(deposit) 
    });

    const res = await axios.get(`http://localhost:8081/wallet/${wallet.user_id}`);
    setWallet(res.data[0]);
    setDeposit("");
    setActiveModal(null);

    alert("Deposit successful!");
  } catch (error) {
    console.log(error);
    alert("Deposit failed!");
  }
}


const handleWithdraw = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post("http://localhost:8081/withdraw", {
      wallet_id: wallet.wallet_id,
      amount: parseFloat(withdrawAmount),
    });

    if (res.data.success) {
      alert("Withdrawal successful!");
      setWithdrawAmount("");
      setActiveModal(null);

      const refreshed = await axios.get(`http://localhost:8081/wallet/${wallet.user_id}`);
      setWallet(refreshed.data[0]);
    } else {
      alert(res.data.error || "Withdrawal failed");
    }
  } catch (err) {
    console.error("Withdraw error:", err);
    setWithdrawalError("Something went wrong.");
  }
};

// Handle Expense
async function handleExpense(e) {
  e.preventDefault();
  try {
    await axios.post("http://localhost:8081/expense", {
      wallet_id: wallet.wallet_id, // make sure this matches your schema
      amount: parseFloat(expense),
      description: expenseDesc
    });

    // Refresh wallet + transactions
    const res = await axios.get(`http://localhost:8081/wallet/${wallet.user_id}`);
    setWallet(res.data[0]);
    setExpense("");
    setExpenseDesc("");
    setActiveModal(null);

    alert("Expense recorded!");
  } catch (error) {
    console.error(error);
    alert("Failed to add expense!");
  }
}


// Handle Savings
async function handleSavings(e) {
  e.preventDefault();
  try {
    await axios.post("http://localhost:8081/savings", {
      wallet_id: wallet.wallet_id,
      amount: parseFloat(savings),
      description: savingsDesc
    });

    // Refresh wallet + transactions
    const res = await axios.get(`http://localhost:8081/wallet/${wallet.user_id}`);
    setWallet(res.data[0]);
    setSavings("");
    setSavingsDesc("");
    setActiveModal(null);

    alert("Savings recorded!");
  } catch (error) {
    console.error(error);
    alert("Failed to add savings!");
  }
}

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard">
        <Header />
        <p className="page-title">Dashboard</p>

        <div className="wallet">
          <div className="wallet-balance">
            <p>Wallet Balance</p>
            <p>₦ {wallet.balance}</p>
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
          <PaymentActions
            icon={<RiDownloadLine size={20} />}
            description="Add Savings"
            onClick={() => setActiveModal("savings")}
          />
          <PaymentActions
            icon={<TbSend size={20} />}
            description="Add Expense"
            onClick={() => setActiveModal("expense")}
          />
        </div>

        <div className="transaction-history">
          <p className="header">
            <span>Transaction History</span>
            <Link to="/transactions"><span>View All History</span> </Link>    
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
              <input type="number" 
              placeholder="Enter amount" 
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
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
            {withdrawalError && <p style={{color:"red"}}>{withdrawalError}</p>}
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

      {activeModal === "savings" && (
  <div className="modal-overlay">
    <div className="modal">
      <h2>Add Savings</h2>
      <form onSubmit={handleSavings}>
        <label>Amount</label>
        <input
          type="number"
          value={savings}
          onChange={(e) => setSavings(e.target.value)}
        />
        <label>Description</label>
        <input
          type="text"
          value={savingsDesc}
          onChange={(e) => setSavingsDesc(e.target.value)}
        />
        <button type="submit">Save Savings</button>
      </form>
      <button className="close-btn" onClick={() => setActiveModal(null)}>Close</button>
    </div>
  </div>
)}

{activeModal === "expense" && (
  <div className="modal-overlay">
    <div className="modal">
      <h2>Add Expense</h2>
      <form onSubmit={handleExpense}>
        <label>Amount</label>
        <input type="number" value={expense} onChange={(e) => setExpense(e.target.value)} />
        <label>Description</label>
        <input type="text" value={expenseDesc} onChange={(e) => setExpenseDesc(e.target.value)} />
        <button type="submit">Save Expense</button>
      </form>
      <button className="close-btn" onClick={() => setActiveModal(null)}>Close</button>
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
