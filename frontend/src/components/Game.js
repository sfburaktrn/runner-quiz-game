import React, { useState, useEffect, useCallback } from "react";
import { useGameLoop } from "../hooks/useGameLoop";

// =================================================================
// SABİTLER VE VERİLER
// =================================================================

const INITIAL_SPEED = 50; // Başlangıç hızı (metre/saniye)
const CHASER_SPEED = 40; // Kovalayanın başlangıç hızı
const GAME_STATE_KEY = "quizRunnerGameState"; // LocalStorage anahtarı
const COIN_VALUE = 50; // Her coin kaç puan?

// Soru Veri Yapısı
const QUIZ_QUESTIONS = [
  {
    id: 1,
    question:
      "React'te bir bileşenin durumunu (state) yönetmek için hangi Hook kullanılır?",
    options: ["useState", "useEffect", "useContext", "useReducer"],
    answer: "useState",
    obstacleDistance: 200,
  },
  {
    id: 2,
    question:
      "DOM'a etki eden yan etkileri (API çağrısı, zamanlayıcı) yönetmek için hangi Hook kullanılır?",
    options: ["useState", "useEffect", "useMemo", "useCallback"],
    answer: "useEffect",
    obstacleDistance: 500,
  },
  {
    id: 3,
    question:
      "Bir Koşucu (Runner) oyununda, akıcı hareket için en uygun tarayıcı API'si hangisidir?",
    options: [
      "setTimeout",
      "setInterval",
      "requestAnimationFrame",
      "async/await",
    ],
    answer: "requestAnimationFrame",
    obstacleDistance: 850,
  },
];

// =================================================================
// GAME COMPONENT
// =================================================================

