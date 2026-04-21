export default function Footer() {
    return (
        <footer className="pt-24" style={{ background: 'var(--paper)', borderTop: '1px solid var(--line)' }}>
            <div className="mx-auto max-w-7xl px-6 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-6 space-y-8">
                        <div className="font-display font-black text-2xl text-[#05050a]">
                            SYNORA
                        </div>
                        <p className="font-body text-[15px] text-[#1a1a2e] max-w-sm leading-relaxed">
                            Restoring dignity, safety, and independence through AI-powered 
                            Remote Patient Monitoring and Smart EHR systems.
                        </p>
                    </div>

                    <div className="lg:col-span-3">
                        <div className="font-mono-dm text-[10px] font-black tracking-[0.2em] text-[#8a8a8a] mb-8 uppercase">Ecosystem</div>
                        <ul className="space-y-4 font-body text-sm text-[#05050a] font-medium">
                            {["Synora Wearable", "RPM Dashboard", "Smart EHR", "Clinical API"].map(l => (
                                <li key={l}><a href="#" className="hover:text-[#4c6ef5] transition-colors">{l}</a></li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-3">
                        <div className="font-mono-dm text-[10px] font-black tracking-[0.2em] text-[#8a8a8a] mb-8 uppercase">Support</div>
                        <ul className="space-y-4 font-body text-sm text-[#05050a] font-medium">
                            {["HIPAA Compliance", "Privacy Policy", "Terms of Service", "Help Desk"].map(l => (
                                <li key={l}><a href="#" className="hover:text-[#4c6ef5] transition-colors">{l}</a></li>
                            ))}
                        </ul>
                        <div className="mt-8 font-mono-dm text-sm text-[#05050a] font-black">
                            hello@synora.in
                        </div>
                    </div>
                </div>

                <div className="mt-24 pt-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-6 font-mono-dm text-[10px] uppercase tracking-[0.2em] text-[#8a8a8a] font-black">
                    <div>© 2025 Synora HealthTech Pvt. Ltd.</div>
                    <div className="flex gap-4 items-center">
                        <span>Made in India 🇮🇳</span>
                        <span className="opacity-30">|</span>
                        <span>Clinical Grade IoT</span>
                        <span className="opacity-30">|</span>
                        <span>Encrypted & Secured</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

