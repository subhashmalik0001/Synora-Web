import * as React from 'react';
import { Html, Head, Preview, Body, Container, Section, Text, Button, Hr } from '@react-email/components';

interface WelcomeEmailProps {
    userName: string;
    productName: string;
    creatorName: string;
}

export const WelcomeEmail = ({ userName, productName, creatorName }: WelcomeEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Welcome to {productName}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Text style={heading}>Welcome, {userName}!</Text>
                    <Text style={paragraph}>
                        Thanks for joining <strong>{productName}</strong> by {creatorName}.
                        We're thrilled to have you here. This gives you instant access to all our exclusive content and community.
                    </Text>

                    <Section style={btnContainer}>
                        <Button style={button} href="https://paygate.example.com/dashboard">
                            Go to your Dashboard
                        </Button>
                    </Section>

                    <Text style={paragraph}>
                        If you have any questions, feel free to reply to this email.
                    </Text>
                    <Hr style={hr} />
                    <Text style={footer}>
                        Fluxar Platform &bull; supporting creators worldwide
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default WelcomeEmail;

const main = {
    backgroundColor: '#ffffff',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    width: '580px',
};

const heading = {
    fontSize: '24px',
    lineHeight: '1.3',
    fontWeight: '700',
    color: '#484848',
};

const paragraph = {
    fontSize: '16px',
    lineHeight: '26px',
    color: '#484848',
};

const btnContainer = {
    textAlign: 'center' as const,
    marginTop: '20px',
    marginBottom: '20px',
};

const button = {
    backgroundColor: '#2563EB',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '16px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '12px 20px',
};

const hr = {
    borderColor: '#cccccc',
    margin: '20px 0',
};

const footer = {
    color: '#8898aa',
    fontSize: '12px',
};
