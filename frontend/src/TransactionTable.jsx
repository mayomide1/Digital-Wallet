import React, { useEffect, useState } from "react";
import "./TransactionTable.css";
import axios from "axios";

const TransactionTable = ({ limit }) => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) return;

    axios
      .get(`http://localhost:8081/wallet/${storedUser.id}`)
      .then((walletRes) => {
        const walletId = walletRes.data[0].wallet_id;
        return axios.get(`http://localhost:8081/transactions/${walletId}`);
      })
      .then((txRes) => {
        // ✅ apply limit only if provided
        if (limit) {
          setTransactions(txRes.data.slice(0, limit));
        } else {
          setTransactions(txRes.data);
        }
      })
      .catch((err) => console.log(err));
  }, [limit]);

  return (
    <div className="transaction-table">
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Amount (₦)</th>
          <th>Type</th>
          <th>Status</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((tx, index) => (
          <tr key={index}>
            <td>{tx.description}</td>
            <td>₦ {tx.amount}</td>
            <td>{tx.type}</td>
            <td>Approved</td>
            <td>{new Date(tx.date).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
};

export default TransactionTable;
