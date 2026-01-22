import { useState, useEffect, useRef } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userText = input;
    setInput("");

    setMessages(prev => [
      ...prev,
      { from: "user", text: userText, time },
    ]);

    setTyping(true);

    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText }),
    });

    const data = await res.json();

    setTyping(false);

    setMessages(prev => [
      ...prev,
      {
        from: "bot",
        text: data.reply,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>PurePeace WhatsApp Bot</div>

      <div style={styles.chatBody}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              alignSelf: m.from === "user" ? "flex-end" : "flex-start",
              background: m.from === "user" ? "#dcf8c6" : "#fff",
            }}
          >
            <div>{m.text}</div>
            <div style={styles.time}>{m.time}</div>
          </div>
        ))}

        {typing && (
          <div style={{ ...styles.message, background: "#fff" }}>
            Bot is typing…
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div style={styles.footer}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Type a message"
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.sendBtn}>
          ?
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: 420,
    height: 620,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    background: "#ece5dd",
    borderRadius: 10,
    overflow: "hidden",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  },
  header: {
    background: "#075e54",
    color: "#fff",
    padding: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  chatBody: {
    flex: 1,
    padding: 10,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
  message: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    maxWidth: "75%",
    fontSize: 14,
  },
  time: {
    fontSize: 10,
    textAlign: "right",
    marginTop: 4,
    opacity: 0.6,
  },
  footer: {
    display: "flex",
    padding: 8,
    background: "#f0f0f0",
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    border: "1px solid #ccc",
    outline: "none",
  },
  sendBtn: {
    marginLeft: 6,
    padding: "0 14px",
    borderRadius: "50%",
    border: "none",
    background: "#075e54",
    color: "#fff",
    fontSize: 18,
    cursor: "pointer",
  },
};
