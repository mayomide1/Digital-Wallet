import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./Savings.css"
import Sidebar from "./Sidebar";
import Header from "./Header";
import { RiUploadLine, RiDownloadLine } from "react-icons/ri";

const Savings = () => {
  const [savingsList, setSavingsList] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [totalSavings, setTotalSavings] = useState(0);

  const [activeModal, setActiveModal] = useState(null);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) return;

    axios
      .get(`http://localhost:8081/wallet/${storedUser.id}`)
      .then((res) => {
        setWallet(res.data[0]);
        fetchSavings(res.data[0].wallet_id);
      })
      .catch((err) => console.error(err));
  }, []);

  const fetchSavings = async (wallet_id) => {
    try {
      const res = await axios.get(
        `http://localhost:8081/savings/transactions/${wallet_id}`
      );
      setSavingsList(res.data);

      const totalRes = await axios.get(
        `http://localhost:8081/savings/${wallet_id}`
      );
      setTotalSavings(totalRes.data.total_savings || 0);
    } catch (err) {
      console.error("Error fetching savings:", err);
    }
  };

  const handleAddSavings = async (e) => {
    e.preventDefault();
    if (!wallet) return toast.error("Wallet not loaded ❌");

    setLoading(true);
    try {
      await axios.post("http://localhost:8081/savings", {
        wallet_id: wallet.wallet_id,
        amount: parseFloat(amount),
        description,
      });

      fetchSavings(wallet.wallet_id);
      const refreshed = await axios.get(
        `http://localhost:8081/wallet/${wallet.user_id}`
      );
      setWallet(refreshed.data[0]);

      setAmount("");
      setDescription("");
      setActiveModal(null);
      toast.success("Savings added successfully ✅");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add savings ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawSavings = async (e) => {
    e.preventDefault();
    if (!wallet) return toast.error("Wallet not loaded ❌");
    if (parseFloat(withdrawAmount) > totalSavings) {
      return toast.error("You cannot withdraw more than your total savings ❌");
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:8081/savings/withdraw", {
        wallet_id: wallet.wallet_id,
        amount: parseFloat(withdrawAmount),
      });

      fetchSavings(wallet.wallet_id);
      const refreshed = await axios.get(
        `http://localhost:8081/wallet/${wallet.user_id}`
      );
      setWallet(refreshed.data[0]);

      setWithdrawAmount("");
      setActiveModal(null);
      toast.success("Savings withdrawn successfully ✅");
    } catch (err) {
      console.error(err);
      toast.error("Failed to withdraw savings ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="savings-container">
      <Sidebar />
      <div className="savings">
        <Header />
      <h2 className="page-title">Savings</h2>

      <div className="wallet">
        <div className="wallet-balance">
          <h3>Total Savings</h3>
          <h3>₦{totalSavings}</h3>
        </div>
        <div className="payment-actions" onClick={() => setActiveModal("add")}>
          <p><RiDownloadLine size={25}/></p>
          <h3>Add Money</h3>
        </div>
        <div className="payment-actions" onClick={() => setActiveModal("withdraw")}>
          <p><RiUploadLine size={25}/></p>
          <h3>Withdraw Money</h3>
        </div>

      </div>
      <h3>Savings History</h3>
      <div className="savings-history">
      <table className="savings-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Amount (₦)</th>
            <th>Description</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {savingsList.length > 0 ? (
            savingsList.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.amount}</td>
                <td>{item.description}</td>
                <td>{new Date(item.date).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No savings yet</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>

      {activeModal === "add" && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Money to Savings</h3>
            <form onSubmit={handleAddSavings}>
              <label>Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
              />
              <label>Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (e.g. Emergency fund)"
              />
              <button type="submit" disabled={loading}>
                {loading ? "Processing..." : "Add"}
              </button>
              <button className= "close-btn" type="button" onClick={() => setActiveModal(null)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {activeModal === "withdraw" && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Withdraw from Savings</h3>
            <form onSubmit={handleWithdrawSavings}>
              <label>Amount</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? "Processing..." : "Withdraw"}
              </button>
              <button className= "close-btn" type="button" onClick={() => setActiveModal(null)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};


export default Savings;
