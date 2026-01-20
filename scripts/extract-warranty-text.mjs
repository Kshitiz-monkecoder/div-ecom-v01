import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

const pdfPath =
  process.argv[2] ||
  path.join(process.cwd(), "assets", "Jaibir Singh Payal ji warranty doc-1.pdf");

const dataBuffer = fs.readFileSync(pdfPath);
const parser = new PDFParse(new Uint8Array(dataBuffer));
await parser.load();
const extracted = await parser.getText();

// Print plain extracted text (best-effort; preserves wording, not layout)
process.stdout.write(extracted.text);

