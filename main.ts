import { App } from "cdktf";
import { UbuntuDesktopStack } from "./src/ubuntu-desktop";

const app = new App();
new UbuntuDesktopStack(app, "ubuntu-desktop-on-openstack");
app.synth();
