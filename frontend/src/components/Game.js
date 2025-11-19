import React from "react";

const Game = ({ currentUser }) => {
  // Bu, oyunun ana ekranı olacak.
  // Şimdilik sadece bir yer tutucu olarak dursun.

  return (
    <div
      style={{ padding: "40px", backgroundColor: "#f0f0f0", minHeight: "80vh" }}
    >
      <h2>Oyun Alanı: Koşucu Başlasın! 🏃</h2>
      <p>Hoş geldin, {currentUser}! Oyun kaldığın yerden devam edecek.</p>
      <p>
        Şimdiki adımda buraya sonsuz koşu mekaniği ve soru panellerini
        ekleyeceğiz.
      </p>
    </div>
  );
};

export default Game;
