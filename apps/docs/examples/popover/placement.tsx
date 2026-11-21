import { Popover, PopoverButton, PopoverPanel } from "beautiful-ui-solid";

export default function Placement() {
  return (
    <beautiful-demo-row>
      <Popover id="place-bottom">
        <PopoverButton>Below</PopoverButton>
        <PopoverPanel>
          <p>Below its button, lined up with its left edge. The default.</p>
        </PopoverPanel>
      </Popover>
      <Popover id="place-top">
        <PopoverButton>Above</PopoverButton>
        <PopoverPanel anchor="top">
          <p>Centered above its button.</p>
        </PopoverPanel>
      </Popover>
      <Popover id="place-right">
        <PopoverButton>Beside</PopoverButton>
        <PopoverPanel anchor="right start">
          <p>To the right, lined up with its top edge.</p>
        </PopoverPanel>
      </Popover>
      <Popover id="place-end">
        <PopoverButton>Below, at the end</PopoverButton>
        <PopoverPanel anchor="bottom end">
          <p>Below, lined up with its right edge.</p>
        </PopoverPanel>
      </Popover>
    </beautiful-demo-row>
  );
}
