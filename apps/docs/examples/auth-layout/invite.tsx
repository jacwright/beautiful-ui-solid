import { AuthLayout, Button, Heading, Link, Text } from "beautiful-ui-solid";

export default function Invite() {
  return (
    <AuthLayout>
      <svg viewBox="0 0 32 32" role="img" aria-label="Acme">
        <rect width="32" height="32" rx="8" fill="#4f46e5" />
        <path d="M16 6.5c1.3 5.2 4.3 8.2 9.5 9.5-5.2 1.3-8.2 4.3-9.5 9.5-1.3-5.2-4.3-8.2-9.5-9.5 5.2-1.3 8.2-4.3 9.5-9.5Z" fill="#fff" />
      </svg>
      <Heading>Join Fern &amp; Co.</Heading>
      <Text tone="muted">
        Sam Rivera invited you to the team as an editor. You can edit its sites and see its numbers.
      </Text>
      <Button variant="primary" color="accent">
        Join the team
      </Button>
      <Button>Not now</Button>
      <Text size="sm" tone="muted">
        Signed in as jo@example.com. <Link href="#switch">Use another account</Link>
      </Text>
    </AuthLayout>
  );
}
