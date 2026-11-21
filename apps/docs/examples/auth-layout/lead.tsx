import { AuthLayout, Button, Heading, Link, Text } from "beautiful-ui-solid";

export default function Lead() {
  return (
    <AuthLayout
      footer={
        <Text>
          By signing in you agree to the{" "}
          <Link href="#terms" color="neutral">
            Terms
          </Link>{" "}
          and the{" "}
          <Link href="#privacy" color="neutral">
            Privacy Policy
          </Link>
          .
        </Text>
      }
    >
      <svg viewBox="0 0 32 32" role="img" aria-label="Acme">
        <rect width="32" height="32" rx="8" fill="#4f46e5" />
        <path d="M16 6.5c1.3 5.2 4.3 8.2 9.5 9.5-5.2 1.3-8.2 4.3-9.5 9.5-1.3-5.2-4.3-8.2-9.5-9.5 5.2-1.3 8.2-4.3 9.5-9.5Z" fill="#fff" />
      </svg>
      <Heading>Sign in to Acme</Heading>
      <Text tone="muted">One account for every Acme app.</Text>
      <Button href="#google">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" />
          <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
          <path fill="#fbbc05" d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84Z" />
          <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.96 10.96 0 0 0 12 1 11 11 0 0 0 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" />
        </svg>{" "}
        Sign in with Google
      </Button>
      <Button href="#microsoft">
        <svg viewBox="0 0 21 21" aria-hidden="true">
          <path fill="#f25022" d="M1 1h9v9H1z" />
          <path fill="#7fba00" d="M11 1h9v9h-9z" />
          <path fill="#00a4ef" d="M1 11h9v9H1z" />
          <path fill="#ffb900" d="M11 11h9v9h-9z" />
        </svg>{" "}
        Sign in with Microsoft
      </Button>
    </AuthLayout>
  );
}
