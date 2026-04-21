/**
 * Convert paise to formatted rupees string
 * 99900 → "₹999.00"
 */
export function paiseToRupees(paise: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
    }).format(paise / 100);
}

/**
 * Convert rupees to paise
 * 999 → 99900
 */
export function rupeesToPaise(rupees: number): number {
    return Math.round(rupees * 100);
}

/**
 * Format paise as a simple number string (no currency symbol)
 * 99900 → "999.00"
 */
export function formatPaise(paise: number): string {
    return (paise / 100).toFixed(2);
}
