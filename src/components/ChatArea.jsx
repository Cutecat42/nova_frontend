import React, { useState, useLayoutEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const CodeBlock = ({ match, codeString }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: "relative",
        borderRadius: "8px",
        overflow: "hidden",
        margin: "12px 0",
        border: "1px solid #333",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#1e1e1e",
          padding: "8px 15px",
          color: "#9cdcfe",
          fontSize: "12px",
          fontFamily: "monospace",
        }}
      >
        <span style={{ textTransform: "uppercase", fontWeight: "bold" }}>
          {match && match[1]}
        </span>
        <button
          onClick={handleCopy}
          style={{
            background: "transparent",
            border: "none",
            color: copied ? "#4caf50" : "#ccc",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          {copied ? "✅ Copied!" : "📋 Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={match && match[1] ? match[1] : "javascript"}
        PreTag="pre"
        customStyle={{
          margin: 0,
          padding: "15px",
          borderRadius: "0 0 8px 8px",
          fontSize: "14px",
          background: "#1e1e1e",
          overflowX: "auto",
        }}
        codeTagProps={{
          style: {
            whiteSpace: "pre",
            display: "block",
          },
        }}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
};

function ChatArea({
  sidebarOpen,
  setSidebarOpen,
  isConnected,
  showSettings,
  setShowSettings,
  customInstructions,
  setCustomInstructions,
  backgroundMemory,
  scrollContainerRef,
  currentSessionId,
  messages,
  currentUser,
  messagesEndRef,
  handleSendMessage,
  chatInputRef,
  input,
  setInput,
  isTyping,
  activeDropdown,
}) {
  useLayoutEffect(() => {
    const brainstormingMessage = [...messages]
      .reverse()
      .find(
        (msg) =>
          msg.role === "ai" && msg.text?.includes("Nova is brainstorming"),
      );

    if (!brainstormingMessage) return;

    const element = document.getElementById(
      `message-${brainstormingMessage.id}`,
    );

    if (element && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: element.offsetTop - scrollContainerRef.current.offsetTop,
        behavior: "auto",
      });
    }
  }, [messages, scrollContainerRef]);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "15px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#fff",
          zIndex: 5,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              padding: "5px",
              color: "#5f6368",
            }}
          >
            ☰
          </button>
          <h2 style={{ margin: "0", color: "#1a73e8", fontSize: "1.2rem" }}>
            Nova
          </h2>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              color: isConnected ? "#28a745" : "#dc3545",
              display: window.innerWidth < 768 ? "none" : "block",
            }}
          >
            {isConnected ? "● Online" : "○ Offline"}
          </span>
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              padding: "6px 12px",
              fontSize: "13px",
              background: showSettings ? "#e8eaed" : "#f0f4f9",
              border: "none",
              borderRadius: "18px",
              cursor: "pointer",
              color: "#202124",
            }}
          >
            ⚙️ Rules & Memory
          </button>
        </div>
      </div>

      {showSettings && (
        <div
          style={{
            padding: "15px 20px",
            background: "#f8f9fa",
            borderBottom: "1px solid #e0e0e0",
            flexShrink: 0,
            display: "flex",
            gap: "20px",
            flexDirection: window.innerWidth < 768 ? "column" : "row",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: "bold",
                marginBottom: "8px",
                fontSize: "13px",
                color: "#5f6368",
              }}
            >
              Global Directives
            </div>
            <textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              style={{
                width: "100%",
                height: "80px",
                padding: "10px",
                borderRadius: "12px",
                border: "1px solid #ccc",
                resize: "vertical",
                boxSizing: "border-box",
                fontFamily: "inherit",
                color: "#202124",
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: "bold",
                marginBottom: "8px",
                fontSize: "13px",
                color: "#5f6368",
              }}
            >
              Active Session Memory (Auto-Compacts)
            </div>
            <textarea
              readOnly
              value={
                backgroundMemory ||
                "Memory is currently empty. (Nova smoothly rolls older messages into a summary in the background)."
              }
              style={{
                width: "100%",
                height: "80px",
                padding: "10px",
                borderRadius: "12px",
                border: "1px solid #ccc",
                resize: "vertical",
                boxSizing: "border-box",
                fontFamily: "inherit",
                background: "#e8eaed",
                color: "#3c4043",
                fontSize: "13px",
              }}
            />
          </div>
        </div>
      )}

      <div
        ref={scrollContainerRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          pointerEvents: activeDropdown ? "none" : "auto",
        }}
      >
        {(!currentSessionId || messages.length === 0) && (
          <div
            style={{ margin: "auto", textAlign: "center", color: "#5f6368" }}
          >
            <h3 style={{ fontSize: "28px", marginBottom: "10px" }}>
              Hello, {currentUser}.
            </h3>
          </div>
        )}

        {messages
          ?.filter((msg) => !(msg.role === "ai" && !msg.text?.trim()))
          .map((msg, i) => (
            <div
              key={msg.id || i}
              id={msg.id ? `message-${msg.id}` : undefined}
              style={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                background: msg.role === "user" ? "#e8f0fe" : "#f1f3f4",
                color: "#202124",
                padding: "12px 18px",
                borderRadius: "24px",
                borderBottomRightRadius: msg.role === "user" ? "6px" : "24px",
                borderBottomLeftRadius: msg.role === "ai" ? "6px" : "24px",
                maxWidth: window.innerWidth < 768 ? "90%" : "75%",
                lineHeight: "1.6",
                fontSize: "15px",
              }}
            >
              {msg.role === "ai" ? (
                <div className="markdown-body">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");

                        let rawString = "";
                        if (node && node.children && node.children.length > 0) {
                          rawString = node.children[0].value;
                        } else {
                          rawString = String(children).replace(/\n$/, "");
                        }

                        return !inline && match ? (
                          <CodeBlock match={match} codeString={rawString} />
                        ) : (
                          <code
                            {...props}
                            className={className}
                            style={{
                              background: "#d7dadd",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              color: "#d93025",
                              fontFamily: "monospace",
                              fontSize: "13px",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              ) : (
                <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>
              )}
            </div>
          ))}
        <div ref={messagesEndRef} />
      </div>

      <div
        style={{
          padding: window.innerWidth < 768 ? "10px" : "20px",
          background: "#fff",
          flexShrink: 0,
        }}
      >
        <form
          onSubmit={handleSendMessage}
          style={{
            display: "flex",
            gap: "10px",
            maxWidth: "800px",
            margin: "0 auto",
            position: "relative",
            alignItems: "flex-end",
            background: "#f0f4f9",
            borderRadius: "28px",
            padding: "6px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          }}
        >
          <textarea
            ref={chatInputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "50px";
              e.target.style.height =
                Math.min(e.target.scrollHeight, 150) + "px";
            }}
            disabled={isTyping}
            placeholder={isTyping ? "Nova is thinking..." : "Message Nova..."}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.target.style.height = "50px";
                handleSendMessage(e);
              }
            }}
            style={{
              flex: 1,
              padding: "12px 50px 12px 20px",
              fontSize: "16px",
              color: "#202124",
              border: "none",
              outline: "none",
              resize: "none",
              height: "50px",
              maxHeight: "150px",
              background: "transparent",
              lineHeight: "1.4",
              overflowY: "auto",
            }}
          />
          <button
            type="submit"
            disabled={isTyping || !input.trim()}
            style={{
              position: "absolute",
              right: "10px",
              bottom: "8px",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: isTyping || !input.trim() ? "transparent" : "#1a73e8",
              color: isTyping || !input.trim() ? "#9aa0a6" : "#fff",
              border: "none",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: isTyping || !input.trim() ? "default" : "pointer",
              transition: "background 0.2s",
            }}
          >
            ↑
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatArea;
