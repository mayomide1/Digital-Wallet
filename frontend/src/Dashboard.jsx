import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "./Dashboard.css";
import { RiUploadLine, RiDownloadLine } from "react-icons/ri";
import { TbSend } from "react-icons/tb";
import TransactionTable from "./TransactionTable";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const location = useLocation();
  const [activeModal, setActiveModal] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState(""); // ✅ used for both set-pin and transactions
  const [wallet, setWallet] = useState("");
  const [deposit, setDeposit] = useState();
  const [recipientAccount, setRecipientAccount] = useState("");
  const [recipient, setRecipient] = useState(null);
  const [sendAmount, setSendAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) return;

    // show pin modal if redirected with state
    if (location.state?.showPinModal) {
      setShowPinModal(true);
    }

    axios
      .get(`http://localhost:8081/wallet/${storedUser.id}`)
      .then((res) => setWallet(res.data[0]))
      .catch((err) => console.log(err));
  }, [location.state]);

  // ✅ Set PIN handler
  async function handleSetPin(e) {
    e.preventDefault();
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) return;

    try {
      await axios.post("http://localhost:8081/set-pin", {
        user_id: storedUser.id,
        pin,
      });

      storedUser.transaction_pin = true; // update local storage
      localStorage.setItem("user", JSON.stringify(storedUser));

      toast.success("✅ Transaction PIN set successfully!");
      setShowPinModal(false);
      setPin(""); // clear after setting
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to set PIN");
    }
  }

  async function handleDeposit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:8081/deposit", {
        wallet_id: wallet.wallet_id,
        amount: parseFloat(deposit),
      });

      const res = await axios.get(
        `http://localhost:8081/wallet/${wallet.user_id}`
      );
      setWallet(res.data[0]);
      setDeposit("");
      setActiveModal(null);

      toast.success("💰 Deposit successful!");
    } catch (err) {
      console.error(err);
      toast.error("❌ Deposit failed!");
    } finally {
      setLoading(false);
    }
  }

  async function fetchRecipient(accountNumber) {
    if (!accountNumber) {
      setRecipient(null);
      return;
    }
    try {
      const res = await axios.get(
        `http://localhost:8081/users/by-account/${accountNumber}`
      );
      setRecipient(res.data);
    } catch (err) {
      console.error(err);
      setRecipient(null);
    }
  }

  // ✅ Updated: Send Money requires PIN
  async function handleSendMoney(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:8081/send-money", {
        sender_id: wallet.user_id,
        recipient_account: recipientAccount,
        amount: parseFloat(sendAmount),
        pin, // ✅ include pin
      });

      toast.success(`✅ You sent ₦${sendAmount} to ${recipient?.name}`);
      setActiveModal(null);
      setRecipient(null);
      setRecipientAccount("");
      setSendAmount("");
      setPin(""); // clear after transaction
    } catch (error) {
      toast.error("❌ " + (error.response?.data?.error || "Failed to send money"));
    } finally {
      setLoading(false);
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
            <h3>Wallet Balance</h3>
            <h3>₦ {wallet.balance}</h3>
          </div>
          <PaymentActions
            icon={<RiUploadLine size={25} />}
            description="Deposit"
            onClick={() => setActiveModal("deposit")}
          />
          <PaymentActions
            icon={<TbSend size={25} />}
            description="Send Money"
            onClick={() => setActiveModal("send")}
          />
            <PaymentActions
              icon={<RiDownloadLine size={25} />}
              description="Savings"
              onClick={() => navigate("/savings")}
            />
        </div>

        <div className="transaction-history">
          <p className="header">
            <span>Transaction History</span>
            <span onClick={() => navigate("/transactions")} className="view-all">View All History</span>
          </p>
          <TransactionTable limit={4} />
        </div>
      </div>

      {/* ✅ Set PIN Modal */}
      {showPinModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Set Your Transaction PIN</h2>
            <form onSubmit={handleSetPin}>
              <input
                type="password"
                maxLength="4"
                placeholder="Enter 4-digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
              />
              <button type="submit">Save PIN</button>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {activeModal === "deposit" && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Deposit Money</h2>
            <form onSubmit={handleDeposit}>
              <label>Amount</label>
              <input
                type="number"
                placeholder="Enter amount"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
              />
              <button type="submit" disabled={loading}>
                {loading ? "Processing..." : "Deposit"}
              </button>
            </form>
            <button className="close-btn" onClick={() => setActiveModal(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* ✅ Send Money Modal (with PIN field) */}
      {activeModal === "send" && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Send Money</h2>
            <form onSubmit={handleSendMoney}>
              <label>Recipient Account Number</label>
              <input
                type="text"
                placeholder="Enter account number"
                value={recipientAccount}
                onChange={(e) => {
                  setRecipientAccount(e.target.value);
                  fetchRecipient(e.target.value);
                }}
              />

              {recipient && <p>Recipient: {recipient.name}</p>}

              <label>Amount</label>
              <input
                type="number"
                placeholder="Enter amount"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
              />

              {/* ✅ PIN field */}
              <label>Transaction PIN</label>
              <input
                type="password"
                maxLength="4"
                placeholder="Enter your PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
              />

              <button type="submit" disabled={!recipient || loading}>
                {loading ? "Processing..." : "Send"}
              </button>
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
      <h3>{description}</h3>
    </div>
  );
}

export default Dashboard;
