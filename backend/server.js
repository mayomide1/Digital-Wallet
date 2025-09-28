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

app.get('/users', (req, res) => {
    const sql = "SELECT * FROM users";
    db.query(sql, (err, result) => {
        if(err){
            return res.json({error: err})
        } else {
            res.json(result)
        }
    })
})

// Get wallet for a specific user
app.get("/wallet/:userId", (req, res) => {
  const { userId } = req.params;
  const sql = "SELECT * FROM wallets WHERE user_id = ?";
  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
});

// Get transactions for a specific wallet
app.get("/transactions/:walletId", (req, res) => {
  const { walletId } = req.params;
  const sql = "SELECT * FROM transactions WHERE wallet_id = ? ORDER BY date DESC";
  db.query(sql, [walletId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
});

// LOGIN
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    
    db.query(sql, [email, password], (err, result) => {
        if (err) return res.json({ error: err });

        if (result.length > 0) {
            // login successful
            return res.json({ success: true, user: result[0] });
        } else {
            return res.json({ success: false, message: "Invalid email or password" });
        }
    });
});

// REGISTER
app.post("/register", (req, res) => {
  const { name, email, phone, password } = req.body;

  // 1. Insert user
  const insertUserSql = "INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)";
  db.query(insertUserSql, [name, email, phone, password], (err, result) => {
    if (err) return res.json({ error: err });

    const userId = result.insertId; // <-- This is the new user's ID

    // 2. Create wallet for the user
    const createWalletSql = "INSERT INTO wallets (user_id, balance) VALUES (?, 0)";
    db.query(createWalletSql, [userId], (err2, walletResult) => {
      if (err2) return res.json({ error: err2 });

      const walletId = walletResult.insertId; // Wallet ID

      // 3. Create initial savings row
      const createSavingsSql = "INSERT INTO savings (user_id, total_savings) VALUES (?, 0)";
      db.query(createSavingsSql, [userId], (err3) => {
        if (err3) return res.json({ error: err3 });

        // 4. Optionally create initial transaction row (like 'Account Created')
        const createTxSql = "INSERT INTO transactions (wallet_id, type, amount, description) VALUES (?, 'credit', 0, 'Account Created')";
        db.query(createTxSql, [walletId], (err4) => {
          if (err4) return res.json({ error: err4 });

          // All done!
          res.json({ success: true, message: "User registered and wallet/savings initialized", userId });
        });
      });
    });
  });
});

// Deposit
app.post("/deposit", (req, res) => {
  const { wallet_id, amount } = req.body;

  if (!wallet_id || !amount) {
    return res.status(400).json({ error: "Wallet ID and amount are required" });
  }

  // 1. Update wallet balance
  const updateWallet = "UPDATE wallets SET balance = balance + ? WHERE wallet_id = ?";
  db.query(updateWallet, [amount, wallet_id], (err, result) => {
    if (err) return res.status(500).json({ error: err });

    // 2. Insert into transactions table
    const insertTx = `
      INSERT INTO transactions (wallet_id, type, amount, description, date)
      VALUES (?, 'credit', ?, 'Deposit', NOW())
    `;
    db.query(insertTx, [wallet_id, amount], (err2, result2) => {
      if (err2) return res.status(500).json({ error: err2 });

      res.json({ message: "Deposit successful" });
    });
  });
});


// Withdraw
// Withdraw
app.post("/withdraw", (req, res) => {
  const { wallet_id, amount } = req.body;

  if (!wallet_id || !amount) {
    return res.status(400).json({ success: false, error: "Wallet ID and amount are required" });
  }

  // 1. Check balance (use wallet_id not id)
  const checkSql = "SELECT balance FROM wallets WHERE wallet_id = ?";
  db.query(checkSql, [wallet_id], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });

    if (results.length === 0) {
      return res.json({ success: false, error: "Wallet not found" });
    }

    const balance = results[0].balance;
    if (balance < amount) {
      return res.json({ success: false, error: "Insufficient funds" });
    }

    // 2. Deduct from wallet
    const updateSql = "UPDATE wallets SET balance = balance - ? WHERE wallet_id = ?";
    db.query(updateSql, [amount, wallet_id], (err2) => {
      if (err2) return res.status(500).json({ success: false, error: err2 });

      // 3. Record transaction (no date column)
      const txSql = `
        INSERT INTO transactions (wallet_id, type, amount, description)
        VALUES (?, 'debit', ?, 'Withdrawal')
      `;
      db.query(txSql, [wallet_id, amount], (err3) => {
        if (err3) return res.status(500).json({ success: false, error: err3 });

        res.json({ success: true, message: "Withdrawal successful" });
      });
    });
  });
});

// Add Expense
app.post("/expense", (req, res) => {
  const { wallet_id, amount, description } = req.body;

  if (!wallet_id || !amount) {
    return res.status(400).json({ error: "Wallet ID and amount are required" });
  }

  // 1. Deduct from wallet balance
  const updateWallet = "UPDATE wallets SET balance = balance - ? WHERE wallet_id = ?";
  db.query(updateWallet, [amount, wallet_id], (err) => {
    if (err) return res.status(500).json({ error: err });

    // 2. Record transaction
    const insertTx = `
      INSERT INTO transactions (wallet_id, type, amount, description, category, date)
      VALUES (?, 'debit', ?, ?, 'expense', NOW())
    `;
    db.query(insertTx, [wallet_id, amount, description || "Expense"], (err2) => {
      if (err2) return res.status(500).json({ error: err2 });

      res.json({ message: "Expense recorded successfully" });
    });
  });
});


