import { AuthLayout, Button, Heading, Text } from "beautiful-ui-solid";

export default function Expired() {
  return (
    <AuthLayout>
      <svg viewBox="0 0 32 32" role="img" aria-label="Acme">
        <rect width="32" height="32" rx="8" fill="#4f46e5" />
        <path d="M16 6.5c1.3 5.2 4.3 8.2 9.5 9.5-5.2 1.3-8.2 4.3-9.5 9.5-1.3-5.2-4.3-8.2-9.5-9.5 5.2-1.3 8.2-4.3 9.5-9.5Z" fill="#fff" />
      </svg>
      <Heading>This link has expired</Heading>
      <Text tone="muted">Invite links work once, for 7 days. Ask Sam Rivera to send you a new one.</Text>
      <Button href="#sign-in">Go to your account</Button>
    </AuthLayout>
  );
}
