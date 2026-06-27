import { ZipArchive } from "archiver";
import { PDFDocument } from "pdf-lib";

/**
 * Combine scanned JPEG pages into a single PDF (one image per page, sized to the
 * image). Used for "Dokument" output.
 */
export async function jpegsToPdf(pages: Buffer[]): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  for (const jpg of pages) {
    // pdf-lib's JpegEmbedder ignores a Uint8Array's byteOffset, so pass a
    // fresh offset-0 copy (Node pools small Buffers into a shared ArrayBuffer).
    const img = await pdf.embedJpg(new Uint8Array(jpg));
    const page = pdf.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  const bytes = await pdf.save();
  return Buffer.from(bytes);
}

/**
 * Pack scanned JPEG pages into a ZIP (lossless, original bytes). Used for
 * "Foto" output.
 */
export function jpegsToZip(pages: Buffer[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const zip = new ZipArchive({ zlib: { level: 6 } });
    zip.on("data", (c: Buffer) => chunks.push(c));
    zip.on("end", () => resolve(Buffer.concat(chunks)));
    zip.on("error", reject);
    pages.forEach((page, i) =>
      zip.append(page, { name: `scan-${String(i + 1).padStart(3, "0")}.jpg` }),
    );
    void zip.finalize();
  });
}
