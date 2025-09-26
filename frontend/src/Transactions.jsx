import React from "react";
import "./Transactions.css";
import Sidebar from "./Sidebar";
import Header from "./Header";
import TransactionTable from "./TransactionTable";

const Transactions = () => {

  return (
    <div className="transactions-container">
        <Sidebar />
    <div className="transactions">
            <Header />
      <h2 className="page-title">Transaction History</h2>
       < TransactionTable />
    </div>
    </div>
  );
};

export default Transactions;
