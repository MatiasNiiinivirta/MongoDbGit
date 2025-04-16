import app from "./apicalls.js";

import cors from "cors";

app.use(cors());

app.listen(3000, () => {
  console.log("Listening on port 3000 ..");
});
