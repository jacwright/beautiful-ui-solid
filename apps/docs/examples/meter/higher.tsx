import { Description, Field, Label, Meter } from "beautiful-ui-solid";

export default function Higher() {
  return (
    <>
      <Field id="page-speed">
        <Label>Page speed</Label>
        <Meter value={72} max={100} low={50} high={90} optimum={100} valueText="72 out of 100" />
        <Description>The images on your homepage slow it down. Smaller ones would bring it over 90.</Description>
      </Field>
      <Field id="accessibility-score">
        <Label>Accessibility</Label>
        <Meter value={96} max={100} low={50} high={90} optimum={100} valueText="96 out of 100" />
      </Field>
    </>
  );
}
