export default function CheckoutPage({
    params,
}: {
    params: { creatorSlug: string; productSlug: string };
}) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md">
                <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
                    <div className="mb-6 text-center">
                        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-brand-100 flex items-center justify-center">
                            <div className="h-8 w-8 rounded-lg bg-brand-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {params.productSlug.replace(/-/g, " ")}
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            by @{params.creatorSlug}
                        </p>
                    </div>

                    <div className="mb-6 rounded-xl bg-gray-50 p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Price</span>
                            <span className="text-lg font-bold text-gray-900">₹---/mo</span>
                        </div>
                    </div>

                    <button
                        className="w-full rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition-all hover:bg-brand-700 hover:shadow-brand-600/40 hover:-translate-y-0.5 disabled:opacity-50"
                        disabled
                    >
                        Pay with Razorpay
                    </button>

                    <p className="mt-4 text-center text-xs text-gray-400">
                        Powered by Fluxar · Secure payments via Razorpay
                    </p>
                </div>
            </div>
        </main>
    );
}
