import { Popover, PopoverButton, PopoverPanel } from "beautiful-ui-solid";

export default function Help() {
  return (
    <Popover id="cname-help">
      <beautiful-demo-row>
        <p>Custom domains need a CNAME record.</p>
        <PopoverButton variant="tertiary" color="accent">
          What's that?
        </PopoverButton>
      </beautiful-demo-row>
      <PopoverPanel anchor="bottom">
        <p>A CNAME record tells the internet that your domain's address is your site on Beautiful.</p>
        <p>
          Add one where you bought the domain. <a href="#dns-guide">Read the guide</a>
        </p>
      </PopoverPanel>
    </Popover>
  );
}
