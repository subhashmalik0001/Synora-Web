"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, Package, Users, CreditCard, Settings,
    BarChart3, ChevronLeft, Zap, LogOut, Menu,
    MessageCircle, ChevronRight, Sparkles, Command, Plus, Bell,
    Search, FolderIcon, Calendar, Heart, Pill, SearchIcon, User
} from "lucide-react";

import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";



const patientNavigation = [
    { href: "/patient", label: "Home", icon: LayoutDashboard },
    { href: "/patient/records", label: "Medical Records", icon: FolderIcon },
    { href: "/patient/appointments", label: "My Appointments", icon: Calendar },
    { href: "/patient/health", label: "Health Analytics", icon: Heart },
    { href: "/patient/vitals", label: "Vitals", icon: Pill },
    { href: "/patient/reminders", label: "Reminders", icon: Bell },
    { href: "/patient/doctors", label: "Find Doctors", icon: SearchIcon },
    { href: "/patient/profile", label: "Profile", icon: User },
];

const doctorNavigation = [
    { href: "/doctor", label: "Dashboard", icon: LayoutDashboard },
    { href: "/doctor/patients", label: "My Patients", icon: Users },
    { href: "/doctor/appointments", label: "Appointments", icon: Calendar },
    { href: "/doctor/opd", label: "OPD Session", icon: Zap },
    { href: "/doctor/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/doctor/settings", label: "Settings", icon: Settings },
];

