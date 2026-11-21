import { AuthLayout, Button, ErrorMessage, Field, Heading, Input, Label, Link, Text } from "beautiful-ui-solid";

export default function Code() {
  return (
    <AuthLayout>
      <svg viewBox="0 0 32 32" role="img" aria-label="Acme">
        <rect width="32" height="32" rx="8" fill="#4f46e5" />
        <path d="M16 6.5c1.3 5.2 4.3 8.2 9.5 9.5-5.2 1.3-8.2 4.3-9.5 9.5-1.3-5.2-4.3-8.2-9.5-9.5 5.2-1.3 8.2-4.3 9.5-9.5Z" fill="#fff" />
      </svg>
      <Heading>Check your email</Heading>
      <Text tone="muted">
        We sent a 6-digit code to <strong>jo@example.com</strong>. It works for 10 minutes.
      </Text>
      <form>
        <Field id="sign-in-code">
          <Label>Code</Label>
          <Input name="code" value="482 913" inputmode="numeric" autocomplete="one-time-code" />
          <ErrorMessage>That code has expired. Send a new one.</ErrorMessage>
        </Field>
        <Button type="submit" variant="primary" color="accent">
          Continue
        </Button>
      </form>
      <Text size="sm" tone="muted">
        Didn't get it? <Link href="#resend">Send a new code</Link>
      </Text>
    </AuthLayout>
  );
}
