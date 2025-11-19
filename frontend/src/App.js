import React, { useState } from "react";
import { useAuth } from "./hooks/useAuth"; // useAuth hook'u artık burada!
import Login from "./components/Login";
import Signup from "./components/Signup";
import Game from "./components/Game"; // Game bileşenini birazdan oluşturacağız

// Ekran durumlarını yönetmek için sabitler
const SCREENS = {
  LOGIN: "login",
  SIGNUP: "signup",
  GAME: "game",
};

function App() {
  // useAuth hook'undan kimlik doğrulama durumunu alıyoruz
  const { isAuthenticated, logout, user } = useAuth();

  // Giriş yapılmadıysa hangi ekranın gösterileceğini tutar (Login/Signup)
  const [currentScreen, setCurrentScreen] = useState(SCREENS.LOGIN);

  // Eğer kullanıcı giriş yapmışsa, doğrudan oyun ekranını göster.
  if (isAuthenticated) {
    return (
      <div>
        <header
          style={{
            padding: "10px",
            backgroundColor: "#333",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>Hoş Geldin, {user}!</span>
          <button
            onClick={logout}
            style={{
              padding: "5px 10px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Çıkış Yap
          </button>
        </header>
        {/* Kaldığı yerden devam etme mantığı Game bileşeni içinde olacak.
                    useAuth içindeki 'user' değişkenini Game'e props olarak gönderiyoruz. 
                */}
        <Game currentUser={user} />
      </div>
    );
  }

  // Giriş yapılmadıysa: Login veya Signup ekranını göster
  return (
    <div className="App" style={{ textAlign: "center", paddingTop: "50px" }}>
      <h1>RUNNER QUIZ GAME</h1>

      {currentScreen === SCREENS.LOGIN && (
        // Login bileşenini göster
        <Login />
      )}

      {currentScreen === SCREENS.SIGNUP && (
        // Signup bileşenini göster ve Giriş Ekranına geçiş fonksiyonunu gönder
        <Signup onSwitchToLogin={() => setCurrentScreen(SCREENS.LOGIN)} />
      )}

      {/* Giriş/Kayıt arasında geçiş butonu (Sadece Login ekranındayken görünür) */}
      {currentScreen === SCREENS.LOGIN && (
        <p style={{ marginTop: "20px" }}>
          Hesabın yok mu?
          <button
            onClick={() => setCurrentScreen(SCREENS.SIGNUP)}
            style={{
              background: "none",
              border: "none",
              color: "blue",
              cursor: "pointer",
              textDecoration: "underline",
              marginLeft: "5px",
            }}
          >
            Yeni Hesap Oluştur
          </button>
        </p>
      )}
    </div>
  );
}

export default App;
