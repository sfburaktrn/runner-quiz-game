import { useState, useEffect } from "react";

// localStorage'daki tüm kullanıcı verilerini tutan anahtar
const USERS_KEY = "quizRunnerUsers";

// localStorage'daki aktif oturumu tutan anahtar
const CURRENT_USER_KEY = "quizRunnerCurrentUser";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Uygulama yüklendiğinde localStorage'dan mevcut kullanıcıyı oku
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const signup = (username, password) => {
    setError("");
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "{}");

    if (users[username]) {
      setError("Bu kullanıcı adı zaten alınmış.");
      return false;
    }

    users[username] = { password };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Başarılı kayıttan sonra otomatik giriş yap
    login(username, password);
    return true;
  };

  const login = (username, password) => {
    setError("");
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "{}");

    if (users[username] && users[username].password === password) {
      // Başarılı giriş
      setUser(username);
      localStorage.setItem(CURRENT_USER_KEY, username);
      return true;
    }

    // Hatalı giriş
    setError("Kullanıcı adı veya şifre hatalı.");
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    // NOT: Oyun durumunu silmiyoruz, devam edebilsin diye!
  };

  return {
    user, // Aktif kullanıcı adı
    error, // Hata mesajı
    login,
    signup,
    logout,
    isAuthenticated: !!user, // Giriş yapılıp yapılmadığı (boolean)
  };
};
