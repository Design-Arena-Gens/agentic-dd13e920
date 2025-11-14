export default function ChatMessage({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`message ${isUser ? "user" : "assistant"}`}>
      <div className="bubble">
        {!isUser && <div className="name">De Jongh?s Assistant</div>}
        {isUser && <div className="name">You</div>}
        <div>{message.content}</div>
        {message.attachments?.length ? (
          <div className="attachments">
            {message.attachments.map((a, i) => (
              a.type?.startsWith("image/") ? (
                <img src={a.dataUrl} key={i} alt={a.name || `image-${i}`} />
              ) : null
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
