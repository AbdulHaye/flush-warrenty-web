const fs = require("fs");
const zlib = require("zlib");
const { PDFDocument, StandardFonts, rgb, PDFArray } = require("pdf-lib");

const RIGHT_MARGIN = 540;
const LINE_HEIGHT = 11.5;
const SIZE = 10;

// Tightened from the previous 10pt gap - the field's own box already has a
// bit of unavoidable slack below its text (shrink-to-fit can't always use
// 100% of the box height), so a smaller fixed gap keeps things closer
// without risking overlap.
const FIELD_TOP_GAP = 6;
const FIELD_HEIGHT = 76.2;
const POST_FIELD_GAP = 6;

const makeWrapRuns = (regularFont, boldFont) => (runs, firstLineX, continuationX) => {
  const words = [];
  for (const run of runs) {
    const font = run.bold ? boldFont : regularFont;
    const size = run.size || SIZE;
    for (const w of run.text.split(" ")) {
      if (w === "") continue;
      words.push({ text: w, font, size });
    }
  }
  const lines = [];
  let current = [];
  let currentX = firstLineX;
  for (const word of words) {
    const spaceWidth = current.length === 0 ? 0 : word.font.widthOfTextAtSize(" ", word.size);
    const wordWidth = word.font.widthOfTextAtSize(word.text, word.size);
    const projectedEnd = currentX + spaceWidth + wordWidth;
    if (current.length > 0 && projectedEnd > RIGHT_MARGIN) {
      lines.push({ words: current });
      current = [];
      currentX = continuationX;
    }
    if (current.length > 0) currentX += spaceWidth;
    current.push({ ...word, x: currentX });
    currentX += wordWidth;
  }
  if (current.length > 0) lines.push({ words: current });
  return lines;
};

const drawBlocks = (page, blocks, startY, wrapRuns) => {
  let y = startY;
  let firstBlock = true;
  for (const block of blocks) {
    if (!firstBlock) y -= block.gapBefore || 0;
    firstBlock = false;
    const lines = wrapRuns(block.runs, block.firstLineX, block.continuationX);
    for (const line of lines) {
      for (const word of line.words) {
        page.drawText(word.text, { x: word.x, y, size: word.size, font: word.font });
      }
      y -= LINE_HEIGHT;
    }
  }
  return y;
};

