import React, { useState, useEffect, useCallback } from "react";
import { useGameLoop } from "../hooks/useGameLoop"; // Yeni hook'umuz

// Sabitler
const INITIAL_SPEED = 50; // Başlangıç hızı (metre/saniye)
const GAME_STATE_KEY = "quizRunnerGameState"; // LocalStorage anahtarı

// Yeni engelleri ve puanları bu Game.js içinde yöneteceğiz.
const Game = ({ currentUser }) => {
  // Oyun Durumları
  const [score, setScore] = useState(0);
  const [runnerPosition, setRunnerPosition] = useState(0); // Oyuncunun kat ettiği toplam mesafe (metre)
  const [gameSpeed, setGameSpeed] = useState(INITIAL_SPEED); // Oyun hızı (sabit olarak artacak)
  const [isPaused, setIsPaused] = useState(false);
  const [message, setMessage] = useState(""); // Kullanıcıya gösterilecek mesaj (örn: "Kaldığınız yerden devam")

  // ----------------------------------------------------------------
  // 1. OYUN DURUMU SAKLAMA (PERSISTENCE) MANTIĞI
  // ----------------------------------------------------------------

  // Kullanıcıya özel kaydı yükleme
  useEffect(() => {
    const storedState = localStorage.getItem(
      `${GAME_STATE_KEY}_${currentUser}`
    );
    if (storedState) {
      const savedState = JSON.parse(storedState);
      setScore(savedState.score);
      setRunnerPosition(savedState.position);
      setGameSpeed(savedState.speed);
      setMessage(
        `Hoş geldin, ${currentUser}! Kaldığın yerden (${savedState.position.toFixed(
          0
        )}m) devam ediyorsun.`
      );
    } else {
      setMessage(`Hoş geldin, ${currentUser}! Yeni oyun başlıyor.`);
    }
  }, [currentUser]);

  // Durumu LocalStorage'a kaydetme
  const saveGame = useCallback(() => {
    const stateToSave = {
      score: score,
      position: runnerPosition,
      speed: gameSpeed,
      // Daha sonra buraya soru, kovalayan pozisyonu gibi verileri ekleyeceğiz
    };
    localStorage.setItem(
      `${GAME_STATE_KEY}_${currentUser}`,
      JSON.stringify(stateToSave)
    );
  }, [score, runnerPosition, gameSpeed, currentUser]);

  // ----------------------------------------------------------------
  // 2. TEMEL OYUN DÖNGÜSÜ MANTIĞI (useGameLoop)
  // ----------------------------------------------------------------

  // Her frame'de (karede) çalışacak fonksiyon
  const updateGame = (deltaTime) => {
    if (isPaused) return;

    // Runner'ın pozisyonunu hız ve zamanla güncelle: Mesafe = Hız * Zaman
    setRunnerPosition((prevPos) => prevPos + gameSpeed * deltaTime);

    // Skor ve Hızı Artırma Mantığı (Basitçe sürekli hızlansın)
    // Her 5 saniyede bir hız artsın
    setGameSpeed((prevSpeed) => prevSpeed * (1 + 0.01 * deltaTime)); // Sürekli %1 hız artışı
    setScore((prevScore) => prevScore + 1); // Her frame'de skor artsın (daha sonra mesafeye bağlarız)

    // Belirli aralıklarla oyunu kaydet
    if (
      Math.floor(runnerPosition) % 10 === 0 &&
      Math.floor(runnerPosition) !== 0
    ) {
      saveGame(); // Her 10 metrede bir otomatik kaydetme
    }
  };

  // Oyun döngüsünü başlat
  useGameLoop(updateGame);

  // ----------------------------------------------------------------
  // 3. RENDER (Görünüm)
  // ----------------------------------------------------------------

  return (
    <div
      style={{
        padding: "40px",
        minHeight: "80vh",
        textAlign: "center",
        backgroundColor: "#e9ecef",
      }}
    >
      <h2 style={{ color: "#007bff" }}>{message}</h2>

      <div
        style={{
          border: "3px solid #333",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "10px",
          maxWidth: "600px",
          margin: "20px auto",
        }}
      >
        <div
          style={{
            marginBottom: "15px",
            display: "flex",
            justifyContent: "space-around",
          }}
        >
          <p style={{ fontWeight: "bold" }}>
            Mesafe: {runnerPosition.toFixed(2)}m
          </p>
          <p style={{ fontWeight: "bold" }}>Skor: {score}</p>
          <p style={{ fontWeight: "bold" }}>Hız: {gameSpeed.toFixed(1)}m/s</p>
        </div>

        {/* Koşucu Yolu Simülasyonu */}
        <div
          style={{
            height: "50px",
            backgroundColor: "#adb5bd",
            borderRadius: "5px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Zemin Hareketi Simülasyonu (Arka planı kaydırarak sonsuz koşu hissi verir) */}
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundImage: `repeating-linear-gradient(to right, #495057, #495057 5px, #6c757d 5px, #6c757d 10px)`,
              backgroundSize: "20px 50px",
              // Pozisyon değiştikçe arkaplanı kaydır
              backgroundPositionX: `${-(runnerPosition * 2) % 20}px`,
              transition: "none", // React'in direkt pozisyon güncellemesi için transition'ı kapatıyoruz
            }}
          />

          {/* Runner Temsili (Ortada sabit duracak) */}
          <span
            role="img"
            aria-label="runner"
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "30px",
            }}
          >
            🏃
          </span>
        </div>

        <button
          onClick={() => setIsPaused((prev) => !prev)}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: isPaused ? "#ffc107" : "#17a2b8",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {isPaused ? "▶️ Devam Et" : "⏸️ Duraklat"}
        </button>
      </div>
    </div>
  );
};

export default Game;
