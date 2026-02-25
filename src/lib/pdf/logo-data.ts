/**
 * Logo data URIs from public/images/. Prefers SVG (converted to PNG for PDF);
 * falls back to PNG if no SVG. Used by PDF generation.
 */

import fs from "fs";
import path from "path";
import sharp from "sharp";

const IMAGES_DIR = path.join(process.cwd(), "public", "images");

const MAIN_SVG = "Untapped Channel Main Logo Transparent bg.svg";
const MAIN_PNG = "Untapped Channel Main Logo.png";
const SYMBOL_SVG = "Untapped Channel Logo Symbol Transparent bg.svg";
const SYMBOL_PNG = "Untapped Channel Logo Symbol.png";

function loadPngDataUri(filename: string): string | undefined {
  try {
    const filePath = path.join(IMAGES_DIR, filename);
    if (fs.existsSync(filePath)) {
      const buf = fs.readFileSync(filePath);
      return `data:image/png;base64,${buf.toString("base64")}`;
    }
  } catch {
    // ignore
  }
  return undefined;
}

async function loadSvgAsPngDataUri(filename: string): Promise<string | undefined> {
  try {
    const filePath = path.join(IMAGES_DIR, filename);
    if (!fs.existsSync(filePath)) return undefined;
    const buf = await sharp(filePath)
      .png()
      .toBuffer();
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return undefined;
  }
}

let _logoMain: string | undefined;
let _logoSymbol: string | undefined;

async function initLogos(): Promise<void> {
  _logoMain = await loadSvgAsPngDataUri(MAIN_SVG) ?? loadPngDataUri(MAIN_PNG);
  _logoSymbol = await loadSvgAsPngDataUri(SYMBOL_SVG) ?? loadPngDataUri(SYMBOL_PNG);
}

const logosPromise = initLogos();

/** Full logo for cover and last page. From SVG or PNG in public/images/. */
export function getLogoMain(): string | undefined {
  return _logoMain;
}

/** Small icon for top-right on every page. From SVG or PNG in public/images/. */
export function getLogoSymbol(): string | undefined {
  return _logoSymbol;
}

/** Call before building PDF so logos are available from getLogoMain/getLogoSymbol. */
export async function ensureLogosLoaded(): Promise<void> {
  await logosPromise;
}
