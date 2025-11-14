"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { processUserMessage, getInitialWelcome, buildQuickAction, detectLanguage } from "../lib/agent";
import { t, LANG, setLang } from "../lib/i18n";
import ChatMessage from "../components/ChatMessage";

export default function HomePage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [currentLang, setCurrentLang] = useState(LANG.EN);
  const [uploadPreviews, setUploadPreviews] = useState([]);
  const fileInputRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dj_chat_v1");
      const savedLang = localStorage.getItem("dj_lang_v1");
      if (saved) setMessages(JSON.parse(saved));
      if (savedLang) {
        setCurrentLang(savedLang);
        setLang(savedLang);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      const welcome = getInitialWelcome(currentLang);
      setMessages([welcome]);
    }
  }, [currentLang]);

  useEffect(() => {
    try {
      localStorage.setItem("dj_chat_v1", JSON.stringify(messages));
    } catch {}
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSend = async (textOverride) => {
    const text = (textOverride ?? input).trim();
    if (!text && uploadPreviews.length === 0) return;

    const userMsg = { role: "user", content: text, attachments: uploadPreviews };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setUploadPreviews([]);

    // Auto-detect Afrikaans if likely
    const detected = detectLanguage(text);
    if (detected && detected !== currentLang) {
      setCurrentLang(detected);
      setLang(detected);
    }

    const reply = await processUserMessage(text, { lang: currentLang, history: messages, attachments: uploadPreviews });
    setMessages((prev) => [...prev, reply]);
  };

  const onQuick = (intent) => {
    const actionText = buildQuickAction(intent, currentLang);
    onSend(actionText);
  };

  const onAttach = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const readers = files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ name: file.name, type: file.type, dataUrl: reader.result });
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((list) => setUploadPreviews((prev) => [...prev, ...list]));
    e.target.value = "";
  };

  const removePreview = (idx) => setUploadPreviews((prev) => prev.filter((_, i) => i !== idx));

  const switchLang = () => {
    const next = currentLang === LANG.EN ? LANG.AF : LANG.EN;
    setCurrentLang(next);
    setLang(next);
    try { localStorage.setItem("dj_lang_v1", next); } catch {}
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand">
          <div className="logo" aria-hidden>??</div>
          <div>
            <h1>De Jongh?s Panelbeating Centre</h1>
            <p>{t("tagline")}</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="lang-toggle" onClick={switchLang}>
            {currentLang === LANG.EN ? "Afrikaans" : "English"}
          </button>
        </div>
      </header>

      <main className="content">
        <section className="quick-actions">
          <button onClick={() => onQuick("services")} className="qa">{t("qa_services")}</button>
          <button onClick={() => onQuick("estimate")} className="qa">{t("qa_estimate")}</button>
          <button onClick={() => onQuick("booking")} className="qa">{t("qa_booking")}</button>
          <button onClick={() => onQuick("status")} className="qa">{t("qa_status")}</button>
          <button onClick={() => onQuick("tips")} className="qa">{t("qa_tips")}</button>
        </section>

        <section className="chat">
          {messages.map((m, idx) => (
            <ChatMessage key={idx} message={m} />
          ))}
          <div ref={endRef} />
        </section>

        {uploadPreviews.length > 0 && (
          <section className="attachments">
            {uploadPreviews.map((f, idx) => (
              <div className="attachment" key={idx}>
                {f.type.startsWith("image/") ? (
                  <img src={f.dataUrl} alt={f.name} />
                ) : (
                  <div className="file">
                    <span>??</span>
                    <span>{f.name}</span>
                  </div>
                )}
                <button onClick={() => removePreview(idx)} className="remove">?</button>
              </div>
            ))}
          </section>
        )}
      </main>

      <footer className="composer">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder={t("input_placeholder")}
          aria-label={t("input_placeholder")}
        />
        <div className="composer-actions">
          <button onClick={() => fileInputRef.current?.click()} className="attach">??</button>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onAttach} />
          <button onClick={() => onSend()} className="send">{t("send")}</button>
        </div>
      </footer>
    </div>
  );
}
