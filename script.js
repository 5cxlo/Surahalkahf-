// ===========================
// 💚 Surat Al-Kahf – Controls
// ===========================
const toggleModeBtn = document.getElementById("toggleMode");
const playAudioBtn  = document.getElementById("playAudio");
const shareBtn      = document.getElementById("shareBtn");

// ضع رابط ملف MP3 المباشر لصوت "عمر ضياء الدين" هنا:
const AUDIO_URL = "https://server10.mp3quran.net/ajm/128/018.mp3"; // ← غيّره إلى رابط مباشر

const audio = new Audio(AUDIO_URL);
audio.preload = "none";
let isPlaying = false;

// 🎧 تشغيل/إيقاف
playAudioBtn.addEventListener("click", () => {
  if (!AUDIO_URL || AUDIO_URL.startsWith("https://server10.mp3quran.net/ajm/128/018.mp3")) {
    alert("ضع رابط الصوت المباشر أولاً داخل script.js في المتغيّر AUDIO_URL.");
    return;
  }
  if (isPlaying) {
    audio.pause();
    playAudioBtn.textContent = "▶️ استماع";
  } else {
    audio.play().catch(()=>{});
    playAudioBtn.textContent = "⏸️ إيقاف";
  }
  isPlaying = !isPlaying;
});
audio.addEventListener("ended", () => {
  isPlaying = false;
  playAudioBtn.textContent = "▶️ استماع";
});

// 🌗 تبديل الوضع
toggleModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  toggleModeBtn.textContent = document.body.classList.contains("dark") ? "☀️ وضع فاتح" : "🌙 وضع داكن";
  // تلوين شريط المتصفح على الجوال
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", document.body.classList.contains("dark") ? "#0f1213" : "#3b7f5a");
});

// 📤 مشاركة
shareBtn.addEventListener("click", async () => {
  try {
    await navigator.share({
      title: "سورة الكهف",
      text: "اقرأ سورة الكهف كاملة واستمع للتلاوة.",
      url: location.href
    });
  } catch(e){
    navigator.clipboard?.writeText(location.href);
    alert("تم نسخ الرابط. يمكنك لصقه ومشاركته.");
  }
});

// 💾 Service Worker عبر Blob (للنص فقط – بدون الصوت)
if ("serviceWorker" in navigator) {
  const swCode = `
    const CACHE_NAME = "alkahf-text-v1";
    const ASSETS = [
      "./",
      "./index.html",
      "./style.css",
      "./script.js"
    ];
    self.addEventListener("install", (e) => {
      e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(()=>self.skipWaiting()));
    });
    self.addEventListener("activate", (e) => {
      e.waitUntil(
        caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null))).then(()=>self.clients.claim())
      );
    });
    self.addEventListener("fetch", (e) => {
      const url = new URL(e.request.url);
      // لا نخزن الصوت نهائيًا
      if (url.pathname.endsWith(".mp3")) { return; }
      // استراتيجية: Cache First ثم شبكة
      e.respondWith(
        caches.match(e.request).then(res => res || fetch(e.request).then(resp => {
          // نخزّن فقط GET وملفات نفس الأصل (بدون mp3)
          if (e.request.method === "GET" && url.origin === location.origin) {
            const clone = resp.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          }
          return resp;
        }).catch(()=> caches.match("./index.html")))
      );
    });
  `;
  const blob = new Blob([swCode], { type: "text/javascript" });
  const swUrl = URL.createObjectURL(blob);
  navigator.serviceWorker.register(swUrl).catch(()=>{});
}
