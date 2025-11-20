import { useEffect, useRef } from "react";

// Bu hook, tarayıcıda akıcı bir animasyon döngüsü (requestAnimationFrame) oluşturur.
export const useGameLoop = (callback) => {
  // requestAnimationFrame ID'sini tutmak için useRef kullanıyoruz.
  const requestRef = useRef();
  // Döngüdeki son zaman damgasını tutmak için useRef kullanıyoruz.
  const previousTimeRef = useRef();

  const gameLoop = (time) => {
    if (previousTimeRef.current !== undefined) {
      // Delta zamanı (saniye) hesapla. Bu, farklı cihazlarda hızın sabit kalmasını sağlar.
      const deltaTime = (time - previousTimeRef.current) / 1000;

      // Oyun mantığını çalıştırmak için callback fonksiyonunu delta zaman ile çağır.
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    // Bir sonraki frame için tekrar çağır.
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    // Döngüyü başlat
    requestRef.current = requestAnimationFrame(gameLoop);

    // Temizleme: Komponent unmount olduğunda döngüyü durdur.
    return () => cancelAnimationFrame(requestRef.current);
  }, [callback]); // callback değişirse döngüyü yeniden kur
};
