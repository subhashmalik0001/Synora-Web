import * as React from 'react';
import { Html, Head, Preview, Body, Container, Text, Hr } from '@react-email/components';

interface SubscriptionCancelledEmailProps {
    userName: string;
    productName: string;
    endDate?: string;
}

export const SubscriptionCancelledEmail = ({ userName, productName, endDate }: SubscriptionCancelledEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Your subscription to {productName} has been cancelled</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Text style={heading}>Subscription Cancelled</Text>
                    <Text style={paragraph}>Hi {userName},</Text>
                    <Text style={paragraph}>
                        This email confirms that your subscription to <strong>{productName}</strong> has been cancelled.
                    </Text>
                    <Text style={paragraph}>
                        {endDate
                            ? `You will continue to have access until the end of your billing cycle on ${endDate}, after which your access will be removed.`
                            : `Your access has been revoked immediately.`}
                    </Text>
                    <Text style={paragraph}>
                        If you did not request this cancellation or would like to resubscribe, you can do so from your dashboard at any time. We'd love to have you back!
                    </Text>

                    <Hr style={hr} />
                    <Text style={footer}>
                        PayGate Platform
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default SubscriptionCancelledEmail;

const main = { backgroundColor: '#ffffff', fontFamily: 'sans-serif' };
const container = { margin: '0 auto', padding: '20px 0 48px', width: '580px' };
const heading = { fontSize: '24px', fontWeight: '700', color: '#ea580c' }; // orange
const paragraph = { fontSize: '16px', lineHeight: '26px', color: '#484848' };
const hr = { borderColor: '#cccccc', margin: '20px 0' };
const footer = { color: '#8898aa', fontSize: '12px' };
