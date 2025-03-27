import fs from "fs/promises";
import { Parser } from "./src/parser.js";
import Combinator from "./src/combinator.js";

async function main() {
  const parser = new Parser();
  const rf = parser.parse(await fs.readFile('../rf_processor/data.json', 'utf-8'));
  const combinator = new Combinator();
  combinator.combine(rf);
  await fs.writeFile('tree.json', JSON.stringify(rf, null, 2));
}
main();