// Add Savings
// Savings
app.post("/savings", (req, res) => {
  const { wallet_id, amount, description } = req.body;

  if (!wallet_id || !amount) {
    return res.status(400).json({ error: "Wallet ID and amount are required" });
  }

  // 1. Deduct from wallet
  const updateWallet = "UPDATE wallets SET balance = balance - ? WHERE wallet_id = ?";
  db.query(updateWallet, [amount, wallet_id], (err, result) => {
    if (err) return res.status(500).json({ error: err });

    // 2. Insert into savings table
    const insertSavings = `
      INSERT INTO savings (wallet_id, amount, description)
      VALUES (?, ?, ?)
    `;
    db.query(insertSavings, [wallet_id, amount, description || 'Savings'], (err2, result2) => {
      if (err2) return res.status(500).json({ error: err2 });

      // 3. Also insert into transactions (so history shows it)
      const insertTx = `
        INSERT INTO transactions (wallet_id, type, category, amount, description)
        VALUES (?, 'withdraw', 'savings', ?, ?)
      `;
      db.query(insertTx, [wallet_id, amount, description || 'Savings'], (err3) => {
        if (err3) return res.status(500).json({ error: err3 });

        res.json({ message: "Savings added successfully" });
      });
    });
  });
});



// Get summary
app.get("/summary/:wallet_id", (req, res) => {
  const { wallet_id } = req.params;

  const sql = `
    SELECT 
      SUM(CASE WHEN category='savings' THEN amount ELSE 0 END) AS total_savings,
      SUM(CASE WHEN category='expense' THEN amount ELSE 0 END) AS total_expenses,
      SUM(CASE WHEN category='wallet' AND type='credit' THEN amount ELSE 0 END) AS total_deposits,
      SUM(CASE WHEN category='wallet' AND type='debit' THEN amount ELSE 0 END) AS total_withdrawals
    FROM transactions
    WHERE wallet_id = ?
  `;

  db.query(sql, [wallet_id], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: "Database error (summary)" });
    res.json({ success: true, ...results[0] });
  });
});

// Add Savings
app.post("/savings", (req, res) => {
  const { wallet_id, amount, description } = req.body;

  if (!wallet_id || !amount) {
    return res.status(400).json({ error: "Wallet ID and amount are required" });
  }

  // 1. Deduct money from wallet
  const updateWallet = "UPDATE wallets SET balance = balance - ? WHERE wallet_id = ?";
  db.query(updateWallet, [amount, wallet_id], (err) => {
    if (err) return res.status(500).json({ error: err });

    // 2. Insert into savings table
    const insertSavings = `
      INSERT INTO savings (wallet_id, amount, description, date)
      VALUES (?, ?, ?, NOW())
    `;
    db.query(insertSavings, [wallet_id, amount, description || "Savings"], (err2) => {
      if (err2) return res.status(500).json({ error: err2 });

      // 3. Insert into transactions table (for wallet history)
      const insertTx = `
        INSERT INTO transactions (wallet_id, type, category, amount, description, date)
        VALUES (?, 'debit', 'savings', ?, 'Savings', NOW())
      `;
      db.query(insertTx, [wallet_id, amount], (err3) => {
        if (err3) return res.status(500).json({ error: err3 });

        res.json({ success: true, message: "Savings added successfully!" });
      });
    });
  });
});


// Withdraw from Savings
app.post("/savings/withdraw", (req, res) => {
  const { wallet_id, amount } = req.body;

  if (!wallet_id || !amount) {
    return res.status(400).json({ error: "wallet_id and amount are required" });
  }

  // 1. Check total savings
  const checkSavings = `
    SELECT SUM(amount) as total FROM savings WHERE wallet_id = ?;
  `;
  db.query(checkSavings, [wallet_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });

    const totalSavings = results[0].total || 0;
    if (totalSavings < amount) {
      return res.status(400).json({ error: "Not enough savings to withdraw" });
    }

    // 2. Record withdrawal in savings (negative amount)
    const insertSavings = `
      INSERT INTO savings (wallet_id, amount, description, date)
      VALUES (?, ?, 'Savings Withdrawal', NOW());
    `;
    db.query(insertSavings, [wallet_id, -amount], (err2) => {
      if (err2) return res.status(500).json({ error: err2 });

      // 3. Add to wallet balance
      const updateWallet = `
        UPDATE wallets SET balance = balance + ? WHERE wallet_id = ?;
      `;
      db.query(updateWallet, [amount, wallet_id], (err3) => {
        if (err3) return res.status(500).json({ error: err3 });

        // 4. Record wallet transaction
        const insertTx = `
          INSERT INTO transactions (wallet_id, type, category, amount, description, date)
          VALUES (?, 'credit', 'savings', ?, 'Savings Withdrawal', NOW());
        `;
        db.query(insertTx, [wallet_id, amount], (err4) => {
          if (err4) return res.status(500).json({ error: err4 });

          res.json({ success: true, message: "Savings withdrawn successfully!" });
        });
      });
    });
  });
});

// Get total savings for a wallet
app.get("/savings/:wallet_id", (req, res) => {
  const { wallet_id } = req.params;
  const sql = "SELECT SUM(amount) AS total_savings FROM savings WHERE wallet_id = ?";
  db.query(sql, [wallet_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true, total_savings: results[0].total_savings || 0 });
  });
});




app.listen(8081, () => {
    console.log('Listening....')
});