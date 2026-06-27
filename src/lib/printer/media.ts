// Human-readable labels for common PWG self-describing media keywords.
// Unknown keywords fall through to a lightly prettified form.
const MEDIA_LABELS: Record<string, string> = {
  "iso_a3_297x420mm": "A3",
  "iso_a4_210x297mm": "A4",
  "iso_a5_148x210mm": "A5",
  "iso_a6_105x148mm": "A6",
  "jis_b5_182x257mm": "B5 (JIS)",
  "na_letter_8.5x11in": "Letter",
  "na_legal_8.5x14in": "Legal",
  "na_executive_7.25x10.5in": "Executive",
  "om_photo-10x15_100x150mm": "Foto 10×15",
  "na_index-4x6_4x6in": "Foto 4×6",
};

export function mediaLabel(keyword: string): string {
  if (MEDIA_LABELS[keyword]) return MEDIA_LABELS[keyword];
  // e.g. "iso_a4_210x297mm" -> "a4 210x297mm"
  const stripped = keyword.replace(/^[a-z]+_/, "").replace(/_/g, " ");
  return stripped || keyword;
}
