import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './TransactionTable.css'
import axios from 'axios'


const TransactionTable = () => {
    
    const [transactions, setTransactions] = useState([])

useEffect(() => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  if (!storedUser) return;
  console.log(storedUser)

  axios.get(`http://localhost:8081/wallet/${storedUser.id}`)
    .then(walletRes => {
        console.log(walletRes.data)
      const walletId = walletRes.data[0].wallet_id;
      return axios.get(`http://localhost:8081/transactions/${walletId}`);
    })
    .then(txRes => {
        console.log(txRes)
      setTransactions(txRes.data);
    })
    .catch(err => console.log(err));
}, []);


  return (
    <>
    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Status</th>
                <th>Date /Time</th>
            </tr>
        </thead>
        <tbody>
            {transactions.map((tx, index) => (
            <tr key={index}>
                <td>{tx.description}</td>
                <td>₦ {tx.amount}</td>
                <td>{tx.type}</td>
                <td>Approved</td>
                <td>{new Date(tx.date).toLocaleDateString()}, {new Date(tx.date).toLocaleTimeString()}</td>
            </tr>
            ))}
        </tbody>
    </table>

    </>
  )
}

export default TransactionTable
