export default function Ticker() {
    const text = "✚ REAL-TIME VITALS SYNC  •  FALL DETECTION ACTIVE  •  SMART EHR SECURED  •  AI RECORD PARSING  •  24/7 MONITORING  •  HIPAA COMPLIANT  •  IOT INTEGRATED  •  ASSISTIVE CARE  •  ";
    return (
        <div className="ticker-strip" aria-hidden="true" style={{ background: '#05050a' }}>
            <div className="ticker-content">
                <span className="px-4 text-[#b8ff00]">{text}</span>
                <span className="px-4 text-[#b8ff00]">{text}</span>
                <span className="px-4 text-[#b8ff00]">{text}</span>
                <span className="px-4 text-[#b8ff00]">{text}</span>
            </div>
        </div>
    );
}

