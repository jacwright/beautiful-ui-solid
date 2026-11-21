import "beautiful-ui-solid/styles.css";
import "beautiful-ui-solid/web.css";
import "./docs.css";
import { startFocusRing } from "beautiful-ui-solid";
import { render } from "@solidjs/web";
import App from "./App.tsx";

render(() => <App />, document.getElementById("app")!);

// The whole site uses the moving focus ring, so every page shows it.
startFocusRing();
