import * as React from 'react';
import { Html, Head, Preview, Body, Container, Section, Text, Button, Hr } from '@react-email/components';

interface PaymentFailedEmailProps {
    userName: string;
    productName: string;
    retryUrl: string;
    amount: string;
}

export const PaymentFailedEmail = ({ userName, productName, retryUrl, amount }: PaymentFailedEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Action Required: Payment Failed for {productName}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Text style={heading}>Action Required: Payment Failed</Text>
                    <Text style={paragraph}>Hi {userName},</Text>
                    <Text style={paragraph}>
                        We attempted to process your payment of <strong>{amount}</strong> for renewing your subscription to <strong>{productName}</strong> but the charge failed.
                    </Text>
                    <Text style={paragraph}>
                        This usually happens if your card has expired, has insufficient funds, or the bank blocked the transaction.
                        To keep your access uninterrupted, please update your payment method.
                    </Text>

                    <Section style={btnContainer}>
                        <Button style={button} href={retryUrl}>
                            Update Payment Method
                        </Button>
                    </Section>

                    <Text style={paragraph}>
                        We will attempt to charge the card again automatically in a few days. If the payment continues to fail, your subscription may be cancelled.
                    </Text>

                    <Hr style={hr} />
                    <Text style={footer}>
                        PayGate Platform &bull; Billing Department
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default PaymentFailedEmail;

const main = { backgroundColor: '#ffffff', fontFamily: 'sans-serif' };
const container = { margin: '0 auto', padding: '20px 0 48px', width: '580px' };
const heading = { fontSize: '24px', fontWeight: '700', color: '#dc2626' };
const paragraph = { fontSize: '16px', lineHeight: '26px', color: '#484848' };
const btnContainer = { textAlign: 'center' as const, marginTop: '20px', marginBottom: '20px' };
const button = { backgroundColor: '#dc2626', borderRadius: '6px', color: '#fff', fontSize: '16px', textDecoration: 'none', padding: '12px 20px', display: 'block', textAlign: 'center' as const };
const hr = { borderColor: '#cccccc', margin: '20px 0' };
const footer = { color: '#8898aa', fontSize: '12px' };
