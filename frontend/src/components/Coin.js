import React, { useEffect, useMemo } from "react";

const COIN_VALUE = 50;
const COLLECTION_DISTANCE = 1.5; // Toplama mesafesi

const Coin = ({
  coin,
  runnerPosition,
  onCollect,
  setScore,
  setCollectedCoinsCount,
}) => {
  // Toplama mantığını bu bileşene taşıyoruz.
  // Sadece bu coin'in pozisyonu veya koşucunun pozisyonu değiştiğinde çalışır.
  useEffect(() => {
    if (
      !coin.collected &&
      Math.abs(coin.position - runnerPosition) < COLLECTION_DISTANCE
    ) {
      // Coin'i topla
      onCollect(coin.id);
      setScore((s) => s + COIN_VALUE);
      setCollectedCoinsCount((c) => c + 1);
    }
  }, [
    runnerPosition,
    coin.position,
    coin.collected,
    coin.id,
    onCollect,
    setScore,
    setCollectedCoinsCount,
  ]);

  // Görsel pozisyonu hesapla
  // Coin'in sabit pozisyonunu yüzde olarak hesapla
  const coinBasePosPercent = coin.position / 10; // Bu değeri oyununuzun ölçeğine göre ayarlayın

  return (
    <div
      style={{
        position: "absolute",
        // 'left' artık sabit, hareket 'transform' ile yapılacak.
        // Bu, coin'in parkurdaki temel konumudur.
        left: `${coin.position / 8}%`, // Bu değeri oyununuzun ölçeğine göre ayarlayın
        bottom: "25px",
        zIndex: 1,
        // transform'a transition ekleyerek akıcı hareket sağlıyoruz.
        transition: "transform 0.1s linear, opacity 0.2s",
        width: "30px",
        height: "30px",
        // Toplanan coin'i görünmez yap
        opacity: coin.collected ? 0 : 1,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#DAA520"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="8" fill="#FFD700"></circle>
        <path d="M12 8v8" stroke="#B8860B" strokeWidth="2.5"></path>
        <path
          d="M10 14s1-1 2-1 2 1 2 1"
          stroke="#B8860B"
          strokeWidth="1.5"
        ></path>
      </svg>
    </div>
  );
};

export default Coin; // React.memo'yu kaldırıyoruz çünkü artık runnerPosition'a göre sürekli güncellenmesi gerekiyor.
