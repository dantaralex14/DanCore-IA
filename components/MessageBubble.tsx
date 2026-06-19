"use client";

interface MessageBubbleProps {
  role: "user" | "model";
  content: string;
  timestamp: string;
  darkMode: boolean;
}

export default function MessageBubble({ role, content, timestamp, darkMode }: MessageBubbleProps) {
  const styles = {
    container: {
      display: "flex",
      gap: "12px",
      animation: "fadeIn 0.3s ease-in-out",
      justifyContent: role === "user" ? "flex-end" : "flex-start",
    },
    avatar: {
      display: "flex",
      height: "32px",
      width: "32px",
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "9999px",
      fontSize: "0.75rem",
      fontWeight: 700,
      color: "white",
      background: role === "user" 
        ? "linear-gradient(to bottom right, #10b981, #14b8a6)"
        : "linear-gradient(to bottom right, #7c3aed, #4f46e5)",
    },
    contentWrapper: {
      maxWidth: "80%",
      display: "flex",
      flexDirection: "column" as const,
      gap: "4px",
      alignItems: role === "user" ? "flex-end" : "flex-start",
    },
    bubble: {
      padding: "10px 16px",
      borderRadius: role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
      background: role === "user"
        ? darkMode ? "rgba(99,102,241,0.2)" : "#dbeafe"
        : darkMode ? "rgba(39,39,42,0.8)" : "white",
      border: role === "user" ? "none" : `1px solid ${darkMode ? "rgba(63,63,70,0.5)" : "#e4e4e7"}`,
      color: role === "user"
        ? darkMode ? "#ffffff" : "#18181b"
        : darkMode ? "#d4d4d8" : "#18181b",
    },
    contentText: {
      fontSize: "0.875rem",
      whiteSpace: "pre-wrap" as const,
      wordBreak: "break-word" as const,
      lineHeight: 1.6,
      margin: 0,
    },
    timestamp: {
      fontSize: "0.625rem",
      color: darkMode ? "#71717a" : "#a1a1aa",
      padding: "0 4px",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.avatar}>
        {role === "user" ? "U" : "AI"}
      </div>
      <div style={styles.contentWrapper}>
        <div style={styles.bubble}>
          <p style={styles.contentText}>{content}</p>
        </div>
        <div style={styles.timestamp}>{timestamp}</div>
      </div>
    </div>
  );
}