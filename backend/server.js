const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: '',
    database: "digital_wallet"
})

app.get('/', (req, res) => {
    const sql = "SELECT * FROM users";
    db.query(sql, (err, result) => {
        if(err){
            return res.json({error: err})
        } else {
            res.json(result)
        }
    })
})

app.get('/wallet', (req, res) => {
    const sql = "SELECT * FROM wallets";
    db.query(sql, (err, result) => {
        if(err){
            return res.json({error: err})
        } else {
            res.json(result)
        }
    })
})

app.get("/transactions", (req, res) =>{
    const sql = "SELECT * FROM transactions"
    db.query(sql, (err, result) => {
        if(err){
            return res.json({error: err})
        } else {
            res.json(result)
        }
    })
})

// Deposit
app.post("/deposit", (req, res) => {
  const { wallet_id, amount } = req.body;

  // 1. Insert into transactions
  const insertTx =
    "INSERT INTO transactions (wallet_id, type, amount, description) VALUES (?, 'credit', ?, 'Deposit')";
  db.query(insertTx, [wallet_id, amount], (err) => {
    if (err) return res.json({ error: err });

    // 2. Update wallet balance
    const updateWallet =
      "UPDATE wallets SET balance = balance + ? WHERE id = ?";
    db.query(updateWallet, [amount, wallet_id], (err2) => {
      if (err2) return res.json({ error: err2 });
      return res.json({ success: true, message: "Deposit successful" });
    });
  });
});

// Withdraw
app.post("/withdraw", (req, res) => {
  const { wallet_id, amount } = req.body;
    console.log(req.body)

  // 1. First check if user has enough balance
  const checkBalance = "SELECT balance FROM wallets WHERE id = ?";
  db.query(checkBalance, [wallet_id], (err, result) => {
    if (err) return res.json({ error: err });
    if (result.length === 0) return res.json({ error: "Wallet not found" });

    const currentBalance = result[0].balance;
    if (currentBalance < amount) {
      return res.json({ error: "Insufficient funds" });
    }

    // 2. Insert into transactions (debit)
    const insertTx = `
      INSERT INTO transactions (wallet_id, type, amount, description) 
      VALUES (?, 'debit', ?, 'Withdrawal')
    `;
    db.query(insertTx, [wallet_id, amount], (err2) => {
      if (err2) return res.json({ error: err2 });

      // 3. Update wallet balance
      const updateWallet = "UPDATE wallets SET balance = balance - ? WHERE id = ?";
      db.query(updateWallet, [amount, wallet_id], (err3) => {
        if (err3) return res.json({ error: err3 });

        return res.json({ success: true, message: "Withdrawal successful" });
      });
    });
  });
});




app.listen(8081, () => {
    console.log('Listening....')
})