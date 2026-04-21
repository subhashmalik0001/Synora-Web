"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
    X, Bot, Loader2,
    AlertCircle, CheckCircle2, Globe
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

interface ConnectGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ConnectGroupModal({ isOpen, onClose, onSuccess }: ConnectGroupModalProps) {
    const [inviteLink, setInviteLink] = useState("");
    const [step, setStep] = useState(1);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const connectMutation = trpc.telegram.connect.useMutation({
        onSuccess: () => { // _data removed as it was unused
            setStep(3);
            setTimeout(() => {
                onSuccess();
                onClose();
                setStep(1);
                setInviteLink("");
            }, 2500);
        },
        onError: () => { // _err removed as it was unused
            // Error is handled by displaying it in the UI
        }
    });

    const handleConnect = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteLink) return;
        connectMutation.mutate({ inviteLink });
    };

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#05050a]/60 p-4 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-full max-w-xl bg-white rounded-[32px] shadow-2xl overflow-hidden border border-black/5 animate-in zoom-in-95 duration-300">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-black/[0.04]">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-[#05050a] flex items-center justify-center text-[#b8ff00]">
                            <Bot className="h-5 w-5" strokeWidth={2.5} />
                        </div>
                        <h2 className="text-[20px] font-black tracking-tight text-[#05050a]" style={{ fontFamily: "var(--font-display)" }}>
                            Link Engine
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-10 w-10 rounded-full flex items-center justify-center text-[#b0b0b0] hover:bg-black/5 hover:text-[#05050a] transition-all"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-8">
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-1">
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b8ff00] bg-[#05050a] w-fit px-3 py-1 rounded-lg">Genesis</p>
                                <h3 className="text-[24px] font-black text-[#05050a] tracking-tighter leading-tight">Configure Your Bot</h3>
                                <p className="text-[14px] font-medium text-[#8a8a8a]">Grant Fluxar the necessary authorities to orchestrate your community.</p>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { step: 1, text: <>Add <span className="font-mono font-bold text-[#05050a]">@FluxarBot</span> to your Telegram group.</> },
                                    { step: 2, text: <>Promote the bot to <span className="font-bold">Administrator</span>.</> },
                                    { step: 3, text: <>Enable <span className="underline decoration-[#b8ff00] decoration-2 underline-offset-4">Add Members</span> & <span className="underline decoration-[#b8ff00] decoration-2 underline-offset-4">Ban Users</span> permissions.</> }
                                ].map((item) => (
                                    <div key={item.step} className="flex gap-4 p-4 rounded-2xl bg-[#fafaf8] border border-black/5 items-start">
                                        <div className="h-7 w-7 shrink-0 rounded-lg bg-white border border-black/10 flex items-center justify-center text-[11px] font-black text-[#05050a] shadow-sm">
                                            {item.step}
                                        </div>
                                        <p className="text-[14px] font-medium text-[#05050a] leading-relaxed pt-0.5">{item.text}</p>
                                    </div>
                                ))}
                            </div>

                            <Button
                                onClick={() => setStep(2)}
                                className="w-full h-14 rounded-2xl bg-[#05050a] text-[#b8ff00] text-[15px] font-black shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                AUTHORITIES GRANTED
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleConnect} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b8ff00] bg-[#05050a] w-fit px-3 py-1 rounded-lg">Sync</p>
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="text-[10px] font-black uppercase tracking-widest text-[#b0b0b0] hover:text-[#05050a] bg-black/5 hover:bg-black/10 px-2.5 py-1 rounded-md transition-all"
                                        >
                                            View Instructions
                                        </button>
                                    </div>
                                    <h3 className="text-[24px] font-black text-[#05050a] tracking-tighter leading-tight">Handshake Link</h3>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2.5">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b0b0b0] ml-1">Group ID or Invite Link</label>
                                    <div className="relative group">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#b0b0b0] group-focus-within:text-[#05050a] transition-colors" />
                                        <Input
                                            placeholder="@my_elite_group or t.me/join..."
                                            value={inviteLink}
                                            onChange={(e) => setInviteLink(e.target.value)}
                                            className="h-14 rounded-2xl bg-[#fafaf8] border-black/5 pl-12 text-[15px] font-bold text-[#05050a] focus:ring-[#05050a]/5 focus:border-[#05050a]"
                                            autoFocus
                                            required
                                            disabled={connectMutation.isPending}
                                        />
                                    </div>
                                    <p className="text-[11px] font-medium text-[#b0b0b0] italic pl-1">
                                        Tip: High-security groups must be set to &apos;Public&apos; temporarily for the initial handshake.
                                    </p>
                                </div>
                            </div>

                            {connectMutation.error && (
                                <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[13px] font-black text-red-700">Sync Failure</p>
                                            <p className="text-[11px] font-medium text-red-600/80 leading-relaxed">{connectMutation.error.message}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="w-full py-2 rounded-lg bg-white border border-red-100 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 transition-all"
                                    >
                                        Re-read Genesis Instructions
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center gap-4 pt-4">
                                <Button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    variant="ghost"
                                    className="flex-1 h-14 rounded-2xl text-[14px] font-black text-[#8a8a8a] hover:bg-black/5"
                                >
                                    BACK
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={connectMutation.isPending}
                                    className="flex-[2] h-14 rounded-2xl bg-[#05050a] text-[#b8ff00] text-[14px] font-black shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    {connectMutation.isPending ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>INITIALIZE HANDSHAKE</>
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in duration-500">
                            <div className="h-24 w-24 rounded-[32px] bg-emerald-50 flex items-center justify-center relative">
                                <CheckCircle2 className="h-12 w-12 text-emerald-500" strokeWidth={2.5} />
                                <div className="absolute inset-0 rounded-[32px] border-4 border-emerald-500/20 animate-ping opacity-20" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-[28px] font-black text-[#05050a] tracking-tight">Sync Established</h3>
                                <p className="text-[15px] font-medium text-[#8a8a8a] max-w-xs mx-auto">
                                    The automation engine is now live. Your community is under Fluxar protection.
                                </p>
                            </div>
                            <div className="pt-4">
                                <Badge className="bg-[#05050a] text-[#b8ff00] border-none rounded-lg px-4 py-1.5 font-black text-[11px] tracking-widest uppercase">Engine Live</Badge>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
