import React, {useEffect, useState} from "react";
import "./Profile.css";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="profile-container">
        <Sidebar />
    <div className="profile">
        <Header />
      <h2 className="page-title">My Profile</h2>
    <div className="profile-card">
      {user ? (
        <>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
          <p><strong>Account Created on: </strong> {new Date(user.date).toLocaleDateString()}</p>
        </>
      ) : (
        <p>Loading user...</p>
      )}
    </div>
    </div>
    </div>
  );
};

export default Profile;
