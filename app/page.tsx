"use client";

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

// --- KONFIGURACJA ---

// 1. Data rozpoczęcia związku (Rok, Miesiąc-1, Dzień)
const START_DATE = new Date(2022, 11, 12); 

// 2. Hasło do wejścia
const PASSCODE = "121222"; 

// 3. ID piosenki z YouTube (To co jest po "v=" w linku)
// Np. dla https://www.youtube.com/watch?v=izGwDsrQ1eQ wpisz "izGwDsrQ1eQ"
const YOUTUBE_VIDEO_ID = "Hh5qWRuNdv8"; 

export default function Page() {
  const [step, setStep] = useState<"login" | "ask" | "success">("login");
  const [passcodeInput, setPasscodeInput] = useState("");
  const [noCount, setNoCount] = useState(0);

  const handleLogin = () => {
    if (passcodeInput === PASSCODE) {
      setStep("ask");
    } else {
      alert("Złe hasło! Podpowiedź: data naszego związku");
    }
  };

  const handleYes = () => {
    setStep("success");
    confetti({
      particleCount: 200,
      spread: 70,
      origin: { y: 0.6 },
    });
    // Dodatkowe wybuchy konfetti co chwilę
    const duration = 3000;
    const end = Date.now() + duration;
    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-pink-200 via-purple-200 to-pink-300 text-zinc-800 font-sans selection:bg-rose-500 selection:text-white">
      {/* Tło z serduszkami */}
      <FloatingHearts />
      
      {/* ODTWARZACZ YOUTUBE (Niewidoczny) */}
      {/* Uruchamia się dopiero po wpisaniu hasła (gdy step != 'login') */}
      {step !== "login" && (
        <div className="absolute pointer-events-none opacity-0 h-0 w-0 overflow-hidden">
          <iframe 
            width="100%" 
            height="100%" 
            src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&loop=1&playlist=${YOUTUBE_VIDEO_ID}&controls=0&showinfo=0`} 
            title="YouTube music" 
            allow="autoplay; encrypted-media"
          />
        </div>
      )}

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
        <AnimatePresence mode="wait">
          
          {/* KROK 1: LOGIN */}
          {step === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md bg-white/30 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/50 text-center"
            >
              <h1 className="text-2xl font-bold mb-6 text-rose-600">🔒 Dostęp tylko dla mojej ukochanej</h1>
              <p className="mb-4 text-sm text-gray-700">Wpisz kod dostępu (data związku):</p>
              <input
                type="password"
                className="w-full p-3 rounded-lg border-2 border-pink-300 focus:border-rose-500 outline-none text-center text-xl tracking-widest bg-white/80"
                placeholder="******"
                maxLength={6}
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
              />
              <button
                onClick={handleLogin}
                className="mt-6 w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-lg transition-all shadow-lg transform active:scale-95"
              >
                Odblokuj ❤️
              </button>
            </motion.div>
          )}

          {/* KROK 2: PYTANIE */}
          {step === "ask" && (
            <AskScreen noCount={noCount} setNoCount={setNoCount} onYes={handleYes} />
          )}

          {/* KROK 3: SUKCES */}
          {step === "success" && (
            <SuccessScreen startDate={START_DATE} />
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

// --- KOMPONENTY POMOCNICZE ---

function AskScreen({ noCount, setNoCount, onYes }: { noCount: number, setNoCount: (n: number) => void, onYes: () => void }) {
  const yesSize = noCount * 15 + 16;
  
  const phrases = [
    "Nie", "Jesteś pewna?", "Kochanie...", "Proszę 🥺", 
    "Zrobię ci masaż!", "Kupię ci kwiatki!", "Zabijesz mnie 💔", 
    "No weeeeź...", "Będę płakać!", "Dobra, koniec żartów, klikaj TAK!"
  ];
  const phrase = phrases[Math.min(noCount, phrases.length - 1)];

  return (
    <motion.div
      key="ask"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 1.2, opacity: 0 }}
      className="flex flex-col items-center text-center"
    >
      <img
        src={noCount > 6 ? "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMmo3c3l5ODh3ZGN6NHhhaDE2Mjg1cm4yd2ltYzJzbXc0Mmo3c3l5OCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/KztT2c4u8mYYUiMKdJ/giphy.gif" : "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMmo3c3l5ODh3ZGN6NHhhaDE2Mjg1cm4yd2ltYzJzbXc0Mmo3c3l5OCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/KztT2c4u8mYYUiMKdJ/giphy.gif"}
        alt="Cute bears"
        className="h-64 mb-6 drop-shadow-2xl"
      />
      <h1 className="text-4xl md:text-6xl font-extrabold text-rose-600 drop-shadow-sm mb-8">
        Zostaniesz moją Walentynką? 🌹
      </h1>
      
      <div className="flex flex-wrap justify-center items-center gap-6">
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
          style={{ fontSize: yesSize, padding: `${yesSize/2}px ${yesSize}px` }}
          onClick={onYes}
        >
          TAK! ❤️
        </button>
        <button
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all active:scale-95"
          onClick={() => setNoCount(noCount + 1)}
        >
          {phrase}
        </button>
      </div>
    </motion.div>
  );
}

function SuccessScreen({ startDate }: { startDate: Date }) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
    useEffect(() => {
      const timer = setInterval(() => {
        const now = new Date();
        const difference = now.getTime() - startDate.getTime();
        
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        
        setTimeLeft({ days, hours, minutes, seconds });
      }, 1000);
      return () => clearInterval(timer);
    }, [startDate]);

  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center max-w-4xl w-full"
    >
      <img
        src="https://media.tenor.com/gUiu1zyxfzYAAAAi/bear-kiss-bear-kisses.gif"
        alt="Kissing bears"
        className="h-48 mb-6"
      />
      <h1 className="text-5xl font-bold text-rose-600 mb-4">Jejjj! Kocham Cię! 💖</h1>
      
      <div className="bg-white/40 backdrop-blur-sm p-6 rounded-2xl shadow-xl w-full max-w-xl mb-8 border border-white/60">
        <p className="text-lg font-semibold text-gray-700 mb-2">Jesteśmy razem już:</p>
        <div className="grid grid-cols-4 gap-2 text-rose-600">
            <TimeBox val={timeLeft.days} label="Dni" />
            <TimeBox val={timeLeft.hours} label="Godz" />
            <TimeBox val={timeLeft.minutes} label="Min" />
            <TimeBox val={timeLeft.seconds} label="Sek" />
        </div>
      </div>

      {/* GALERIA - 4 ZDJĘCIA */}
      {/* Podmień '/file.svg' na linki do zdjęć (np. z folderu public lub link internetowy) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full px-4">
        <Photo src="/zdjecie1.jpg" rotate="-3deg" />
        <Photo src="/zdjecie2.jpg" rotate="2deg" />
        <Photo src="/zdjecie3.jpg" rotate="-2deg" />
        <Photo src="/zdjecie4.jpg" rotate="3deg" />
      </div>

      <p className="mt-12 text-xl font-handwriting text-rose-800 font-semibold opacity-80">
        Nie mogę się doczekać 14 Lutego! 🥰
      </p>
    </motion.div>
  );
}

const TimeBox = ({ val, label }: { val: number, label: string }) => (
  <div className="flex flex-col items-center">
    <span className="text-3xl font-black bg-white/70 rounded-lg p-2 min-w-15 md:min-w-20">{val}</span>
    <span className="text-xs font-bold mt-1 uppercase text-rose-400">{label}</span>
  </div>
);

const Photo = ({ src, rotate }: { src: string, rotate: string }) => (
    <motion.div 
        whileHover={{ scale: 1.1, rotate: 0, zIndex: 10 }}
        className="overflow-hidden rounded-xl shadow-lg border-4 border-white aspect-square relative bg-white"
        style={{ rotate }}
    >
        <img src={src} className="w-full h-full object-cover" alt="Nasze wspomnienie" />
    </motion.div>
);

// Tło z serduszkami
const FloatingHearts = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-rose-300/30 text-4xl"
          initial={{
            y: "110vh",
            x: Math.random() * 100 + "vw",
            opacity: 0,
          }}
          animate={{
            y: "-10vh",
            opacity: [0, 1, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 10,
          }}
        >
          ❤️
        </motion.div>
      ))}
    </div>
  );
};