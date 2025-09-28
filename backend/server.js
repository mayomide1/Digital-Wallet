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
});

// Get all users
app.get('/users', (req, res) => {
    const sql = "SELECT * FROM users";
    db.query(sql, (err, result) => {
        if (err) {
            return res.json({ error: err });
        } else {
            res.json(result);
        }
    });
});

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

// REGISTER
app.post("/register", (req, res) => {
  const { name, email, phone, password } = req.body;

  // Generate account number (remove first 0, keep 10 digits)
  let accountNumber = phone.replace(/^0/, ""); 
  accountNumber = accountNumber.slice(0, 10);

  const insertUserSql =
    "INSERT INTO users (name, email, phone, password, account_number) VALUES (?, ?, ?, ?, ?)";
  db.query(insertUserSql, [name, email, phone, password, accountNumber], (err, result) => {
    if (err) return res.json({ error: err });

    const userId = result.insertId;

    // Create wallet
    db.query("INSERT INTO wallets (user_id, balance) VALUES (?, 0)", [userId], (err2, walletResult) => {
      if (err2) return res.json({ error: err2 });

      // Create savings
      db.query("INSERT INTO savings (user_id, total_savings) VALUES (?, 0)", [userId], (err3) => {
        if (err3) return res.json({ error: err3 });

        // Initial transaction
        db.query(
          "INSERT INTO transactions (wallet_id, type, amount, description) VALUES (?, 'credit', 0, 'Account Created')",
          [walletResult.insertId],
          (err4) => {
            if (err4) return res.json({ error: err4 });

            // ✅ Fetch the full user row with account_number
            db.query("SELECT * FROM users WHERE id = ?", [userId], (err5, userResult) => {
              if (err5) return res.json({ error: err5 });
              res.json({ success: true, user: userResult[0] });
            });
          }
        );
      });
    });
  });
});

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, result) => {
    if (err) return res.json({ error: err });

    if (result.length > 0) {
      return res.json({ success: true, user: result[0] });
    } else {
      return res.json({ success: false, message: "Invalid email or password" });
    }
  });
});

// Change login password
app.post("/change-password", (req, res) => {
  const { user_id, currentPassword, newPassword } = req.body;

  db.query(
    "SELECT password FROM users WHERE id = ?",
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "DB error" });
      if (results.length === 0) return res.status(404).json({ error: "User not found" });

      if (results[0].password !== currentPassword) {
        return res.status(400).json({ error: "Current password incorrect" });
      }

      db.query(
        "UPDATE users SET password = ? WHERE id = ?",
        [newPassword, user_id],
        (err2) => {
          if (err2) return res.status(500).json({ error: "Failed to update password" });
          res.json({ message: "Password updated" });
        }
      );
    }
  );
});

// Set Transaction PIN
app.post("/set-pin", (req, res) => {
  const { user_id, pin } = req.body;

  if (!user_id || !pin) {
    return res.status(400).json({ error: "User ID and PIN are required" });
  }

  const sql = "UPDATE users SET transaction_pin = ? WHERE id = ?";
  db.query(sql, [pin, user_id], (err, result) => {
    if (err) return res.status(500).json({ error: err });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, message: "Transaction PIN set successfully!" });
  });
});

// Deposit
app.post("/deposit", (req, res) => {
    const { wallet_id, amount } = req.body;

    if (!wallet_id || !amount) {
        return res.status(400).json({ error: "Wallet ID and amount are required" });
    }

    const updateWallet = "UPDATE wallets SET balance = balance + ? WHERE wallet_id = ?";
    db.query(updateWallet, [amount, wallet_id], (err) => {
        if (err) return res.status(500).json({ error: err });

        const insertTx = `
            INSERT INTO transactions (wallet_id, type, amount, description, date)
            VALUES (?, 'credit', ?, 'Deposit', NOW())
        `;
        db.query(insertTx, [wallet_id, amount], (err2) => {
            if (err2) return res.status(500).json({ error: err2 });

            res.json({ message: "Deposit successful" });
        });
    });
});

// Change transaction PIN
app.post("/change-pin", (req, res) => {
  const { user_id, currentPin, newPin } = req.body;

  db.query(
    "SELECT transaction_pin FROM users WHERE id = ?",
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "DB error" });
      if (results.length === 0) return res.status(404).json({ error: "User not found" });

      if (results[0].transaction_pin !== currentPin) {
        return res.status(400).json({ error: "Current PIN incorrect" });
      }

      db.query(
        "UPDATE users SET transaction_pin = ? WHERE id = ?",
        [newPin, user_id],
        (err2) => {
          if (err2) return res.status(500).json({ error: "Failed to update PIN" });
          res.json({ message: "PIN updated" });
        }
      );
    }
  );
});

