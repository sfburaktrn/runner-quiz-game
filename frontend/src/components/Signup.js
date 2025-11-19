import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const Signup = ({ onSwitchToLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { signup, error } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (username.trim() && password.trim()) {
      signup(username, password);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "300px",
        margin: "auto",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h2>📝 Quiz Runner Kaydol</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label
            htmlFor="username"
            style={{ display: "block", textAlign: "left" }}
          >
            Kullanıcı Adı:
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="password"
            style={{ display: "block", textAlign: "left" }}
          >
            Şifre:
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: "10px 15px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Kaydol ve Giriş Yap
        </button>
      </form>
      <p style={{ marginTop: "15px", fontSize: "14px" }}>
        Zaten hesabın var mı?
        <button
          onClick={onSwitchToLogin}
          style={{
            background: "none",
            border: "none",
            color: "#007bff",
            cursor: "pointer",
            textDecoration: "underline",
            marginLeft: "5px",
          }}
        >
          Giriş Yap
        </button>
      </p>
    </div>
  );
};

export default Signup;
