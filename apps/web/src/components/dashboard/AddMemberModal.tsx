"use client";

import { useState } from "react";
import {
    X, UserPlus, Mail, User, Hash, Loader2,
    CheckCircle2, AlertCircle, ChevronRight
} from "lucide-react";

import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddMemberModal({ isOpen, onClose }: AddMemberModalProps) {
    const utils = trpc.useUtils();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: "",
        name: "",
        productId: "",
        telegramUsername: ""
    });

    const { data: products, isLoading: isProductsLoading } = trpc.product.list.useQuery(undefined, {
        enabled: isOpen
    });

    const addMemberMutation = trpc.subscription.addMember.useMutation({
        onSuccess: () => {
            setStep(3);
            utils.subscription.listMembers.invalidate();
            setTimeout(() => {
                handleClose();
            }, 2500);
        }
    });

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setStep(1);
            setFormData({ email: "", name: "", productId: "", telegramUsername: "" });
            addMemberMutation.reset();
        }, 300);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.productId || !formData.email) return;
        addMemberMutation.mutate(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#05050a]/60 p-4 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-full max-w-xl bg-white rounded-[32px] shadow-2xl overflow-hidden border border-black/5 animate-in zoom-in-95 duration-300">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-black/[0.04]">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-[#05050a] flex items-center justify-center text-[#b8ff00]">
                            <UserPlus className="h-5 w-5" strokeWidth={2.5} />
                        </div>
                        <h2 className="text-[20px] font-black tracking-tight text-[#05050a]" style={{ fontFamily: "var(--font-display)" }}>
                            Invite Member
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="h-10 w-10 rounded-full flex items-center justify-center text-[#b0b0b0] hover:bg-black/5 hover:text-[#05050a] transition-all"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-8">
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-1">
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b8ff00] bg-[#05050a] w-fit px-3 py-1 rounded-lg">Step 01</p>
                                <h3 className="text-[24px] font-black text-[#05050a] tracking-tighter leading-tight">Target Ecosystem</h3>
                                <p className="text-[14px] font-medium text-[#8a8a8a]">Select which product/group the member should be granted access to.</p>
                            </div>

                            <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {isProductsLoading ? (
                                    <div className="py-20 flex flex-col items-center gap-3">
                                        <Loader2 className="h-6 w-6 animate-spin text-[#05050a]" />
                                        <p className="text-[11px] font-black uppercase text-[#b0b0b0] tracking-widest">Indexing Products...</p>
                                    </div>
                                ) : products?.length === 0 ? (
                                    <div className="py-12 text-center bg-black/5 rounded-2xl">
                                        <p className="text-[14px] font-bold text-[#8a8a8a]">No products found. Create one first.</p>
                                    </div>
                                ) : (
                                    products?.map((product) => (
                                        <button
                                            key={product.id}
                                            onClick={() => {
                                                setFormData({ ...formData, productId: product.id });
                                                setStep(2);
                                            }}
                                            className={cn(
                                                "w-full flex items-center justify-between p-5 rounded-2xl border transition-all text-left group",
                                                formData.productId === product.id
                                                    ? "bg-[#05050a] border-[#05050a] text-white shadow-xl shadow-black/10"
                                                    : "bg-[#fafaf8] border-black/5 text-[#05050a] hover:border-[#b8ff00] hover:bg-white"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "h-12 w-12 rounded-xl flex items-center justify-center font-black text-[12px]",
                                                    formData.productId === product.id ? "bg-white/10 text-[#b8ff00]" : "bg-white text-[#05050a] shadow-sm"
                                                )}>
                                                    PKG
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-[15px] font-black tracking-tight leading-none">{product.name}</p>
                                                    <p className={cn(
                                                        "text-[11px] font-bold uppercase tracking-wider",
                                                        formData.productId === product.id ? "text-white/40" : "text-[#b0b0b0]"
                                                    )}>
                                                        {product.billingInterval === 'monthly' ? 'Recurring' : 'One-time'} • ₹{product.pricePaise / 100}
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight className={cn(
                                                "h-5 w-5 transition-transform group-hover:translate-x-1",
                                                formData.productId === product.id ? "text-[#b8ff00]" : "text-[#d0d0d0]"
                                            )} />
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b8ff00] bg-[#05050a] w-fit px-3 py-1 rounded-lg">Step 02</p>
                                    <h3 className="text-[24px] font-black text-[#05050a] tracking-tighter leading-tight">Identity Details</h3>
                                </div>
                                <button
                                    onClick={() => setStep(1)}
                                    className="text-[11px] font-black uppercase tracking-widest text-[#b0b0b0] hover:text-[#05050a]"
                                >
                                    Change Product
                                </button>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2.5">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b0b0b0] ml-1">Member Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#b0b0b0] group-focus-within:text-[#05050a] transition-colors" />
                                        <Input
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="hello@ecosystem.com"
                                            className="h-14 rounded-2xl bg-[#fafaf8] border-black/5 pl-12 text-[15px] font-bold text-[#05050a] focus:ring-[#05050a]/5 focus:border-[#05050a]"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2.5">
                                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b0b0b0] ml-1">Full Name</label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#b0b0b0] group-focus-within:text-[#05050a] transition-colors" />
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="John Doe"
                                                className="h-14 rounded-2xl bg-[#fafaf8] border-black/5 pl-12 text-[15px] font-bold text-[#05050a] focus:ring-[#05050a]/5 focus:border-[#05050a]"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2.5">
                                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b0b0b0] ml-1">Telegram @</label>
                                        <div className="relative group">
                                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#b0b0b0] group-focus-within:text-[#05050a] transition-colors" />
                                            <Input
                                                value={formData.telegramUsername}
                                                onChange={(e) => setFormData({ ...formData, telegramUsername: e.target.value })}
                                                placeholder="johndoe_id"
                                                className="h-14 rounded-2xl bg-[#fafaf8] border-black/5 pl-12 text-[15px] font-bold text-[#05050a] focus:ring-[#05050a]/5 focus:border-[#05050a]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {addMemberMutation.error && (
                                <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[13px] font-black text-red-700">Provisioning Failed</p>
                                        <p className="text-[11px] font-medium text-red-600/80">{addMemberMutation.error.message}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-4 pt-4">
                                <Button
                                    type="button"
                                    onClick={handleClose}
                                    variant="ghost"
                                    className="flex-1 h-14 rounded-2xl text-[14px] font-black text-[#8a8a8a] hover:bg-black/5"
                                >
                                    DISCARD
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={addMemberMutation.isPending}
                                    className="flex-[2] h-14 rounded-2xl bg-[#05050a] text-[#b8ff00] text-[14px] font-black shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    {addMemberMutation.isPending ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>AUTHORIZE ACCESS</>
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
                                <h3 className="text-[28px] font-black text-[#05050a] tracking-tight">Access Provisioned</h3>
                                <p className="text-[15px] font-medium text-[#8a8a8a] max-w-xs mx-auto">
                                    Invitation sent to <span className="text-[#05050a] font-bold">{formData.email}</span>. Automation engines are spinning up.
                                </p>
                            </div>
                            <div className="pt-4 flex items-center gap-3">
                                <Badge className="bg-white border border-black/5 text-[#05050a] rounded-lg px-3 py-1 font-black text-[10px]">WELCOME EMAIL SENT</Badge>
                                <Badge className="bg-white border border-black/5 text-[#05050a] rounded-lg px-3 py-1 font-black text-[10px]">BOT QUEUED</Badge>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
