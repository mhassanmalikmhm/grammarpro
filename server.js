import express from "express";
import path from "path";
import grammarRouter from "./api/grammar.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(process.cwd())));

app.use("/api/grammar", grammarRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:3000`);
});