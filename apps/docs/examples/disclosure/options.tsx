import { Description, Disclosure, Field, Input, Label } from "beautiful-ui-solid";

export default function Options() {
  return (
    <form>
      <Field id="site-name">
        <Label>Site name</Label>
        <Input name="name" value="Spring launch" autocomplete="off" />
      </Field>
      <Disclosure summary="Build settings">
        <Field id="build-command">
          <Label>Build command</Label>
          <Description>Runs before each deploy. Leave it empty to publish the files as they are.</Description>
          <Input name="build" value="npm run build" autocomplete="off" />
        </Field>
        <Field id="output-folder">
          <Label>Output folder</Label>
          <Input name="output" value="dist" autocomplete="off" />
        </Field>
      </Disclosure>
    </form>
  );
}
