import * as React from 'react';
import { Html, Head, Preview, Body, Container, Section, Text, Button, Hr } from '@react-email/components';

interface PaymentReceiptEmailProps {
    userName: string;
    productName: string;
    amount: string;
    date: string;
    receiptUrl?: string;
}

export const PaymentReceiptEmail = ({ userName, productName, amount, date, receiptUrl }: PaymentReceiptEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Your Payment Receipt for {productName}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Text style={heading}>Payment Successful</Text>
                    <Text style={paragraph}>Hi {userName},</Text>
                    <Text style={paragraph}>
                        Thank you for your purchase! We successfully processed your payment for <strong>{productName}</strong>.
                    </Text>

                    <Section style={receiptBox}>
                        <Text style={receiptRow}><strong>Amount Paid:</strong> {amount}</Text>
                        <Text style={receiptRow}><strong>Date:</strong> {date}</Text>
                        <Text style={receiptRow}><strong>Product:</strong> {productName}</Text>
                    </Section>

                    {receiptUrl && (
                        <Section style={btnContainer}>
                            <Button style={button} href={receiptUrl}>
                                Download PDF Receipt
                            </Button>
                        </Section>
                    )}

                    <Hr style={hr} />
                    <Text style={footer}>
                        PayGate Platform &bull; Billing Department
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default PaymentReceiptEmail;

const main = { backgroundColor: '#ffffff', fontFamily: 'sans-serif' };
const container = { margin: '0 auto', padding: '20px 0 48px', width: '580px' };
const heading = { fontSize: '24px', fontWeight: '700', color: '#16a34a' };
const paragraph = { fontSize: '16px', lineHeight: '26px', color: '#484848' };
const receiptBox = { backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', margin: '20px 0' };
const receiptRow = { fontSize: '14px', margin: '4px 0', color: '#374151' };
const btnContainer = { textAlign: 'center' as const, marginTop: '20px' };
const button = { backgroundColor: '#2563EB', borderRadius: '6px', color: '#fff', fontSize: '16px', textDecoration: 'none', padding: '12px 20px', display: 'block', textAlign: 'center' as const };
const hr = { borderColor: '#cccccc', margin: '20px 0' };
const footer = { color: '#8898aa', fontSize: '12px' };
