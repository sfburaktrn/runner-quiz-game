import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { login, error } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault(); // Sayfanın yenilenmesini engelle

    if (username.trim() && password.trim()) {
      const success = login(username, password);

      // ✅ ÇÖZÜM BURADA: Giriş başarılıysa sayfayı yenile
      if (success) {
        // Bu, App.js'in yeniden yüklenmesini ve localStorage'dan
        // yeni oturum durumunu okumasını sağlar.
        window.location.reload();
      }
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
      <h2>🏃 Quiz Runner Giriş Yap</h2>

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
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Giriş Yap
        </button>
      </form>
    </div>
  );
};

export default Login;
