import fs from "fs/promises";
import { Parser } from "./src/parser.js";
import Combinator from "./src/combinator.js";
import { start } from "./src/server.js";

async function test() {
  const parser = new Parser();
  const rf = parser.parse(await fs.readFile('../rf_processor/data.json', 'utf-8'));
  const combinator = new Combinator();
  combinator.combine(rf);
  await fs.writeFile('tree.json', JSON.stringify(rf, null, 2));
}

function main() {
  start();
}

main();
// test();