// Send Money API with PIN verification
app.post("/send-money", (req, res) => {
  const { sender_id, recipient_account, amount, pin } = req.body;

  if (!sender_id || !recipient_account || !amount || !pin) {
    return res.status(400).json({ error: "Missing fields (sender_id, recipient_account, amount, pin)" });
  }

  // Verify PIN
  db.query("SELECT transaction_pin FROM users WHERE id = ?", [sender_id], (err, pinResult) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!pinResult.length || pinResult[0].transaction_pin !== pin) {
      return res.status(400).json({ error: "Invalid transaction PIN" });
    }

    //Check sender balance
    db.query("SELECT * FROM wallets WHERE user_id = ?", [sender_id], (err, senderResult) => {
      if (err) return res.status(500).json({ error: err.message });
      if (senderResult.length === 0) return res.status(404).json({ error: "Sender not found" });

      const senderWallet = senderResult[0];

      if (senderWallet.balance < amount) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      // Get sender name
      db.query("SELECT name FROM users WHERE id = ?", [sender_id], (err, senderUserResult) => {
        if (err) return res.status(500).json({ error: err.message });

        const senderName = senderUserResult[0].name;

        // Find recipient
        db.query(
          `SELECT w.*, u.name 
           FROM wallets w
           JOIN users u ON w.user_id = u.id
           WHERE u.account_number = ?`,
          [recipient_account],
          (err, recipientResult) => {
            if (err) return res.status(500).json({ error: err.message });
            if (recipientResult.length === 0) return res.status(404).json({ error: "Recipient not found" });

            const recipientWallet = recipientResult[0];
            const recipientName = recipientWallet.name;

            //Deduct from sender
            db.query("UPDATE wallets SET balance = balance - ? WHERE user_id = ?", [amount, sender_id]);

            // Credit recipient
            db.query("UPDATE wallets SET balance = balance + ? WHERE wallet_id = ?", [amount, recipientWallet.wallet_id]);

            //Insert into transactions
            db.query(
              "INSERT INTO transactions (wallet_id, amount, type, description) VALUES (?, ?, 'debit', ?)",
              [senderWallet.wallet_id, amount, `You sent money to ${recipientName}`]
            );

            db.query(
              "INSERT INTO transactions (wallet_id, amount, type, description) VALUES (?, ?, 'credit', ?)",
              [recipientWallet.wallet_id, amount, `You received money from ${senderName}`]
            );

            //Respond
            return res.json({
              success: true,
              message: `Transfer successful to ${recipientName}`,
              recipient: recipientName,
              amount: amount
            });
          }
        );
      });
    });
  });
});


// Get recipient details by account number
app.get("/users/by-account/:account_number", (req, res) => {
  const { account_number } = req.params;

  const sql = "SELECT id, name, email, phone, account_number FROM users WHERE account_number = ?";
  db.query(sql, [account_number], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0) return res.status(404).json({ error: "User not found" });

    res.json(result[0]);
  });
});

// Savings
app.post("/savings", (req, res) => {
    const { wallet_id, amount, description } = req.body;

    if (!wallet_id || !amount) {
        return res.status(400).json({ error: "Wallet ID and amount are required" });
    }

    const updateWallet = "UPDATE wallets SET balance = balance - ? WHERE wallet_id = ?";
    db.query(updateWallet, [amount, wallet_id], (err) => {
        if (err) return res.status(500).json({ error: err });

        const insertSavings = `
            INSERT INTO savings (wallet_id, amount, description, date)
            VALUES (?, ?, ?, NOW())
        `;
        db.query(insertSavings, [wallet_id, amount, description || "Savings"], (err2) => {
            if (err2) return res.status(500).json({ error: err2 });

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

    const checkSavings = `SELECT SUM(amount) as total FROM savings WHERE wallet_id = ?;`;
    db.query(checkSavings, [wallet_id], (err, results) => {
        if (err) return res.status(500).json({ error: err });

        const totalSavings = results[0].total || 0;
        if (totalSavings < amount) {
            return res.status(400).json({ error: "Not enough savings to withdraw" });
        }

        const insertSavings = `
            INSERT INTO savings (wallet_id, amount, description, date)
            VALUES (?, ?, 'Savings Withdrawal', NOW());
        `;
        db.query(insertSavings, [wallet_id, -amount], (err2) => {
            if (err2) return res.status(500).json({ error: err2 });

            const updateWallet = `UPDATE wallets SET balance = balance + ? WHERE wallet_id = ?;`;
            db.query(updateWallet, [amount, wallet_id], (err3) => {
                if (err3) return res.status(500).json({ error: err3 });

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

// Get savings transactions for a wallet
app.get("/savings/transactions/:wallet_id", (req, res) => {
    const { wallet_id } = req.params;
    const sql = "SELECT * FROM savings WHERE wallet_id = ? ORDER BY date DESC";
    db.query(sql, [wallet_id], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
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
    console.log('Listening....');
});
