import React from 'react';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import type { SendEmailPayload } from '@paygate/queue';

import { WelcomeEmail } from '../emails/WelcomeEmail.js';
import { PaymentReceiptEmail } from '../emails/PaymentReceiptEmail.js';
import { PaymentFailedEmail } from '../emails/PaymentFailedEmail.js';
import { SubscriptionCancelledEmail } from '../emails/SubscriptionCancelledEmail.js';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

export async function processEmailJob(data: SendEmailPayload) {
    console.info(`Preparing email to ${data.to} with template ${data.templateId}`);

    let html = '';

    switch (data.templateId) {
        case 'welcome':
            html = await render(<WelcomeEmail {...(data.data as any)} />);
            break;
        case 'receipt':
            html = await render(<PaymentReceiptEmail {...(data.data as any)} />);
            break;
        case 'payment_failed':
            html = await render(<PaymentFailedEmail {...(data.data as any)} />);
            break;
        case 'cancelled':
            html = await render(<SubscriptionCancelledEmail {...(data.data as any)} />);
            break;
        default:
            throw new Error(`Unknown email template: ${data.templateId}`);
    }

    if (process.env.RESEND_API_KEY) {
        const result = await resend.emails.send({
            from: 'PayGate <noreply@admin.vatanmalik.in>',
            to: data.to,
            subject: data.subject,
            html,
        });

        if (result.error) {
            console.error("Resend error:", result.error);
            throw new Error(result.error.message);
        }

        console.info(`Dispatched email via Resend to ${data.to}. ID: ${result.data?.id}`);
    } else {
        console.info(`[Dry Run] Email to ${data.to} generated successfully. Set RESEND_API_KEY to actually send.`);
    }
}
