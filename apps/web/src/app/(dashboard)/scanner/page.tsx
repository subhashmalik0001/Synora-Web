"use client";

import { useState, useRef } from "react";
import { 
    Camera, Upload, Sparkles, Loader2, ArrowRight, 
    FileText, CheckCircle2, Shield, AlertCircle, X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

export default function ScannerPage() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'complete' | 'error'>('idle');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const supabase = createClient();
    const { data: folders } = trpc.medical.listFolders.useQuery();
    const [selectedFolderId, setSelectedFolderId] = useState<string>("");

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
    const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

    const processRecord = trpc.medical.processMedicalRecord.useMutation({
        onSuccess: () => {
            setStatus('complete');
            setTimeout(() => router.push('/patient/records'), 2000);
        },
        onError: (err) => {
            setStatus('error');
            setError(err.message);
        }
    });

    const getUploadUrl = trpc.medical.getUploadUrl.useMutation();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;

        // Validate MIME type
        if (!ALLOWED_TYPES.includes(selected.type)) {
            setError('Invalid file type. Please upload a JPEG, PNG, or PDF.');
            setStatus('error');
            return;
        }

        // Validate file size (max 10MB)
        if (selected.size > MAX_SIZE_BYTES) {
            setError('File is too large. Maximum allowed size is 10MB.');
            setStatus('error');
            return;
        }

        setFile(selected);
        setError(null);
        setStatus('idle');

        // Preview (only for images)
        if (selected.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(selected);
        } else {
            // PDF — show a placeholder preview
            setPreview(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setStatus('uploading');
        setError(null);

        try {
            setUploadProgress(10);

            // 1. Get Signed Upload URL from server (admin client, bypasses RLS)
            const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const fileName = `${Date.now()}-${sanitizedName}`;
            const { signedUrl, token, path } = await getUploadUrl.mutateAsync({ fileName });

            setUploadProgress(30);

            // 2. Upload file to Supabase Storage via signed URL
            const { error: uploadError } = await supabase.storage
                .from('medical-records')
                .uploadToSignedUrl(path, token, file, {
                    contentType: file.type,
                });

            if (uploadError) throw uploadError;
            setUploadProgress(60);

            // 3. Send raw path to AI processing pipeline (Server will generate signed read URL)
            setStatus('analyzing');
            await processRecord.mutateAsync({
                fileUrl: path,
                folderId: selectedFolderId || undefined,
            });

            setUploadProgress(100);
        } catch (err: any) {
            console.error("UPLOAD_ERROR:", err);
            setStatus('error');
            setError(err.message || "Failed to upload and analyze record.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
            <div className="text-center space-y-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-[24px] bg-[#05050a] shadow-2xl shadow-black/10">
                    <Sparkles className="h-8 w-8 text-[#b8ff00]" />
                </div>
                <h1 className="text-[48px] font-black tracking-tighter text-[#05050a] leading-none" style={{ fontFamily: "var(--font-display)" }}>
                    Synora AI Scanner
                </h1>
                <p className="text-[16px] font-medium text-[#8a8a8a] max-w-md mx-auto leading-relaxed">
                    Instantly extract diagnoses, medications, and clinical insights from your medical documents.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Upload Area */}
                <div 
                    className={cn(
                        "relative group cursor-pointer aspect-[3/4] rounded-[40px] border-4 border-dashed transition-all flex flex-col items-center justify-center p-8 text-center",
                        preview ? "border-transparent bg-white shadow-2xl" : "border-black/5 bg-black/[0.01] hover:bg-black/[0.02] hover:border-[#b8ff00]/30",
                        status !== 'idle' && "pointer-events-none"
                    )}
                    onClick={() => !preview && fileInputRef.current?.click()}
                >
                    {preview ? (
                        <div className="relative w-full h-full rounded-[30px] overflow-hidden">
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                <button 
                                    className="h-14 w-14 rounded-2xl bg-white text-[#05050a] flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
                                    onClick={(e) => { e.stopPropagation(); setPreview(null); setFile(null); }}
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="h-20 w-20 rounded-3xl bg-[#05050a] flex items-center justify-center text-[#b8ff00] mb-6 group-hover:scale-110 transition-transform">
                                <Camera className="h-10 w-10" />
                            </div>
                            <h3 className="text-[20px] font-black text-[#05050a] mb-2">Capture or Drop</h3>
                            <p className="text-[14px] font-medium text-[#b0b0b0]">Support for PDF, JPG, and PNG medical documents up to 10MB.</p>
                            <button className="mt-8 px-6 py-3 bg-black/5 rounded-xl text-[12px] font-black tracking-widest uppercase hover:bg-[#05050a] hover:text-white transition-all">
                                CHOOSE FILE
                            </button>
                        </>
                    )}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={handleFileChange} 
                    />
                </div>

                {/* Status Card */}
                <div className="flex flex-col gap-6">
                    <div className="premium-card rounded-[40px] p-10 flex-1 flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 h-40 w-40 bg-[#b8ff00] blur-[100px] opacity-10" />
                        
                        {status === 'idle' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                        <Shield className="h-5 w-5" />
                                    </div>
                                    <h4 className="text-[18px] font-black text-[#05050a]">HIPAA Compliant</h4>
                                </div>
                                <p className="text-[14px] font-medium text-[#8a8a8a] leading-relaxed">
                                    Your data is encrypted end-to-end. Our AI model is trained on clinical datasets to ensure 98% extraction accuracy.
                                </p>

                                {file && folders && folders.length > 0 && (
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-[#b0b0b0]">Save to Folder (Optional)</label>
                                        <select 
                                            value={selectedFolderId}
                                            onChange={(e) => setSelectedFolderId(e.target.value)}
                                            className="w-full h-12 rounded-xl border border-black/5 bg-[#fafaf8] px-4 text-sm font-bold focus:outline-none focus:border-[#b8ff00] transition-all"
                                        >
                                            <option value="">No Folder (General)</option>
                                            {folders.map(f => (
                                                <option key={f.id} value={f.id}>{f.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <button 
                                    disabled={!file}
                                    onClick={handleUpload}
                                    className="w-full h-16 rounded-[20px] bg-[#05050a] text-[#b8ff00] font-black text-[15px] flex items-center justify-center gap-2 shadow-xl shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30"
                                >
                                    {file ? 'INITIALIZE AI ANALYSIS' : 'WAITING FOR DOCUMENT'}
                                    <ArrowRight className="h-5 w-5" />
                                </button>
                            </div>
                        )}

                        {(status === 'uploading' || status === 'analyzing') && (
                            <div className="flex flex-col items-center text-center space-y-6 py-10">
                                <div className="relative">
                                    <div className="h-24 w-24 rounded-[32px] border-4 border-black/[0.03] flex items-center justify-center">
                                        <Loader2 className="h-10 w-10 animate-spin text-[#05050a]" />
                                    </div>
                                    <div className="absolute -inset-4 rounded-[40px] border border-[#b8ff00]/20 animate-pulse" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-[20px] font-black text-[#05050a] uppercase tracking-tighter">
                                        {status === 'uploading' ? 'Vaulting Document' : 'AI Neural Extraction'}
                                    </h3>
                                    <p className="text-[14px] font-medium text-[#b0b0b0]">
                                        {status === 'uploading' ? 'Securing your record in our clinical vault...' : 'Identifying medications, dosages, and clinical intent...'}
                                    </p>
                                </div>
                                {/* Upload progress bar */}
                                <div className="w-full bg-black/5 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="h-2 bg-[#b8ff00] rounded-full transition-all duration-500"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <p className="text-[11px] font-black text-[#b0b0b0] uppercase tracking-widest">{uploadProgress}% Complete</p>
                            </div>
                        )}

                        {status === 'complete' && (
                            <div className="flex flex-col items-center text-center space-y-6 py-10 animate-in fade-in zoom-in-95">
                                <div className="h-20 w-20 rounded-[28px] bg-emerald-50 flex items-center justify-center text-emerald-500">
                                    <CheckCircle2 className="h-10 w-10" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-[20px] font-black text-[#05050a]">Analysis Success</h3>
                                    <p className="text-[14px] font-medium text-[#8a8a8a]">Your record has been processed and synced to your medical vault.</p>
                                </div>
                                <div className="text-[11px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-lg">
                                    Redirecting to Vault...
                                </div>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="flex flex-col items-center text-center space-y-6 py-10">
                                <div className="h-20 w-20 rounded-[28px] bg-red-50 flex items-center justify-center text-red-500">
                                    <AlertCircle className="h-10 w-10" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-[20px] font-black text-[#05050a]">Analysis Failed</h3>
                                    <p className="text-[14px] font-medium text-red-400">{error || "An unknown error occurred during analysis."}</p>
                                </div>
                                <button 
                                    onClick={() => setStatus('idle')}
                                    className="px-6 py-3 bg-[#05050a] text-white rounded-xl text-[12px] font-black uppercase"
                                >
                                    TRY AGAIN
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="premium-card rounded-[32px] p-8 bg-[#fafaf8]">
                        <h5 className="text-[12px] font-black uppercase tracking-widest text-[#b0b0b0] mb-4">Supported Formats</h5>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Prescriptions', icon: FileText },
                                { label: 'Lab Reports', icon: FileText },
                                { label: 'Insurance', icon: Shield },
                                { label: 'Invoices', icon: FileText },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-black/5 shadow-sm">
                                    <item.icon className="h-4 w-4 text-[#d0d0d0]" />
                                    <span className="text-[11px] font-black text-[#05050a]">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
