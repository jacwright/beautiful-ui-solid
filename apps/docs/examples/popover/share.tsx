import { Button, Popover, PopoverButton, PopoverPanel, Text } from "beautiful-ui-solid";

export default function Share() {
  return (
    <Popover id="share">
      <PopoverButton>Share</PopoverButton>
      <PopoverPanel>
        <p>
          <strong>Anyone with the link can see Spring launch.</strong>
        </p>
        <Text tone="muted">It isn't listed anywhere, and search engines don't index it.</Text>
        <footer>
          <Button commandfor="share" command="hide-popover" variant="tertiary">
            Done
          </Button>
          <Button variant="primary" color="accent">
            Copy link
          </Button>
        </footer>
      </PopoverPanel>
    </Popover>
  );
}
