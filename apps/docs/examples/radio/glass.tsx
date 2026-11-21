import {
  Button,
  Description,
  Dialog,
  DialogActions,
  DialogBody,
  DialogTitle,
  Field,
  Label,
  Legend,
  Radio,
  RadioGroup,
} from "beautiful-ui-solid";

export default function Glass() {
  return (
    <>
      <beautiful-demo-stage>
        <p class="demo-stage-words">Spring launch</p>
        <Button commandfor="share-site" command="show-modal">Share</Button>
      </beautiful-demo-stage>
      <Dialog id="share-site">
        <form method="dialog">
          <DialogTitle>Share Spring launch</DialogTitle>
          <DialogBody>
            <RadioGroup id="share-site-access" name="access" defaultValue="anyone">
              <Legend>Who can see it</Legend>
              <Field id="share-site-anyone">
                <Radio value="anyone" />
                <Label>Anyone with the link</Label>
                <Description>Search engines don't list it until you publish.</Description>
              </Field>
              <Field id="share-site-team">
                <Radio value="team" />
                <Label>Only the team</Label>
                <Description>People sign in with their Beautiful account to see it.</Description>
              </Field>
              <Field id="share-site-password">
                <Radio value="password" />
                <Label>Anyone with the password</Label>
              </Field>
            </RadioGroup>
          </DialogBody>
          <DialogActions>
            <Button commandfor="share-site" command="close">Cancel</Button>
            <Button value="share" variant="primary">Save</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
