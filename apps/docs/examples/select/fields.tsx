import { Description, Field, Label, Select } from "beautiful-ui-solid";

export default function Fields() {
  return (
    <form>
      <Field id="site-plan">
        <Label>Plan</Label>
        <Description>You can change plans at any time.</Description>
        <Select name="plan" placeholder="Choose a plan" required>
          <option value="starter">Starter, $9 a month</option>
          <option value="pro">Pro, $29 a month</option>
          <option value="business">Business, $99 a month</option>
        </Select>
      </Field>
      <Field id="site-time-zone">
        <Label>Time zone</Label>
        <Select name="timeZone" value="America/Denver">
          <optgroup label="Americas">
            <option value="America/Los_Angeles">Pacific time, Los Angeles</option>
            <option value="America/Denver">Mountain time, Denver</option>
            <option value="America/Chicago">Central time, Chicago</option>
            <option value="America/New_York">Eastern time, New York</option>
          </optgroup>
          <optgroup label="Europe">
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
            <option value="Europe/Berlin">Berlin</option>
          </optgroup>
        </Select>
      </Field>
      <Field id="site-language">
        <Label>Language</Label>
        <Select name="language">
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="ja">日本語</option>
        </Select>
      </Field>
    </form>
  );
}
