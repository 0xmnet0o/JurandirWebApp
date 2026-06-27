import "dotenv/config";
import { createApp } from "./app.js";
import { getEnv } from "./config/env.js";

const app = createApp();
const port = getEnv().PORT;
app.listen(port, () => {
  console.log(`PedeAí API on http://localhost:${port}`);
});