const Game = ({ currentUser }) => {
  // Oyun Durumları
  const [score, setScore] = useState(0);
  const [runnerPosition, setRunnerPosition] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(INITIAL_SPEED);
  const [isPaused, setIsPaused] = useState(false);
  const [message, setMessage] = useState("");

  // Coin Durumu (YENİ)
  const [coins, setCoins] = useState([]);

  // Soru ve Engel Durumları
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [nextObstacleDistance, setNextObstacleDistance] = useState(
    QUIZ_QUESTIONS[0].obstacleDistance
  );
  const [isQuestionActive, setIsQuestionActive] = useState(false);

  // Kovalayan (Chaser) Durumları
  const [chaserPosition, setChaserPosition] = useState(-50);
  const [chaserSpeed, setChaserSpeed] = useState(CHASER_SPEED);
  const [gameOver, setGameOver] = useState(false);

  // Coin Üretme Fonksiyonu (YENİ)
  // Belirli bir aralıkta rastgele coinler oluşturur
  const spawnCoins = useCallback((startPos, endPos) => {
    const newCoins = [];
    // Her 30 metrede bir %50 şansla coin koy
    for (let pos = startPos; pos < endPos; pos += 30) {
      if (Math.random() > 0.5) {
        newCoins.push({ id: pos, position: pos, collected: false });
      }
    }
    return newCoins;
  }, []);

  // ----------------------------------------------------------------
  // 1. OYUN DURUMU SAKLAMA (PERSISTENCE) MANTIĞI
  // ----------------------------------------------------------------

  const saveGame = useCallback(() => {
    const stateToSave = {
      score,
      position: runnerPosition,
      speed: gameSpeed,
      nextObstacle: nextObstacleDistance,
      chaserPos: chaserPosition,
      // Coinleri kaydetmek maliyetli olabilir, sadece skoru tutuyoruz.
      // Ancak oyun devamlılığı için mevcut coinleri de tutabiliriz.
      coins: coins.filter((c) => !c.collected && c.position > runnerPosition),
    };
    localStorage.setItem(
      `${GAME_STATE_KEY}_${currentUser}`,
      JSON.stringify(stateToSave)
    );
  }, [
    score,
    runnerPosition,
    gameSpeed,
    nextObstacleDistance,
    chaserPosition,
    coins,
    currentUser,
  ]);

  // Kayıtlı oyunu yükleme
  useEffect(() => {
    const storedState = localStorage.getItem(
      `${GAME_STATE_KEY}_${currentUser}`
    );
    if (storedState) {
      const savedState = JSON.parse(storedState);
      setScore(savedState.score);
      setRunnerPosition(savedState.position);
      setGameSpeed(savedState.speed);
      setNextObstacleDistance(
        savedState.nextObstacle || QUIZ_QUESTIONS[0].obstacleDistance
      );
      setChaserPosition(
        savedState.chaserPos !== undefined ? savedState.chaserPos : -50
      );

      // Kayıtlı coinleri yükle veya yeni üret
      if (savedState.coins && savedState.coins.length > 0) {
        setCoins(savedState.coins);
      } else {
        setCoins(
          spawnCoins(savedState.position + 50, savedState.position + 500)
        );
      }

      setMessage(
        `Hoş geldin, ${currentUser}! Kaldığın yerden devam ediyorsun.`
      );
    } else {
      setMessage(`Hoş geldin, ${currentUser}! Yeni oyun başlıyor.`);
      setNextObstacleDistance(QUIZ_QUESTIONS[0].obstacleDistance);
      setCoins(spawnCoins(50, 500)); // İlk 500m için coin üret
    }
  }, [currentUser, spawnCoins]);

  const resetGame = () => {
    setScore(0);
    setRunnerPosition(0);
    setGameSpeed(INITIAL_SPEED);
    setChaserPosition(-50);
    setChaserSpeed(CHASER_SPEED);
    setNextObstacleDistance(QUIZ_QUESTIONS[0].obstacleDistance);
    setCoins(spawnCoins(50, 500));
    setIsPaused(false);
    setGameOver(false);
    setMessage(`Yeni oyun başladı! Başarılar ${currentUser}.`);
    localStorage.removeItem(`${GAME_STATE_KEY}_${currentUser}`);
  };

  // ----------------------------------------------------------------
  // 2. CEVAPLAMA MANTIĞI
  // ----------------------------------------------------------------

  const handleAnswer = (selectedOption) => {
    if (!currentQuestion) return;

    if (selectedOption === currentQuestion.answer) {
      // DOĞRU CEVAP
      setMessage("✅ Doğru! Hızlandın!");
      setGameSpeed((prev) => prev * 1.15);

      const nextQuestion = QUIZ_QUESTIONS.find(
        (q) => q.obstacleDistance > currentQuestion.obstacleDistance
      );
      if (nextQuestion) {
        setNextObstacleDistance(nextQuestion.obstacleDistance);
      } else {
        setNextObstacleDistance(Infinity);
        setMessage("Tüm sorular bitti! Koşmaya devam et.");
      }
    } else {
      // YANLIŞ CEVAP
      setMessage("❌ Yanlış! Yavaşladın, kovalayan yaklaşıyor!");
      setGameSpeed((prev) => prev * 0.6);
    }

    setCurrentQuestion(null);
    setIsQuestionActive(false);
    saveGame();
  };

  // ----------------------------------------------------------------
  // 3. OYUN DÖNGÜSÜ (Game Loop)
  // ----------------------------------------------------------------

  const updateGame = (deltaTime) => {
    if (gameOver || isPaused || isQuestionActive) return;

    const newRunnerPosition = runnerPosition + gameSpeed * deltaTime;
    const newChaserPosition = chaserPosition + chaserSpeed * deltaTime;

    setRunnerPosition(newRunnerPosition);
    setChaserPosition(newChaserPosition);

    // Hız Artışı
    setGameSpeed((prev) => prev * (1 + 0.005 * deltaTime));
    setChaserSpeed((prev) => prev * (1 + 0.007 * deltaTime));

    // Normal skor artışı (mesafeye göre)
    setScore((prev) => prev + 1);

    // COIN KONTROLÜ (YENİ)
    // Runner bir coin'in üzerinden geçiyor mu? (+- 2 metre tolerans)
    setCoins((prevCoins) => {
      return prevCoins.map((coin) => {
        if (
          !coin.collected &&
          Math.abs(coin.position - newRunnerPosition) < 2
        ) {
          // Coin toplandı!
          setScore((s) => s + COIN_VALUE);
          return { ...coin, collected: true };
        }
        return coin;
      });
    });

    // Yeni Coin Üretimi (Coinler bitse bile üretmeye devam et)
    // Eğer hiç coin yoksa, referans noktamız koşucunun kendisidir.
    const lastCoin =
      coins.length > 0
        ? coins[coins.length - 1]
        : { position: newRunnerPosition };

    // Eğer referans noktasından (son coinden veya koşucudan) ileriye 300m'den az kaldıysa üret
    if (lastCoin.position - newRunnerPosition < 300) {
      const startSpawn = Math.max(lastCoin.position, newRunnerPosition) + 30;
      const endSpawn = startSpawn + 300;
      const moreCoins = spawnCoins(startSpawn, endSpawn);
      setCoins((prev) => [...prev, ...moreCoins]);
    }

    // Geçmiş coinleri temizle (Performans için)
    if (coins.length > 50) {
      setCoins((prev) =>
        prev.filter((c) => c.position > newRunnerPosition - 50)
      );
    }

    // OYUN BİTTİ KONTROLÜ
    if (newRunnerPosition - newChaserPosition <= 2) {
      setGameOver(true);
      setMessage(`OYUN BİTTİ! Kovalayan seni yakaladı! Skor: ${score}`);
      localStorage.removeItem(`${GAME_STATE_KEY}_${currentUser}`);
      return;
    }

    // ENGEL KONTROLÜ
    if (
      newRunnerPosition >= nextObstacleDistance &&
      nextObstacleDistance !== Infinity
    ) {
      setIsQuestionActive(true);
      const questionData = QUIZ_QUESTIONS.find(
        (q) => q.obstacleDistance === nextObstacleDistance
      );

      if (questionData) {
        setCurrentQuestion(questionData);
        setMessage("ENGEL! Soruyu cevapla!");
      } else {
        setNextObstacleDistance(Infinity);
        setIsQuestionActive(false);
      }
    }

    // Periyodik Kayıt
    if (Math.floor(newRunnerPosition) % 50 === 0) {
      saveGame();
    }
  };

  useGameLoop(updateGame);

  // Görsel Hesaplamalar
  const distanceDiff = runnerPosition - chaserPosition;
  const chaserVisualPos = Math.max(0, 50 - distanceDiff);
  const obstacleDistRemaining = nextObstacleDistance - runnerPosition;
  const showObstacle = obstacleDistRemaining < 200 && obstacleDistRemaining > 0;
  const obstacleVisualPos = 50 + obstacleDistRemaining / 4;

  return (
    <div
      style={{
        padding: "40px",
        minHeight: "80vh",
        textAlign: "center",
        backgroundColor: "#e9ecef",
        fontFamily: "sans-serif",
      }}
    >
      <h2 style={{ color: gameOver ? "red" : "#007bff", minHeight: "40px" }}>
        {message}
      </h2>

      {gameOver && (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#fff",
            border: "2px solid red",
            borderRadius: "10px",
            marginBottom: "20px",
            display: "inline-block",
          }}
        >
          <h3>💀 YAKALANDIN!</h3>
          <p>
            Toplam Skor: <strong>{score}</strong>
          </p>
          <button
            onClick={resetGame}
            style={{
              padding: "10px 20px",
              backgroundColor: "red",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Tekrar Dene
          </button>
        </div>
      )}

      <div
        style={{
          border: "4px solid #333",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "15px",
          maxWidth: "800px",
          margin: "0 auto",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
            backgroundColor: "#f8f9fa",
            padding: "10px",
            borderRadius: "8px",
            fontWeight: "bold",
            fontSize: "0.9rem",
          }}
        >
          <span>Mesafe: {runnerPosition.toFixed(0)}m</span>
          <span>Skor: {score}</span>
          <span>Hız: {gameSpeed.toFixed(1)} m/s</span>
          <span style={{ color: "red" }}>
            Kovalayan Fark: {distanceDiff.toFixed(1)}m
          </span>
        </div>

        {/* GRAFİK ALANI */}
        <div
          style={{
            position: "relative",
            height: "150px",
            backgroundColor: "#e9ecef",
            borderRadius: "8px",
            overflow: "hidden",
            borderBottom: "4px solid #6c757d",
          }}
        >
          {/* Zemin Çizgileri */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              height: "20px",
              background:
                "repeating-linear-gradient(90deg, #333 0px, #333 20px, transparent 20px, transparent 40px)",
              backgroundPositionX: `${-runnerPosition * 5}px`,
            }}
          ></div>

          {/* COINS (ALTINLAR) - YENİ GÖRSELLEŞTİRME */}
          {coins.map((coin) => {
            // Ekrandaki konumu hesapla
            const distToRunner = coin.position - runnerPosition;
            // Sadece ekranda görünebilecek mesafedeyse göster (Runner %50'de, ekran genişliği yaklaşık 200m gibi düşünürsek)
            if (distToRunner > -100 && distToRunner < 200 && !coin.collected) {
              const coinVisualPos = 50 + distToRunner / 4; // Basit oranlama
              return (
                <div
                  key={coin.id}
                  style={{
                    position: "absolute",
                    left: `${coinVisualPos}%`,
                    bottom: "30px", // Zeminden biraz yukarıda
                    fontSize: "24px",
                    zIndex: 1,
                    transition: "left 0.1s linear",
                  }}
                >
                  🪙
                </div>
              );
            }
            return null;
          })}

          {/* KOVALAYAN */}
          {!gameOver && (
            <div
              style={{
                position: "absolute",
                left: `${chaserVisualPos}%`,
                bottom: "20px",
                fontSize: "40px",
                transition: "left 0.1s linear",
                zIndex: 1,
              }}
            >
              👹
            </div>
          )}

          {/* RUNNER */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: "20px",
              fontSize: "40px",
              zIndex: 2,
              transform: "translateX(-50%)",
            }}
          >
            🏃
          </div>

          {/* ENGEL */}
          {showObstacle && !isQuestionActive && (
            <div
              style={{
                position: "absolute",
                left: `${obstacleVisualPos}%`,
                bottom: "20px",
                fontSize: "40px",
                zIndex: 1,
              }}
            >
              🚧
            </div>
          )}
        </div>

        {/* SORU PANELİ */}
        {isQuestionActive && currentQuestion && !gameOver && (
          <div
            style={{
              marginTop: "20px",
              padding: "20px",
              backgroundColor: "#fff3cd",
              border: "2px solid #ffecb5",
              borderRadius: "10px",
            }}
          >
            <h3 style={{ color: "#856404", marginTop: 0 }}>
              🛑 ENGEL! Soruyu Bil ve Hızlan!
            </h3>
            <p style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
              {currentQuestion.question}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              {currentQuestion.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  style={{
                    padding: "12px",
                    border: "none",
                    borderRadius: "5px",
                    backgroundColor: "#007bff",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "1rem",
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Kontrol Butonları */}
        {!isQuestionActive && !gameOver && (
          <div style={{ marginTop: "20px" }}>
            <button
              onClick={() => setIsPaused(!isPaused)}
              style={{
                padding: "10px 30px",
                fontSize: "1rem",
                cursor: "pointer",
                backgroundColor: isPaused ? "#28a745" : "#ffc107",
                border: "none",
                borderRadius: "5px",
                color: isPaused ? "white" : "black",
              }}
            >
              {isPaused ? "▶ DEVAM ET" : "⏸ DURAKLAT"}
            </button>

            {isPaused && (
              <button
                onClick={resetGame}
                style={{
                  marginLeft: "10px",
                  padding: "10px 20px",
                  fontSize: "1rem",
                  cursor: "pointer",
                  backgroundColor: "red",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                }}
              >
                ÇIKIŞ / SIFIRLA
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;
