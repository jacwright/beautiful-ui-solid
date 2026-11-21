import { Description, Field, Label, Range } from "beautiful-ui-solid";

export default function Fields() {
  return (
    <form>
      <Field id="new-version-share">
        <Label>Visitors who see the new version</Label>
        <Description>The rest see the live site until you promote it.</Description>
        <Range name="share" step={5} value={25} format={(v) => `${v}%`} />
      </Field>
      <Field id="image-quality">
        <Label>Image quality</Label>
        <Range name="quality" min={40} value={80} />
      </Field>
    </form>
  );
}
