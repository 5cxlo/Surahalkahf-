// ===========================
// 💚 Surat Al-Kahf – Controls
// ===========================
const toggleModeBtn = document.getElementById("toggleMode");
const playAudioBtn  = document.getElementById("playAudio");
const shareBtn      = document.getElementById("shareBtn");

// 🔊 رابط صوت الشيخ أحمد العجمي
const AUDIO_URL = "https://server10.mp3quran.net/ajm/128/018.mp3";

const audio = new Audio(AUDIO_URL);
audio.preload = "none";
let isPlaying = false;

// 🎧 تشغيل / إيقاف الصوت
playAudioBtn.addEventListener("click", () => {
  if (isPlaying) {
    audio.pause();
    playAudioBtn.textContent = "▶️ استماع";
    playAudioBtn.style.backgroundColor = ""; // يرجع اللون الافتراضي
  } else {
    audio.play().catch(()=>{});
    playAudioBtn.textContent = "⏸️ إيقاف";
    playAudioBtn.style.backgroundColor = "#3b7f5a"; // لون أخضر وقت التشغيل
    playAudioBtn.style.color = "#fff";
  }
  isPlaying = !isPlaying;
});

// عند انتهاء السورة
audio.addEventListener("ended", () => {
  isPlaying = false;
  playAudioBtn.textContent = "▶️ استماع";
  playAudioBtn.style.backgroundColor = "";
  playAudioBtn.style.color = "";
});

// 🌗 تبديل الوضع (فاتح / داكن)
toggleModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  toggleModeBtn.textContent = document.body.classList.contains("dark") ? "☀️ وضع فاتح" : "🌙 وضع داكن";
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

// 💾 Service Worker (بدون الصوت)
if ("serviceWorker" in navigator) {
  const swCode = `
    const CACHE_NAME = "alkahf-text-v1";
    const ASSETS = ["./","./index.html","./style.css","./script.js"];
    self.addEventListener("install", e => {
      e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(()=>self.skipWaiting()));
    });
    self.addEventListener("activate", e => {
      e.waitUntil(
        caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null))).then(()=>self.clients.claim())
      );
    });
    self.addEventListener("fetch", e => {
      const url = new URL(e.request.url);
      if (url.pathname.endsWith(".mp3")) return;
      e.respondWith(
        caches.match(e.request).then(res => res || fetch(e.request).then(resp => {
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
