import { App } from "cdktf";
import { CodeServerStack } from "./src/code-server";

const app = new App();
new CodeServerStack(app, "code-server-on-openstack");
app.synth();
