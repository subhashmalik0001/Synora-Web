"use client";

import { useState } from "react";
import {
    Activity, Heart, Thermometer, Droplets, ArrowUpRight, Loader2, Plus, Calendar, FileText, ChevronRight, User, Pill, CheckCircle2, TrendingUp
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";


import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

export default function PatientDashboard() {
    // These will need to be implemented in trpc routers
    // For now, using placeholders or empty data to prevent crashes
    const { data: vitals, isLoading: isVitalsLoading } = trpc.medical.getVitals.useQuery({ limit: 4 });
    const { data: chartData, isLoading: isChartLoading } = trpc.analytics.getRevenueChart.useQuery() as any; 
    const { data: recentAppointments, isLoading: isAppointmentsLoading } = trpc.medical.listAppointments.useQuery();
    const { data: session } = trpc.settings.getProfile.useQuery();


    if (isVitalsLoading || isChartLoading || isAppointmentsLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#05050a]" />
            </div>
        );
    }

    return (
        <div className="space-y-12 max-w-[1400px] mx-auto pb-20">
            {/* Header / Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
                <div className="lg:col-span-8 space-y-2">
                    <h1 className="text-[42px] font-black tracking-tighter text-[#05050a] leading-[1.1]" style={{ fontFamily: "var(--font-display)" }}>
                        Your health <span className="text-[#b8ff00] bg-[#05050a] px-3 rounded-xl inline-block rotate-[-1deg]">simplified</span>,<br />Curator Medical Plus.
                    </h1>
                    <p className="text-[15px] font-medium text-[#8a8a8a] max-w-md">Welcome back, {session?.user?.name || 'Patient'}. Your vitals are looking stable today.</p>
                </div>
                <div className="lg:col-span-4 flex justify-end gap-3">
                    <button
                        className="flex items-center gap-2 rounded-xl border border-black/5 bg-white px-5 py-3 text-[13px] font-bold text-[#05050a] transition-all hover:premium-shadow active:scale-95"
                    >
                        <Calendar className="h-4 w-4" /> Book Appointment
                    </button>
                    <button
                        className="flex items-center gap-2 rounded-xl bg-[#05050a] px-5 py-3 text-[13px] font-bold text-[#b8ff00] shadow-xl shadow-black/10 transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        Log Vitals
                    </button>
                </div>
            </div>

            {/* The "Main Screen" Card */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Wellness Index Chart */}
                <div className="xl:col-span-8 premium-card rounded-[32px] p-8 md:p-10 flex flex-col gap-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-1">
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b0b0b0]">Wellness Index Score</p>
                            <div className="flex items-baseline gap-4">
                                <h2 className="text-[54px] font-black tracking-tighter text-[#05050a]">84/100</h2>
                                <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100/50 rounded-lg px-2 py-1 text-[12px] font-bold animate-pulse">
                                    <TrendingUp className="h-3 w-3 mr-1" /> Improving
                                </Badge>
                            </div>
                        </div>
                        <div className="flex gap-1 bg-black/5 p-1 rounded-xl">
                            {['1W', '1M', '3M', '6M'].map(t => (
                                <button key={t} className={cn(
                                    "px-4 py-1.5 text-[11px] font-black rounded-lg transition-all",
                                    t === '1W' ? "bg-white text-[#05050a] shadow-sm" : "text-[#8a8a8a] hover:text-[#05050a]"
                                )}>{t}</button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[340px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="premiumRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#b8ff00" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#b8ff00" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#d0d0d0', fontSize: 11, fontWeight: 700 }}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ stroke: '#05050a', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-[#05050a] text-white p-4 rounded-2xl shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#b0b0b0] mb-1">{payload[0].payload.date}</p>
                                                    <p className="text-[18px] font-black text-[#b8ff00]">{payload[0].value} pts</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#05050a"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#premiumRev)"
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Vitals Sidebar */}
                <div className="xl:col-span-4 flex flex-col gap-6">
                    {/* BP Card */}
                    <div className="premium-card rounded-[32px] p-8 flex flex-col justify-between flex-1 relative overflow-hidden group border-l-[6px] border-l-red-500">
                        <Heart className="absolute -right-6 -bottom-6 h-32 w-32 text-red-500/5 transition-transform group-hover:scale-110" />
                        <div className="space-y-1">
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b0b0b0]">Blood Pressure</p>
                            <h3 className="text-[42px] font-black tracking-tighter text-[#05050a]">120/80</h3>
                        </div>
                        <div className="pt-6">
                            <div className="flex items-center gap-1 text-[12px] font-bold text-emerald-500 mb-2">
                                <CheckCircle2 className="h-4 w-4 text-[#b8ff00]" />
                                <span>Optimal Range</span>
                            </div>
                            <p className="text-[11px] font-medium text-[#8a8a8a]">Last recorded: 2h ago</p>
                        </div>
                    </div>

                    {/* Quick AI Summary Insight */}
                    <div className="bg-[#05050a] rounded-[32px] p-8 text-white flex flex-col justify-between h-[200px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8">
                            <Activity className="h-8 w-8 text-[#b8ff00]" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">AI Health Insight</p>
                            <p className="text-[15px] font-bold leading-snug">Based on your recent reports, your <span className="text-[#b8ff00]">Iron levels</span> are normalizing. Keep it up!</p>
                        </div>
                        <button className="text-[11px] font-black uppercase tracking-widest text-[#b8ff00] flex items-center gap-2 group-hover:gap-3 transition-all">
                            View Full Report <ChevronRight className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Appointments & Medication */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Recent Appointments */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[20px] font-black tracking-tight text-[#05050a]" style={{ fontFamily: "var(--font-display)" }}>Upcoming Appointments</h3>
                        <button className="text-[12px] font-bold text-[#b0b0b0] hover:text-[#05050a] transition-colors">View All</button>
                    </div>
                    <div className="premium-card rounded-[32px] overflow-hidden">
                        <div className="divide-y divide-black/[0.04]">
                            {recentAppointments && recentAppointments.length > 0 ? (
                                recentAppointments.slice(0, 2).map((app: any) => (
                                    <div key={app.id} className="flex items-center gap-4 px-8 py-6 transition-colors hover:bg-black/[0.01] group">
                                        <div className="h-12 w-12 rounded-2xl bg-black flex items-center justify-center text-[#b8ff00] font-black text-[12px] shadow-lg shadow-black/5 group-hover:scale-110 transition-transform">
                                            DR
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[15px] font-black text-[#05050a] truncate">Dr. Sarah Connor</span>
                                            <span className="text-[12px] font-medium text-[#8a8a8a] truncate">Cardiologist • General Checkup</span>
                                        </div>
                                        <div className="ml-auto flex flex-col items-end gap-1">
                                            <Badge className="bg-[#b8ff00]/10 text-[#05050a] border border-[#b8ff00]/20 rounded-lg text-[10px] uppercase font-black">Video Call</Badge>
                                            <span className="text-[11px] font-bold text-[#b0b0b0]">Tomorrow, 10:30 AM</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-20 text-center">
                                    <p className="text-[13px] font-bold text-[#b0b0b0]">No upcoming consultations.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Medication Reminders Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <h3 className="text-[20px] font-black tracking-tight text-[#05050a] px-2" style={{ fontFamily: "var(--font-display)" }}>Active Medications</h3>

                    <div className="space-y-4">
                        <div className="premium-card rounded-[24px] p-6 flex items-center gap-5 transition-all text-left group">
                            <div className="h-12 w-12 rounded-2xl bg-[#b8ff00]/10 flex items-center justify-center text-[#05050a] transition-transform group-hover:rotate-6">
                                <Pill className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[14px] font-black text-[#05050a]">Metformin 500mg</span>
                                <span className="text-[12px] font-medium text-[#8a8a8a]">Twice daily • After Food</span>
                            </div>
                            <div className="ml-auto h-2 w-2 rounded-full bg-[#b8ff00] animate-pulse" />
                        </div>

                        <div className="premium-card rounded-[24px] p-6 flex items-center gap-5 transition-all text-left group">
                            <div className="h-12 w-12 rounded-2xl bg-black/5 flex items-center justify-center text-[#05050a] transition-transform group-hover:rotate-6">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[14px] font-black text-[#05050a]">Lab Results Pending</span>
                                <span className="text-[12px] font-medium text-[#8a8a8a]">Lipid Profile • Apollo Labs</span>
                            </div>
                            <ChevronRight className="ml-auto h-4 w-4 text-[#b0b0b0]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