(async () => {
  const bytes = fs.readFileSync("./public/Flush_warranty.pdf.bak-before-page4-fix");
  const doc = await PDFDocument.load(bytes);
  const page4 = doc.getPages()[3];
  const page5Old = doc.getPages()[4]; // "b./c. of 4.1" + "4.2 onward", pre-insertion

  const regularFont = await doc.embedFont(StandardFonts.TimesRoman);
  const boldFont = await doc.embedFont(StandardFonts.TimesRomanBold);
  const wrapRuns = makeWrapRuns(regularFont, boldFont);

  // ---- PAGE 4 ----

  // 1. Fix "3.1 On or around..." (still 8.2pt) - mask and redraw at 10pt,
  // word-wrapped, right after the "3. PAYMENT" heading (y=438). This wraps
  // to 4 lines at 10pt (vs. 3 at the old 8.2pt), so the mask has to cover a
  // taller area than the original text occupied - including the old
  // "a. Price Adjustments and Renewals" position (y=381.5), since the new
  // paragraph's last line lands close to (or below) it.
  page4.drawRectangle({ x: 62, y: 365, width: 500, height: 57, color: rgb(1, 1, 1) });
  const PAGE4_HEADER_BLOCKS = [
    {
      firstLineX: 72,
      continuationX: 72,
      gapBefore: 0,
      runs: [
        {
          text: '3.1 On or around the first business day of approval, the Monthly Contract Fee amount listed on the Contract Summary Page will be charged to Your credit card. In the event there is any problem processing the monthly payment, You will be contacted by FLUSH. You will have 30 (thirty) business days to pay the unpaid Contract Fee to avoid cancellation. Fees allocated towards service:',
          bold: false,
        },
      ],
    },
  ];
  const paragraphEndY = drawBlocks(page4, PAGE4_HEADER_BLOCKS, 414, wrapRuns);

  // 2. Fix "a. Price Adjustments and Renewals" (still 8.4pt) - redraw at
  // 10pt, positioned dynamically below wherever the 3.1 paragraph actually
  // ended (not a hardcoded y), so it can never collide with it regardless
  // of how many lines that paragraph wraps to.
  const HEADING_GAP = 8;
  const headingY = paragraphEndY - HEADING_GAP;
  page4.drawText("a. Price Adjustments and Renewals", { x: 106, y: headingY, size: SIZE, font: regularFont });
  console.log("3.1 paragraph ends at y =", paragraphEndY.toFixed(1), "| heading at y =", headingY.toFixed(1));

  // 3. Reposition the price_adjustments_and_renewals field right below the
  // heading (also dynamic), tightened gap.
  const FIELD_TOP = headingY - FIELD_TOP_GAP;
  const FIELD_BOTTOM = FIELD_TOP - FIELD_HEIGHT;
  const form = doc.getForm();
  const field = form.getTextField("price_adjustments_and_renewals");
  const widget = field.acroField.getWidgets()[0];
  const oldRect = widget.getRectangle();
  widget.setRectangle({ x: oldRect.x, y: FIELD_BOTTOM, width: oldRect.width, height: FIELD_HEIGHT });
  console.log("Field rect: y", FIELD_BOTTOM.toFixed(1), "to", FIELD_TOP.toFixed(1));

  // 4. Mask everything below the field and redraw "Month-to-Month..."
  // through "b. Cancellation of Services" at 10pt, with breathing room
  // around the heading-like lines.
  page4.drawRectangle({
    x: 62,
    y: 10,
    width: 500,
    height: FIELD_BOTTOM - 10,
    color: rgb(1, 1, 1),
  });
  const PAGE4_BLOCKS = [
    {
      firstLineX: 106,
      continuationX: 143,
      gapBefore: 6,
      runs: [
        { text: "Month-to-Month selections: ", bold: true },
        {
          text: 'Any Coverage identified as "Month-to-Month" will automatically renew for successive one-month terms unless cancelled in accordance with this Agreement.',
          bold: false,
        },
      ],
    },
    {
      firstLineX: 114,
      continuationX: 143,
      gapBefore: 4,
      runs: [
        {
          text: "• Upon acceptance, any new rates and terms will apply during the renewal term and thereafter.",
          bold: false,
        },
      ],
    },
    {
      firstLineX: 106,
      continuationX: 143,
      gapBefore: 8,
      runs: [{ text: "36 Month selection:", bold: true }],
    },
    {
      firstLineX: 114,
      continuationX: 143,
      gapBefore: 4,
      runs: [
        {
          text: "• The Coverage is for thirty-six (36) months from the Effective Date. At the end of the 36-month term, FLUSH may, at its discretion, issue a new Agreement with updated pricing and terms. Coverage will not continue beyond the 36-month term unless You accept and sign the new Agreement provided by FLUSH.",
          bold: false,
        },
      ],
    },
    {
      firstLineX: 114,
      continuationX: 143,
      gapBefore: 0,
      runs: [
        {
          text: "• Upon acceptance, any new rates and terms will apply during the renewal term and thereafter, alongside these terms and conditions.",
          bold: false,
        },
      ],
    },
    {
      firstLineX: 106,
      continuationX: 143,
      gapBefore: 10,
      runs: [{ text: "b. Cancellation of Services", bold: false }],
    },
    {
      firstLineX: 114,
      continuationX: 143,
      gapBefore: 6,
      runs: [
        {
          text: "• If You wish to cancel the monthly contract, You must provide written notice.",
          bold: false,
        },
      ],
    },
    {
      firstLineX: 114,
      continuationX: 143,
      gapBefore: 0,
      runs: [
        { text: "• Month to month selection: ", bold: true },
        {
          text: "Cancellation will stop the automatic renewal of services at the end of the current contract period.",
          bold: false,
        },
      ],
    },
    {
      firstLineX: 114,
      continuationX: 143,
      gapBefore: 0,
      runs: [
        { text: "• 36 months selection: ", bold: true },
        {
          text: "Cancellation will stop the services at the end of the month in which the last monthly payment was received.",
          bold: false,
        },
      ],
    },
    {
      firstLineX: 114,
      continuationX: 143,
      gapBefore: 0,
      runs: [
        {
          text: "• If services have been performed during the contract period, You are still responsible for paying the applicable amounts for those services.",
          bold: false,
        },
      ],
    },
  ];
  const page4EndY = drawBlocks(page4, PAGE4_BLOCKS, FIELD_BOTTOM - POST_FIELD_GAP, wrapRuns);
  console.log("Page 4 content ends at y =", page4EndY.toFixed(1));

  // ---- PAGE 5 (was page 4.1's "b./c." + "4.2 onward" page): merge
  // "4. DESCRIPTION OF COVERAGE" + 4.1(a,b,c) onto the TOP of this same
  // page, instead of giving that short section an entire page to itself
  // (which left most of that page blank). "4.2 NOT COVERED" through "5.8"
  // shift down to make room; "5.9" and "5.10" no longer fit, so they move
  // to a new continuation page - a normal, small trailing overflow instead
  // of a mostly-empty page.

  // 1. Blank the old "b."/"c." text (already-established exact-line technique).
  const streamText = fs.readFileSync("./page4_streamB_clean_page5.txt", "utf8").split("\n");
  const LINES_TO_BLANK_BC = [26, 38, 50, 104, 116].map((n) => streamText[n - 1]);

  const contents = page5Old.node.Contents();
  if (contents instanceof PDFArray) throw new Error("Expected single content stream on old page 5");
  const raw = contents.getContents();
  let text = zlib.inflateSync(Buffer.from(raw)).toString("latin1");

  let blanked = 0;
  for (const line of LINES_TO_BLANK_BC) {
    if (!text.includes(line)) throw new Error("Could not find line to blank: " + line.slice(0, 60));
    text = text.replace(line, "[]TJ");
    blanked++;
  }

  console.log("Blanked", blanked, "text runs on page 5 (b./c.)");

  // 4. Draw "4. DESCRIPTION OF COVERAGE" + 4.1(a,b,c) at the top of this page.
  const PAGE5_TOP_BLOCKS = [
    {
      firstLineX: 72,
      continuationX: 72,
      gapBefore: 0,
      runs: [{ text: "4. DESCRIPTION OF COVERAGE", bold: true, size: 10.5 }],
    },
    {
      firstLineX: 72,
      continuationX: 72,
      gapBefore: 10,
      runs: [
        {
          text: "4.1 COVERED - Subject to the payment of the applicable Service Fees and subject to the Contract Maximum Amount, this Agreement covers the following:",
          bold: false,
        },
      ],
    },
    {
      firstLineX: 106,
      continuationX: 143,
      gapBefore: 8,
      runs: [
        {
          text: "a. At the Service Provider's discretion, repair, replace, or rejuvenate the Septic System components that cause a System Malfunction.",
          bold: false,
        },
      ],
    },
    {
      firstLineX: 106,
      continuationX: 143,
      gapBefore: 8,
      runs: [
        {
          text: "b. We will arrange for the septic tank to be pumped and serviced by ANDERSON BROS on a schedule determined by Us. We will notify You in advance when ANDERSON BROS is scheduled to perform the work.",
          bold: false,
        },
      ],
    },
    {
      firstLineX: 106,
      continuationX: 143,
      gapBefore: 8,
      runs: [
        {
          text: "c. If You wish to have a cleaning or service done sooner than the scheduled time, You will be responsible for the additional cost (if any).",
          bold: false,
        },
      ],
    },
  ];
  const page5TopEndY = drawBlocks(page5Old, PAGE5_TOP_BLOCKS, 720, wrapRuns);
  console.log("Merged 4. DESCRIPTION section on page 5 ends at y =", page5TopEndY.toFixed(1));

  const SECTION_GAP = 14;
  const NEW_4_2_START = page5TopEndY - SECTION_GAP;
  const ORIGINAL_4_2_START = 656.14;
  const OFFSET_A = NEW_4_2_START - ORIGINAL_4_2_START;

  // Everything from "4.2 NOT COVERED" down has to move up to make room for
  // the merged-in "4. DESCRIPTION OF COVERAGE" section - but a flat shift
  // pushes "5.9"/"5.10" off the bottom of the page, which is what forced
  // them onto a near-empty continuation page before.
  //
  // Instead, shift progressively: each "5.x" paragraph moves up a little
  // further than the one above it, closing the original layout's generous
  // ~24pt inter-paragraph gaps to ~19pt and the 42.5pt gap before
  // "5. LODGING" to 20pt. That recovers ~67pt - enough for 5.9/5.10 to stay
  // on this page - while every gap stays well above the ~11.5pt line height,
  // so nothing ends up looking cramped or overlapping.
  const LODGING_GAP_RECOVERED = 22.5; // 42.5pt gap before "5. LODGING" -> 20pt
  const PER_PARAGRAPH_GAP_RECOVERED = 5; // each ~24pt gap between 5.x items -> ~19pt

  // Y boundaries between the original blocks (original, unshifted coords),
  // paired with how many inter-paragraph gaps have been closed above them.
  const BLOCK_BOUNDARIES = [
    { above: 545, gapsClosed: null }, // "4.2 NOT COVERED" block: OFFSET_A only
    { above: 450, gapsClosed: 0 },    // "5. LODGING" + "5.1"
    { above: 405, gapsClosed: 1 },    // "5.2"
    { above: 360, gapsClosed: 2 },    // "5.3"
    { above: 290, gapsClosed: 3 },    // "5.4"
    { above: 260, gapsClosed: 4 },    // "5.5"
    { above: 220, gapsClosed: 5 },    // "5.6"
    { above: 172, gapsClosed: 6 },    // "5.7"
    { above: 125, gapsClosed: 7 },    // "5.8"
    { above: 90, gapsClosed: 8 },     // "5.9"
    { above: 60, gapsClosed: 9 },     // "5.10"
  ];

  const shiftFor = (y) => {
    if (y > 656.2) return null; // above "4.2 NOT COVERED" - untouched
    for (const b of BLOCK_BOUNDARIES) {
      if (y > b.above) {
        return b.gapsClosed === null
          ? OFFSET_A
          : OFFSET_A + LODGING_GAP_RECOVERED + b.gapsClosed * PER_PARAGRAPH_GAP_RECOVERED;
      }
    }
    return null; // below "5.10" - only trailing blank markers, leave alone
  };

  // "a. Lawn maintenance..." / "Engineering plans..." (items a/b of the 4.2
  // list) sit inside their own "cm" coordinate transform - a separate edit
  // layer, like streamB was on page 4 - rather than using plain absolute
  // "Tm" coordinates. Their own Tm values inside that block are tiny local
  // offsets (e.g. "0 15.876 Tm"), so shifting only "Tm" operators misses
  // them entirely; the "cm" line itself must shift too.
  let shifted = 0;
  let minShiftedY = Infinity;
  text = text.replace(/1 0 0 1 ([\d.\-]+) ([\d.\-]+) (Tm|cm)/g, (match, x, y, op) => {
    const yNum = parseFloat(y);
    const shift = shiftFor(yNum);
    if (shift === null) return match;
    shifted++;
    const newY = yNum + shift;
    minShiftedY = Math.min(minShiftedY, newY);
    return `1 0 0 1 ${x} ${newY.toFixed(3)} ${op}`;
  });
  console.log("Shifted", shifted, "Tm/cm operators; lowest line now at y =", minShiftedY.toFixed(1));
  if (minShiftedY < 25) {
    throw new Error("Shifted content runs too close to the bottom margin (y=" + minShiftedY.toFixed(1) + ")");
  }
  contents.contents = zlib.deflateSync(Buffer.from(text, "latin1"));

  const outBytes = await doc.save();
  fs.writeFileSync("./public/Flush_warranty.pdf", outBytes);
  console.log("Wrote public/Flush_warranty.pdf, page count:", doc.getPageCount());
})();
