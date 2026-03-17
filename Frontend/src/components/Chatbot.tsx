import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Minimize2,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/apiBase";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const Chatbot = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your MaurMart assistant. I can help you with products, delivery, offers, and contact info. What would you like to know?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = input.trim();
    setInput("");
    setIsTyping(true);

    try {
      const conversationHistory = messages
        .slice(-10)
        .map((msg) => ({
          sender: msg.sender,
          text: msg.text,
        }));

      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          conversationHistory,
        }),
      });

      const text = await res.text();
      let data: { response?: string; content?: string; message?: string; error?: string } = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      const botText =
        data?.response ??
        data?.content ??
        data?.message ??
        "I'm having trouble responding right now. Please try again or contact us at info@maurmart.com.";

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: botText,
        sender: "bot",
        timestamp: new Date(),
      };

      if (!res.ok) {
        const errMsg =
          data?.message ?? data?.error ?? "Something went wrong. Please try again.";
        botResponse.text = errMsg + " You can also reach us via the Contact page.";
      }

      setMessages((prev) => [...prev, botResponse]);
    } catch (_error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble responding right now. Please try again or contact us at info@maurmart.com.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  if (isMobile) {
    return (
      <>
        {!isOpen && (
          <div className="fixed bottom-24 right-6 z-50">
            <Button
              onClick={() => {
                setIsOpen(true);
                setIsMinimized(false);
              }}
              aria-label="Open chat assistant"
              className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300"
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
          </div>
        )}

        {isOpen && (
          <div
            className="fixed bottom-28 right-6 z-50 w-[calc(100vw-2rem)] max-w-sm bg-card backdrop-blur-xl border-2 border-border rounded-xl shadow-2xl card-shadow overflow-hidden flex flex-col"
            style={{
              maxHeight: "calc(100vh - 8rem)",
              height: isMinimized ? "auto" : "600px",
            }}
          >
            <div className="hero-gradient p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-primary-foreground font-black text-sm uppercase tracking-wider">
                    MaurMart Help
                  </h3>
                  <p className="text-primary-foreground/80 text-xs">Ask me anything!</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  aria-label={isMinimized ? "Expand chat window" : "Minimize chat window"}
                  className="h-8 w-8 text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/20 focus-visible:ring-2 focus-visible:ring-primary-foreground/50"
                >
                  <Minimize2 className="w-4 h-4 stroke-[2.75] text-primary-foreground drop-shadow-sm" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat window"
                  className="h-8 w-8 text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/20 focus-visible:ring-2 focus-visible:ring-primary-foreground/50"
                >
                  <X className="w-4 h-4 stroke-[2.75] text-primary-foreground drop-shadow-sm" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.sender === "bot" && (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-primary-foreground" />
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border-2 border-border text-foreground"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {message.text}
                        </p>
                      </div>
                      {message.sender === "user" && (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div className="bg-card border-2 border-border rounded-2xl px-4 py-3">
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t-2 border-border bg-card">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 border-2 border-input rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20"
                      disabled={isTyping}
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim() || isTyping}
                      aria-label="Send message"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Ask about delivery, products, offers, or contact
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-24 right-6 sm:bottom-24 sm:right-6 z-50"
          >
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                onClick={() => {
                  setIsOpen(true);
                  setIsMinimized(false);
                }}
                aria-label="Open chat assistant"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300"
              >
                <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? "auto" : "600px",
            }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed bottom-28 right-6 sm:bottom-28 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-card backdrop-blur-xl border-2 border-border rounded-xl sm:rounded-2xl shadow-2xl card-shadow overflow-hidden flex flex-col"
            style={{ maxHeight: "calc(100vh - 8rem)" }}
          >
            <div className="hero-gradient p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-primary-foreground font-black text-sm uppercase tracking-wider">
                    MaurMart Help
                  </h3>
                  <p className="text-primary-foreground/80 text-xs">Ask me anything!</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  aria-label={isMinimized ? "Expand chat window" : "Minimize chat window"}
                  className="h-8 w-8 text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/20 focus-visible:ring-2 focus-visible:ring-primary-foreground/50"
                >
                  <Minimize2 className="w-4 h-4 stroke-[2.75] text-primary-foreground drop-shadow-sm" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat window"
                  className="h-8 w-8 text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/20 focus-visible:ring-2 focus-visible:ring-primary-foreground/50"
                >
                  <X className="w-4 h-4 stroke-[2.75] text-primary-foreground drop-shadow-sm" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.sender === "bot" && (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-primary-foreground" />
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border-2 border-border text-foreground"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {message.text}
                        </p>
                      </div>
                      {message.sender === "user" && (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3 justify-start"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div className="bg-card border-2 border-border rounded-2xl px-4 py-3">
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t-2 border-border bg-card">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 border-2 border-input rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20"
                      disabled={isTyping}
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim() || isTyping}
                      aria-label="Send message"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Ask about delivery, products, offers, or contact
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
