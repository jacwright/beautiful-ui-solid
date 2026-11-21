import { Link, Text } from "beautiful-ui-solid";

export default function NewTab() {
  return (
    <Text>
      Point your domain at your site with a CNAME record.{" "}
      <Link href="https://www.cloudflare.com/learning/dns/dns-records/dns-cname-record/" target="_blank">
        What's a CNAME record?
      </Link>
    </Text>
  );
}
