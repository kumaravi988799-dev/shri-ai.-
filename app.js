const API_BASE = window.NOVA_API_BASE || "";
const messagesEl = document.getElementById("messages");
const form = document.getElementById("chatForm");
const promptEl = document.getElementById("prompt");
const typingEl = document.getElementById("typing");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");
const statusText = document.getElementById("statusText");
const statusPill = document.querySelector(".status");
const avatarState = document.getElementById("avatarState");
const voiceVisual = document.getElementById("voiceVisual");
let history = [{ role: "assistant", content: "नमस्ते! मैं आपकी AI साथी हूँ। हिंदी या English—जिसमें चाहें बात कीजिए।" }];
let recognition = null;
let busy = false;
let autoSpeak = true;

function setStatus(text, online=true) {
  statusText.textContent = text;
  statusPill.classList.toggle("offline", !online);
}
async function checkServer() {
  try {
    const r = await fetch(`${API_BASE}/api/health`);
    const d = await r.json();
    if (!r.ok || !d.ok) throw new Error("offline");
    const configured = [d.providers?.gemini && "Gemini", d.providers?.openai && "ChatGPT"].filter(Boolean);
    setStatus(configured.length ? `Online · ${configured.join(" + ")}` : "Server online · add API keys", true);
  } catch { setStatus("Server offline", false); }
}
function addMessage(role, content) {
  const article = document.createElement("article");
  article.className = `message ${role}`;
  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = role === "assistant" ? "✦" : "YOU";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  const sender = document.createElement("span");
  sender.className = "sender";
  sender.textContent = role === "assistant" ? "NOVA" : "YOU";
  const p = document.createElement("p");
  p.textContent = content;
  bubble.append(sender, p);
  if (role === "assistant") {
    const listen = document.createElement("button");
    listen.className = "listen-btn";
    listen.textContent = "▶ Listen";
    listen.addEventListener("click", () => speak(content));
    bubble.append(listen);
  }
  article.append(avatar, bubble);
  messagesEl.append(article);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}
function speak(text) {
  if (!("speechSynthesis" in window)) { setStatus("Speech output unavailable"); return; }
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const langSetting = document.getElementById("voiceLang").value;
  utterance.lang = langSetting === "auto" ? (/[\u0900-\u097F]/.test(text) ? "hi-IN" : "en-US") : langSetting;
  utterance.rate = .96;
  utterance.onstart = () => { avatarState.textContent = "Speaking…"; voiceVisual.classList.add("active"); document.getElementById("avatarWrap").classList.add("talking"); };
  const done = () => { avatarState.textContent = "Ready to talk"; voiceVisual.classList.remove("active"); document.getElementById("avatarWrap").classList.remove("talking"); };
  utterance.onend = done; utterance.onerror = done;
  speechSynthesis.speak(utterance);
}
async function sendMessage(text) {
  text = text.trim();
  if (!text || busy) return;
  busy = true; sendBtn.disabled = true;
  history.push({ role: "user", content: text });
  addMessage("user", text);
  promptEl.value = ""; promptEl.style.height = "auto";
  typingEl.classList.remove("hidden");
  try {
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history.slice(-16), provider: document.getElementById("provider").value })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "AI server error");
    const reply = String(data.answer || "मुझे अभी जवाब नहीं मिला।");
    history.push({ role: "assistant", content: reply });
    addMessage("assistant", reply);
    setStatus(`Online · ${data.provider}`, true);
    if (autoSpeak) speak(reply);
  } catch (err) {
    const msg = `Connection issue: ${err.message}. Server और API keys जाँचें।`;
    addMessage("assistant", msg);
    setStatus("Connection issue", false);
  } finally {
    typingEl.classList.add("hidden"); busy = false; sendBtn.disabled = false; promptEl.focus();
  }
}
form.addEventListener("submit", e => { e.preventDefault(); sendMessage(promptEl.value); });
promptEl.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
});
promptEl.addEventListener("input", () => { promptEl.style.height = "auto"; promptEl.style.height = Math.min(promptEl.scrollHeight, 110) + "px"; });
micBtn.addEventListener("click", () => {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) { setStatus("Voice input needs Chrome or a supported browser"); return; }
  if (recognition) { recognition.stop(); recognition = null; micBtn.classList.remove("listening"); return; }
  recognition = new Recognition();
  recognition.lang = "hi-IN"; recognition.interimResults = true; recognition.continuous = false;
  recognition.onstart = () => { micBtn.classList.add("listening"); avatarState.textContent = "Listening…"; };
  recognition.onresult = e => {
    let result = "";
    for (let i = e.resultIndex; i < e.results.length; i++) result += e.results[i][0].transcript;
    promptEl.value = result; promptEl.dispatchEvent(new Event("input"));
  };
  recognition.onerror = () => setStatus("Microphone permission denied or unavailable");
  recognition.onend = () => { micBtn.classList.remove("listening"); avatarState.textContent = "Ready to talk"; recognition = null; };
  try { recognition.start(); } catch { setStatus("Could not start microphone"); }
});
document.querySelectorAll(".quick-actions button").forEach(btn => btn.addEventListener("click", () => { promptEl.value = btn.dataset.prompt; promptEl.focus(); promptEl.dispatchEvent(new Event("input")); }));
document.getElementById("clearBtn").addEventListener("click", () => {
  speechSynthesis?.cancel();
  history = [];
  messagesEl.innerHTML = "";
  addMessage("assistant", "नई शुरुआत! बताइए, मैं कैसे मदद करूँ? ✨");
  history.push({ role: "assistant", content: "नई शुरुआत! बताइए, मैं कैसे मदद करूँ? ✨" });
});
const dialog = document.getElementById("settingsDialog");
document.getElementById("settingsBtn").addEventListener("click", () => dialog.showModal());
document.getElementById("autoSpeak").addEventListener("change", e => autoSpeak = e.target.checked);
dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
checkServer();
