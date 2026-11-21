import type { EmbedDefinition, Upload } from "beautiful-ui-solid-editor";
import { Button, Input } from "beautiful-ui-solid";

/**
 * What the Editor's examples and its test harness share. The docs site has no server, so its
 * upload keeps the file in the browser, with a made-up progress, as a real upload's would look.
 */

export const fakeUpload: Upload = (file, progress) =>
  new Promise((resolve) => {
    let done = 0;
    const step = () => {
      done = Math.min(done + 0.2, 1);
      progress(done);
      if (done < 1) setTimeout(step, 150);
      else resolve({ src: URL.createObjectURL(file) });
    };
    step();
  });

/** A sign-up form block, as a site would embed it: its button's words are its one setting. */
function SignupForm(props: { props: { button?: string }; setProps: (next: { button?: string }) => void; selected: boolean }) {
  return (
    <beautiful-demo-row>
      <Input type="email" placeholder="you@example.com" aria-label="Email" disabled />
      <Button variant="primary" disabled>
        {props.props.button ?? "Subscribe"}
      </Button>
    </beautiful-demo-row>
  );
}

export const embeds: Record<string, EmbedDefinition<{ button?: string }>> = {
  signup: {
    label: "Sign-up form",
    description: "Embed the site's sign-up form.",
    keywords: ["newsletter", "subscribe", "email", "form"],
    defaults: { button: "Start my subscription" },
    component: SignupForm,
  },
};
