import puppeteer from "puppeteer";
import { writeFile } from "fs/promises";

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("http://localhost:8080");

  const root = await page.$('#root');
  const svg = await page.evaluate((root) => root.innerHTML, root);

  await writeFile('./architecture/information-architecture.excalidraw.svg', svg);
  await browser.close();
})();
