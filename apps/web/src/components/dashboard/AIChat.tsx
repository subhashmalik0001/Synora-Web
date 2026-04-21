"use client";

import { useState, useRef, useEffect } from "react";
import { 
    MessageSquare, Send, X, Bot, User, Sparkles, 
    ChevronDown, Loader2, Maximize2, Minimize2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AI_CONFIG } from "@/lib/ai/client";

export default function AIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
        { role: 'assistant', content: "Hello! I'm your Synora AI Health Assistant. You can ask me anything about your medical records, lab results, or general health queries." }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch(`${AI_CONFIG.baseUrl}${AI_CONFIG.endpoints.chat}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "llama3", // or any model supported by the endpoint
                    messages: [
                        ...messages.map(m => ({ role: m.role, content: m.content })),
                        { role: 'user', content: userMessage }
                    ],
                    stream: false
                }),
            });

            if (!response.ok) throw new Error("AI Assistant unreachable");

            const data = await response.json();
            const reply = data.message?.content || data.response || "I'm sorry, I couldn't process that request.";
            
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "I encountered an error. Please check your connection or try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cn(
            "fixed z-50 transition-all duration-500 ease-in-out",
            isOpen ? "bottom-6 right-6" : "bottom-8 right-8"
        )}>
            {!isOpen ? (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="group relative h-16 w-16 rounded-[24px] bg-[#05050a] flex items-center justify-center text-[#b8ff00] shadow-2xl transition-all hover:scale-110 active:scale-95"
                >
                    <div className="absolute -inset-1 bg-[#b8ff00]/20 rounded-[28px] animate-pulse group-hover:bg-[#b8ff00]/40 transition-colors" />
                    <MessageSquare className="h-7 w-7 relative z-10" />
                    <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full border-4 border-white flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                    </div>
                </button>
            ) : (
                <div className={cn(
                    "bg-white rounded-[32px] shadow-2xl border border-black/5 flex flex-col overflow-hidden transition-all",
                    isMaximized ? "fixed inset-6 w-auto h-auto" : "w-[400px] h-[600px] max-h-[80vh]"
                )}>
                    {/* Header */}
                    <div className="p-6 bg-[#05050a] text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-[#b8ff00]/20 flex items-center justify-center text-[#b8ff00]">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-[15px] font-black tracking-tight">Synora AI Assistant</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#b0b0b0]">Active Engine</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setIsMaximized(!isMaximized)}
                                className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                            >
                                {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                            </button>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div 
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-[#fafaf8]/50"
                    >
                        {messages.map((m, i) => (
                            <div key={i} className={cn(
                                "flex items-start gap-3",
                                m.role === 'user' ? "flex-row-reverse" : "flex-row"
                            )}>
                                <div className={cn(
                                    "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                    m.role === 'assistant' ? "bg-[#05050a] text-[#b8ff00]" : "bg-[#b8ff00] text-[#05050a]"
                                )}>
                                    {m.role === 'assistant' ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                                </div>
                                <div className={cn(
                                    "max-w-[80%] p-4 rounded-[20px] text-[13px] font-medium leading-relaxed",
                                    m.role === 'assistant' 
                                        ? "bg-white border border-black/5 text-[#05050a] rounded-tl-none shadow-sm" 
                                        : "bg-[#05050a] text-white rounded-tr-none shadow-xl"
                                )}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-[#05050a] text-[#b8ff00] flex items-center justify-center">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                </div>
                                <div className="bg-white border border-black/5 p-4 rounded-[20px] rounded-tl-none flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-[#d0d0d0] rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 bg-[#d0d0d0] rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-[#d0d0d0] rounded-full animate-bounce" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-6 border-t border-black/5 bg-white">
                        <div className="relative flex items-center gap-3 bg-[#fafaf8] border border-black/5 rounded-2xl p-2 px-4 focus-within:border-[#05050a] focus-within:ring-1 focus-within:ring-[#05050a] transition-all">
                            <input 
                                type="text"
                                placeholder="Ask about your health..."
                                className="flex-1 bg-transparent border-none outline-none text-[13px] font-bold py-2"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button 
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="h-10 w-10 rounded-xl bg-[#05050a] text-[#b8ff00] flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-20"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="text-[10px] text-center mt-4 font-black uppercase tracking-[0.2em] text-[#d0d0d0]">
                            Powered by Synora Clinical AI
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
