import React from "react";
import "./Profile.css";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Profile = () => {
  const user = {
    name: "Ayomide Emmanuel",
    email: "ayomide@example.com",
    phone: "+234 812 345 6789",
  };

  return (
    <div className="profile-container">
        <Sidebar />
    <div className="profile">
        <Header />
      <h2 className="page-title">My Profile</h2>
      <div className="profile-card">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.phone}</p>
      </div>
    </div>
    </div>
  );
};

export default Profile;
