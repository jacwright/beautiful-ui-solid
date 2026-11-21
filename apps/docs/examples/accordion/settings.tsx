import { Accordion, Description, Disclosure, Field, Input, Label } from "beautiful-ui-solid";

export default function Settings() {
  return (
    <form>
      <Accordion name="site-settings">
        <Disclosure summary="General" open>
          <Field id="site-title">
            <Label>Site name</Label>
            <Input name="name" value="Spring launch" autocomplete="off" />
          </Field>
        </Disclosure>
        <Disclosure summary="Build">
          <Field id="build-script">
            <Label>Build command</Label>
            <Description>Runs before each deploy. Leave it empty to publish the files as they are.</Description>
            <Input name="build" value="npm run build" autocomplete="off" />
          </Field>
        </Disclosure>
        <Disclosure summary="Search engines">
          <Field id="site-description">
            <Label>Description</Label>
            <Input name="description" value="Plants delivered to your door every spring." autocomplete="off" />
          </Field>
        </Disclosure>
      </Accordion>
    </form>
  );
}
