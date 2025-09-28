import React, { useEffect, useState } from "react";
import axios from "axios";

const Savings = () => {
  const [savingsList, setSavingsList] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [totalSavings, setTotalSavings] = useState(0);

  // Modal control
  const [activeModal, setActiveModal] = useState(null);

  // Form states
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

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
        `http://localhost:8081/savings/${wallet_id}`
      );
      setSavingsList(res.data);

      // Calculate total savings
      const total = res.data.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      setTotalSavings(total);
    } catch (err) {
      console.error("Error fetching savings:", err);
    }
  };

  const handleAddSavings = async (e) => {
    e.preventDefault();
    if (!wallet) return alert("Wallet not loaded yet");

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
      alert("Savings added successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to add savings");
    }
  };

  const handleWithdrawSavings = async (e) => {
    e.preventDefault();
    if (!wallet) return alert("Wallet not loaded yet");
    if (parseFloat(withdrawAmount) > totalSavings) {
      return alert("You cannot withdraw more than your total savings.");
    }

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
      alert("Savings withdrawn successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to withdraw savings");
    }
  };

  return (
    <div className="savings-container">
      <h2>Savings</h2>

      {/* Cards Section */}
      <div className="cards-container" style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div className="card" style={cardStyle} onClick={() => setActiveModal("add")}>
          <h3>Add Money</h3>
        </div>
        <div className="card" style={cardStyle} onClick={() => setActiveModal("withdraw")}>
          <h3>Withdraw Money</h3>
        </div>
        <div className="card" style={cardStyle}>
          <h3>Total Savings</h3>
          <p>₦{totalSavings}</p>
        </div>
      </div>

      {/* Savings History */}
      <h3>Savings History</h3>
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

      {/* Add Savings Modal */}
      {activeModal === "add" && (
        <div className="modal-overlay" style={overlayStyle}>
          <div className="modal" style={modalStyle}>
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
              <button type="submit">Add</button>
              <button type="button" onClick={() => setActiveModal(null)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {activeModal === "withdraw" && (
        <div className="modal-overlay" style={overlayStyle}>
          <div className="modal" style={modalStyle}>
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
              <button type="submit">Withdraw</button>
              <button type="button" onClick={() => setActiveModal(null)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Some inline styles (replace with CSS if you prefer)
const cardStyle = {
  flex: 1,
  background: "#f9f9f9",
  padding: "20px",
  borderRadius: "12px",
  textAlign: "center",
  cursor: "pointer",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
};

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const modalStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  width: "400px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
};

export default Savings;
