import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./Settings.css";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Settings = () => {
  const [activeModal, setActiveModal] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const storedUser = JSON.parse(localStorage.getItem("user"));

  // Change login password
  async function handleChangePassword(e) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("❌ New passwords do not match");
      return;
    }

    try {
      await axios.post("http://localhost:8081/change-password", {
        user_id: storedUser.id,
        currentPassword,
        newPassword,
      });

      toast.success("✅ Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setActiveModal(null);
    } catch (err) {
      toast.error("❌ " + (err.response?.data?.error || "Failed to change password"));
    }
  }

  // Change transaction PIN
  async function handleChangePin(e) {
    e.preventDefault();

    if (newPin !== confirmPin) {
      toast.error("❌ New PINs do not match");
      return;
    }

    try {
      await axios.post("http://localhost:8081/change-pin", {
        user_id: storedUser.id,
        currentPin,
        newPin,
      });

      toast.success("✅ Transaction PIN changed successfully!");
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      setActiveModal(null);
    } catch (err) {
      toast.error("❌ " + (err.response?.data?.error || "Failed to change PIN"));
    }
  }

  return (
    <div className="settings-container">
      <Sidebar />
      <div className="settings">
        <Header />
        <p className="page-title">Settings</p>

        {/* Settings buttons */}
        <div className="settings-card">
          <button className="btn" onClick={() => setActiveModal("password")}>
            Change Login Password
          </button>
          <button
            className="btn"
            style={{ marginTop: "10px" }}
            onClick={() => setActiveModal("pin")}
          >
            Change Transaction PIN
          </button>
        </div>
      </div>

      {/* Password Modal */}
      {activeModal === "password" && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Change Login Password</h3>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn">Update Password</button>
              <button type="button" className="btn" style={{ marginLeft: "10px", backgroundColor: "gray" }}
                onClick={() => setActiveModal(null)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PIN Modal */}
      {activeModal === "pin" && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Change Transaction PIN</h3>
            <form onSubmit={handleChangePin}>
              <div className="form-group">
                <label>Current PIN</label>
                <input
                  type="password"
                  maxLength="4"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>New PIN</label>
                <input
                  type="password"
                  maxLength="4"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm New PIN</label>
                <input
                  type="password"
                  maxLength="4"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn">Update PIN</button>
              <button type="button" className="btn" style={{ marginLeft: "10px", backgroundColor: "gray" }}
                onClick={() => setActiveModal(null)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