import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const { data: profile, isLoading, isError, error } = trpc.settings.getProfile.useQuery(undefined, {
        retry: 1,
        refetchOnWindowFocus: false,
    });
    
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    // Redirection logic
    useEffect(() => {
        if (!isLoading && !isError) {
            if (!profile?.profile?.isOnboarded && pathname !== "/onboarding") {
                router.push("/onboarding");
            }
        }
    }, [isLoading, isError, profile, pathname, router]);

    // Cmd+K shortcut
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setShowSearch((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center bg-mesh-light">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-[#05050a]" />
                <p className="text-[12px] font-black uppercase tracking-widest text-[#8a8a8a] animate-pulse">Syncing Vitals...</p>
            </div>
        </div>;
    }

    // Relaxed error handling: Only show error screen for non-TRPC errors or critical auth failures
    const isCriticalError = isError && (error?.data?.code === "UNAUTHORIZED" || error?.data?.code === "FORBIDDEN");

    if (isError && isCriticalError) {
        return <div className="flex h-screen items-center justify-center bg-mesh-light p-6">
            <div className="w-full max-w-md rounded-[32px] bg-white p-10 shadow-2xl text-center border border-black/5">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 mb-6">
                    <LogOut className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-[20px] font-black text-[#05050a] mb-2">Access Denied</h3>
                <p className="text-[14px] text-[#8a8a8a] mb-8 leading-relaxed">
                    We couldn't verify your clinical session. Please sign in again to continue.
                </p>
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={async () => {
                            const { createClient } = await import("@/lib/supabase/browser");
                            const supabase = createClient();
                            await supabase.auth.signOut();
                            window.location.href = "/";
                        }}
                        className="w-full rounded-2xl bg-[#05050a] py-4 text-[14px] font-black text-[#b8ff00] shadow-xl transition-all active:scale-95"
                    >
                        SIGN IN AGAIN
                    </button>
                </div>
            </div>
        </div>;
    }

    const role = profile?.user?.role || "patient";
    const session = profile;
    const navigation = role === "doctor" ? doctorNavigation : patientNavigation;

    return (
        <div className="flex min-h-screen bg-mesh-light selection:bg-[#b8ff00] selection:text-[#05050a]">
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-md lg:hidden transition-all duration-500"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ═══ Floating Sidebar ═══ */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex flex-col p-4 transition-all duration-500 ease-in-out",
                    collapsed ? "w-[104px]" : "w-[280px]",
                    mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                <div
                    className="flex h-full flex-col rounded-[32px] border border-white/50 bg-white/70 shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] backdrop-blur-3xl transition-all duration-500 hover:shadow-[0_8px_48px_0_rgba(0,0,0,0.06)]"
                    style={{ border: "1px solid rgba(0,0,0,0.03)" }}
                >
                    {/* Logo Area */}
                    <div className={cn(
                        "flex h-[88px] items-center",
                        collapsed ? "justify-center px-4" : "gap-3.5 px-7"
                    )}>
                        <div
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#05050a] shadow-xl shadow-black/10 transition-all duration-500 hover:rotate-[15deg] hover:scale-110 active:scale-95"
                        >
                            <Zap className="h-5.5 w-5.5 text-[#b8ff00]" strokeWidth={2.5} />
                        </div>
                        {!collapsed && (
                            <div className="flex flex-col">
                                <span className="text-[18px] font-black tracking-[-0.04em] text-[#05050a] leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                                    SYNORA
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-1 w-1 rounded-full bg-[#b8ff00] animate-pulse" />
                                    <span className="text-[9px] font-black text-[#b0b0b0] uppercase tracking-[0.25em] leading-none">Clinical Suite</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Nav links */}
                    <nav className="flex-1 space-y-1.5 px-4 py-8 overflow-y-auto scrollbar-hide">
                        {!collapsed && <p className="px-3 pb-4 text-[10px] font-black uppercase tracking-[0.3em] text-[#c0c0c0]">Infrastructure</p>}
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={cn(
                                        "group relative flex items-center gap-3.5 rounded-[18px] px-3.5 py-3.5 text-[14px] font-black transition-all duration-500",
                                        isActive
                                            ? "bg-[#05050a] text-white shadow-[0_10px_20px_-5px_rgba(0,0,0,0.2)]"
                                            : "text-[#8a8a8a] hover:bg-black/5 hover:text-[#05050a] hover:pl-5",
                                        collapsed && "justify-center px-2 hover:pl-2"
                                    )}
                                    title={collapsed ? item.label : undefined}
                                >
                                    <item.icon
                                        className={cn(
                                            "h-[20px] w-[20px] shrink-0 transition-all duration-500",
                                            isActive ? "text-[#b8ff00]" : "text-[#d0d0d0] group-hover:scale-110 group-hover:text-[#05050a]"
                                        )}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                    {!collapsed && (
                                        <span className="relative z-10 tracking-tight">{item.label}</span>
                                    )}
                                    {isActive && !collapsed && (
                                        <div className="ml-auto flex items-center gap-1">
                                            <div className="h-1 w-1 rounded-full bg-[#b8ff00]" />
                                            <ChevronRight className="h-4 w-4 text-[#b8ff00]/40" />
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Pro Card */}
                    {!collapsed && (
                        <div className="px-4 pb-6">
                            <div className="rounded-[24px] bg-gradient-to-br from-[#05050a] via-[#1a1a2e] to-[#05050a] p-5 shadow-2xl shadow-black/20 relative overflow-hidden group border border-white/5">
                                <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-[#b8ff00] blur-[40px] opacity-10 group-hover:opacity-20 transition-opacity" />
                                <Sparkles className="absolute -right-2 -top-2 h-16 w-16 text-white/5 rotate-12 transition-transform group-hover:scale-125" />
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#b8ff00]/10 border border-[#b8ff00]/20">
                                        <Sparkles className="h-3 w-3 text-[#b8ff00]" />
                                    </div>
                                    <p className="text-[11px] font-black text-[#b8ff00] uppercase tracking-widest">AI Health</p>
                                </div>
                                <p className="text-[14px] font-black text-white mb-4 leading-tight">Insightful Wellness</p>
                                <button className="w-full rounded-xl bg-[#b8ff00] py-2.5 text-[11px] font-black text-[#05050a] transition-all hover:scale-[1.03] active:scale-[0.97] shadow-lg shadow-[#b8ff00]/10">
                                    AI SUMMARY
                                </button>
                            </div>
                        </div>
                    )}

                    {/* User Profile Footer */}
                    <div className={cn(
                        "p-4",
                        collapsed && "flex justify-center"
                    )}
                        style={{ borderTop: "1px solid rgba(0,0,0,0.03)" }}
                    >
                        <div className={cn(
                            "flex items-center gap-3.5 rounded-2xl p-2.5 transition-all duration-500 hover:bg-black/5 cursor-pointer group",
                            collapsed ? "justify-center" : "px-2"
                        )}>
                            <div className="h-10 w-10 shrink-0 rounded-2xl border-2 border-white bg-gradient-to-tr from-[#05050a] to-[#333] flex items-center justify-center text-[12px] font-black text-[#b8ff00] shadow-xl shadow-black/5 transition-transform group-hover:rotate-6">
                                {session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : "U"}
                            </div>
                            {!collapsed && (
                                <div className="flex flex-col min-w-0">
                                    <span className="truncate text-[14px] font-black text-[#05050a] tracking-tight">{session?.user?.name || "Loading..."}</span>
                                    <span className="truncate text-[9px] font-black text-[#b0b0b0] uppercase tracking-[0.15em] leading-none mt-1">{role}</span>
                                </div>
                            )}
                            {!collapsed && (
                                <button
                                    className="ml-auto p-2 text-[#d0d0d0] hover:text-red-500 transition-all hover:rotate-12"
                                    onClick={async () => {
                                        const { createClient } = await import("@/lib/supabase/browser");
                                        const supabase = createClient();
                                        await supabase.auth.signOut();
                                        window.location.href = "/";
                                    }}
                                >
                                    <LogOut className="h-4.5 w-4.5" />
                                </button>


                            )}
                        </div>
                    </div>
                </div>
            </aside>

            {/* ═══ Main content ═══ */}
            <main className={cn("flex-1 transition-all duration-500 ease-in-out", collapsed ? "lg:pl-[104px]" : "lg:pl-[280px]")}>
                {/* Modern Floating Header */}
                <div className="sticky top-0 z-30 px-6 pt-6">
                    <header
                        className="flex h-[64px] items-center gap-4 rounded-[18px] border border-white/40 bg-white/60 px-6 shadow-sm backdrop-blur-xl"
                        style={{ border: "1px solid rgba(0,0,0,0.05)" }}
                    >
                        <button
                            className="lg:hidden rounded-xl p-2.5 text-[#05050a] hover:bg-black/5 transition-all"
                            onClick={() => setMobileOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <div
                            className="flex items-center gap-2 text-[#b0b0b0] hover:text-[#05050a] transition-colors cursor-pointer group"
                            onClick={() => setShowSearch(true)}
                        >
                            <Command className="h-4 w-4" />
                            <span className="text-[12px] font-bold uppercase tracking-[0.1em]">Search</span>
                            <span className="hidden sm:flex items-center gap-1 rounded-md bg-black/5 px-2 py-0.5 text-[10px] font-bold text-[#999] group-hover:bg-black/10 transition-colors">
                                <span className="text-[8px]">⌘</span>K
                            </span>
                        </div>

                        <div className="ml-auto flex items-center gap-3">
                            {role === "patient" ? (
                                <Link href="/scanner" className="hidden sm:block">
                                    <button
                                        className="flex items-center gap-2 rounded-xl bg-[#05050a] px-4 py-2 text-[12px] font-extrabold text-[#b8ff00] shadow-lg shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <Plus className="h-4 w-4" strokeWidth={3} />
                                        NEW RECORD
                                    </button>
                                </Link>
                            ) : (
                                <Link href="/doctor/opd" className="hidden sm:block">
                                    <button
                                        className="flex items-center gap-2 rounded-xl bg-[#05050a] px-4 py-2 text-[12px] font-extrabold text-[#b8ff00] shadow-lg shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <Zap className="h-4 w-4" strokeWidth={3} />
                                        LIVE OPD
                                    </button>
                                </Link>
                            )}

                            <div className="relative">
                                <button
                                    className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:bg-black/5"
                                    onClick={() => setShowNotifications(!showNotifications)}
                                >
                                    <Bell className="h-5 w-5 text-[#05050a]" />
                                </button>

                                {showNotifications && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowNotifications(false)}
                                        />
                                        <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-black/5 bg-white p-4 shadow-2xl animate-in fade-in slide-in-from-top-2">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-[14px] font-black text-[#05050a]">Notifications</h3>
                                                <button className="text-[10px] font-bold text-[#b0b0b0] hover:text-[#05050a]">MARK ALL READ</button>
                                            </div>
                                            <div className="flex flex-col items-center justify-center p-6 text-center">
                                                <Bell className="h-8 w-8 text-[#d0d0d0] mb-2" />
                                                <p className="text-[12px] font-bold text-[#05050a]">You&apos;re all caught up!</p>
                                                <p className="text-[11px] font-medium text-[#8a8a8a] mt-1">No new alerts right now.</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="ml-2 hidden sm:block">
                                <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-black/5 shadow-sm text-[#05050a] transition-all hover:rotate-6 active:scale-95" onClick={() => setCollapsed(!collapsed)}>
                                    <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
                                </button>
                            </div>
                        </div>
                    </header>
                </div>

                <div className="p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="dashboard-grid min-h-screen">
                        {children}
                    </div>
                </div>

                {/* Search Menu Modal */}
                {showSearch && (
                    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh]">
                        <div
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-all"
                            onClick={() => setShowSearch(false)}
                        />
                        <div className="relative w-full max-w-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex h-[52px] items-center gap-3 rounded-t-2xl bg-white px-4 border border-black/5 border-b-black/10">
                                <Search className="h-4 w-4 text-[#8a8a8a]" />
                                <input
                                    autoFocus
                                    placeholder="Search command or jump to..."
                                    className="flex-1 bg-transparent text-[14px] font-medium placeholder:text-[#d0d0d0] focus:outline-none"
                                />
                                <div className="text-[10px] font-bold text-[#b0b0b0] bg-black/5 px-2 py-0.5 rounded-md">ESC</div>
                            </div>
                            <div className="bg-[#fafaf8] p-2 rounded-b-2xl border border-black/5 border-t-0 space-y-1">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setShowSearch(false)}
                                        className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white hover:shadow-sm transition-all group"
                                    >
                                        <item.icon className="h-4 w-4 text-[#8a8a8a] group-hover:text-[#05050a]" />
                                        <span className="text-[13px] font-bold text-[#05050a]">{item.label}</span>
                                        <ChevronRight className="ml-auto h-3 w-3 text-[#d0d0d0] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
