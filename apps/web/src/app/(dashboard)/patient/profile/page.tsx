"use client";

import { useState } from "react";
import {
    User, Mail, Phone, MapPin, Shield, Camera, 
    Loader2, Save, Trash2, Heart, Plus, CheckCircle2,
    Lock, Bell, Settings, LogOut, ChevronRight
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
    const { data: profile, isLoading } = trpc.settings.getProfile.useQuery() as any;

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#05050a]" />
            </div>
        );
    }

    return (
        <div className="space-y-12 max-w-[1000px] mx-auto pb-20">
            {/* Header / Cover */}
            <div className="relative">
                <div className="h-48 w-full bg-gradient-to-r from-[#05050a] via-[#1a1a2e] to-[#05050a] rounded-[40px] shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 bg-[#b8ff00] blur-[120px] opacity-10 animate-pulse" />
                </div>
                
                <div className="absolute -bottom-16 left-12 flex items-end gap-6">
                    <div className="relative group">
                        <div className="h-32 w-32 rounded-[36px] bg-white p-1.5 shadow-2xl transition-transform hover:scale-105 active:scale-95 duration-500">
                             <div className="h-full w-full rounded-[30px] bg-gradient-to-tr from-[#05050a] to-[#333] flex items-center justify-center text-[42px] font-black text-[#b8ff00] shadow-inner overflow-hidden uppercase">
                                {profile?.user?.name?.[0] || 'U'}
                             </div>
                        </div>
                        <button className="absolute bottom-1 right-1 h-10 w-10 rounded-2xl bg-[#05050a] border-4 border-white text-[#b8ff00] flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-90">
                            <Camera className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="pb-4 space-y-1">
                        <h1 className="text-[32px] font-black tracking-tighter text-[#05050a] leading-none" style={{ fontFamily: "var(--font-display)" }}>
                            {profile?.user?.name || 'Member'}
                        </h1>
                        <div className="flex items-center gap-2">
                             <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-lg text-[10px] font-black tracking-widest">VERIFIED PATIENT</Badge>
                             <span className="text-[12px] font-bold text-[#b0b0b0]">Joined Oct 2023</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Settings Menu */}
                <div className="lg:col-span-4 space-y-4">
                     <div className="premium-card rounded-[32px] p-2 space-y-1">
                        {[
                            { label: 'Basic Info', icon: User, active: true },
                            { label: 'Medical History', icon: Heart, active: false },
                            { label: 'Privacy & Security', icon: Lock, active: false },
                            { label: 'Notifications', icon: Bell, active: false },
                        ].map((item, i) => (
                            <button
                                key={i}
                                className={cn(
                                    "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[14px] font-black transition-all group",
                                    item.active ? "bg-[#05050a] text-white shadow-lg" : "text-[#8a8a8a] hover:bg-black/5 hover:text-[#05050a]"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5", item.active ? "text-[#b8ff00]" : "text-[#d0d0d0] group-hover:text-[#05050a]")} />
                                {item.label}
                                {item.active && <ChevronRight className="ml-auto h-4 w-4 text-[#b8ff00]" />}
                            </button>
                        ))}
                     </div>
                     
                     <div className="p-8 premium-card rounded-[32px] bg-red-50/50 border-red-100/50 flex flex-col gap-4">
                         <div className="flex items-center gap-3 text-red-600 font-black text-[12px] uppercase tracking-widest">
                            <Trash2 className="h-4 w-4" /> Danger Zone
                         </div>
                         <p className="text-[12px] font-medium text-red-400">Permanently delete your medical profile and records. This action is irreversible.</p>
                         <button className="w-full py-3 bg-white border border-red-200 text-red-600 rounded-xl text-[12px] font-black hover:bg-red-600 hover:text-white transition-all shadow-sm">
                            DELETE ACCOUNT
                         </button>
                     </div>
                </div>

                {/* Right: Forms */}
                <div className="lg:col-span-8 space-y-8">
                     {/* Identity Section */}
                     <div className="premium-card rounded-[32px] p-10 space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[20px] font-black tracking-tight text-[#05050a]" style={{ fontFamily: "var(--font-display)" }}>Identity</h3>
                            <button className="flex items-center gap-2 text-[#b8ff00] bg-[#05050a] px-5 py-2.5 rounded-xl text-[12px] font-black transition-all hover:scale-105 active:scale-95">
                                <Save className="h-4 w-4" /> SAVE CHANGES
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#b0b0b0] pl-1">Display Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d0d0d0] group-focus-within:text-[#05050a]" />
                                    <input 
                                        type="text" 
                                        defaultValue={profile?.user?.name}
                                        className="w-full h-12 bg-[#fafaf8] border border-black/5 rounded-xl pl-11 pr-4 text-[13px] font-bold focus:outline-none focus:border-[#b8ff00] transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#b0b0b0] pl-1">Email Address</label>
                                <div className="relative group opacity-60">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d0d0d0]" />
                                    <input 
                                        type="email" 
                                        defaultValue={profile?.user?.email}
                                        disabled
                                        className="w-full h-12 bg-[#fafaf8] border border-black/5 rounded-xl pl-11 pr-4 text-[13px] font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#b0b0b0] pl-1">Blood Group</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. O+"
                                    className="w-full h-12 bg-[#fafaf8] border border-black/5 rounded-xl px-4 text-[13px] font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#b0b0b0] pl-1">Genetic History</label>
                                <input 
                                    type="text" 
                                    placeholder="Optional notes"
                                    className="w-full h-12 bg-[#fafaf8] border border-black/5 rounded-xl px-4 text-[13px] font-bold"
                                />
                            </div>
                        </div>
                     </div>

                     {/* Emergency Contact */}
                     <div className="premium-card rounded-[32px] p-10 space-y-8 bg-gradient-to-br from-white to-red-50/20">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                                <Shield className="h-5 w-5" />
                            </div>
                            <h3 className="text-[20px] font-black tracking-tight text-[#05050a]" style={{ fontFamily: "var(--font-display)" }}>Emergency Node</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#b0b0b0] pl-1">Contact Person</label>
                                <input 
                                    type="text" 
                                    placeholder="Full Name"
                                    className="w-full h-12 bg-white/50 border border-black/5 rounded-xl px-4 text-[13px] font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#b0b0b0] pl-1">Relationship</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Spouse, Parent"
                                    className="w-full h-12 bg-white/50 border border-black/5 rounded-xl px-4 text-[13px] font-bold"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-[#b0b0b0] pl-1">Emergency Phone</label>
                             <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d0d0d0]" />
                                <input 
                                    type="tel" 
                                    placeholder="+91 98765 43210"
                                    className="w-full h-12 bg-white/50 border border-black/5 rounded-xl pl-11 pr-4 text-[13px] font-bold"
                                />
                             </div>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
}
