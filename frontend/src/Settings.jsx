import React, { useState } from "react";
import "./Settings.css";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Settings = () => {
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");

  const handleSave = () => {
    alert("Settings saved (connect to backend later)");
  };

  return (
    <div className="settings-container">
        <Sidebar />
    <div className="settings">
        <Header />
      <h2 className="page-title">Settings</h2>
      <div className="settings-card">
        <div className="form-group">
          <label>Change Password</label>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Transaction PIN</label>
          <input
            type="password"
            placeholder="4-digit PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
        </div>

        <button onClick={handleSave} className="btn">
          Save Changes
        </button>
      </div>
    </div>
    </div>
  );
};

export default Settings;
