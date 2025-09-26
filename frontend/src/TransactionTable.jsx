import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './TransactionTable.css'
import axios from 'axios'


const TransactionTable = () => {
    
    const [transactions, setTransactions] = useState([])

    useEffect(() => {
        axios.get("http://localhost:8081/transactions")
        .then(res => {
            console.log(res.data)
            setTransactions(res.data)
        })
        .catch(err => console.log(err))
    },[])

  return (
    <>
    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>Amount</th>
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
                <td>{new Date(tx.date).toLocaleDateString()}</td>
            </tr>
            ))}
        </tbody>
    </table>

    </>
  )
}

export default TransactionTable
