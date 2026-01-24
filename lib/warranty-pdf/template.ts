export type WarrantyPdfInput = {
  documentNo: string;
  systemSizeKwp: string;
  customerName: string;
  customerNumber: string;
  customerAddress: string;
  pinCode: string;
  installationDate: string;
  invoiceNo: string;

  moduleType: string;
  moduleSerialNumbers: string[];

  inverterWarrantyYears: number;
  inverterModel: string;
  inverterSerialNumber: string;
};

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function highlight(value: string): string {
  return `<span class="hl">${escapeHtml(value)}</span>`;
}

function normalizeLines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export function renderWarrantyHtml(
  input: WarrantyPdfInput,
  assets: { logoDataUrl: string; signDataUrl: string }
): string {
  const moduleSerials = input.moduleSerialNumbers
    .map((s) => s.trim())
    .filter(Boolean);

  const moduleSerialListHtml =
    moduleSerials.length > 0
      ? `<ol class="serials">${moduleSerials
          .map((s) => `<li>${highlight(s)}</li>`)
          .join("")}</ol>`
      : `<div class="muted">—</div>`;

  // Static text copied from `assets/warranty-template.txt` and normalized to proper typography.
  const introLines = normalizeLines(
    [
      "LIMITED WARRANTY CERTIFICATE FOR SOLAR POWER GENERATING (SPG)",
      "SYSTEMS INSTALLED BY DIVY POWER SOLAR SYSTEMS LIMITED",
      "THIS LIMITED WARRANTY CERTIFICATE (the “Warranty”) is valid for the Solar Power Generating Systems",
      "(the “SPG System”) installed and commissioned on or after May, 08 2025 and shall continue to remain",
      "valid unless modified in accordance with the terms and conditions contained herein.",
      "M/s DIVY Power Pvt. Ltd., a company duly incorporated under the Indian Companies Act, 1956 and",
      "having its Office at 53, Ramte Ram Road, Ghaziabad, Uttar Pradesh 201001, INDIA (hereinafter referred",
      "to as “DIVY Power”) provides the following limited warranties to the Buyers (as defined hereinafter),",
      "subject to term and exclusions contained herein.",
    ].join("\n")
  );

  const warrantyBodyLines = normalizeLines(
    [
      "•\tWARRANTED SPG SYSTEM",
      "•\tThis warranty is available only to a customer within whose premises an installation of the SPG",
      "system has been done either by DIVY Power or through authorized Dealer/ Distributor of DIVY",
      "Power, and where such customer has installed such SPG Systems for its own use in India (the",
      "Buyer).",
      "•\tWARRANTY COMMENCEMENT DATE",
      "2.2 The warranty commences from the earlier of:",
      "a)\tDate of installation of the SPG Systems is given above: or",
      "b)\tSix months after the date of dispatch of the material for the said SPG Systems from the factory",
      "premises.",
      "(Either of the above “Warranty Commencement Date”).",
      "2.2 A Buyer making a claim under this Warranty shall have to establish the delivery installation date",
      "by providing the original invoice or sale receipt of the said SPG System.",
      "3.\tWARRANTY DESCRIPTIONS AND WARRANTY PERIOD",
      "3.1\tSubject to terms, conditions and limitations contained herein. DIVY Power provides the BUYER",
      "that the parts of SPG system are free from defects in workmanship and/or materials for the",
      "following period from the Warranty Commencement Date:",
      "Modules*: Material manufacturing Warranty 5 years, Performance Warranty 90% at the end of 10",
      "years and 80% at the end of 25years provided by its respective manufacturer.",
      "*All terms & conditions as per LIMITED WARRANTY CERTIFICATES FOR {MODULE_TYPE}",
      "{MODULE_SERIALS}",
      "As per invoice shared.",
      "Inverter: {INVERTER_YEARS} years",
      "Inverter parts carries a warranty of {INVERTER_YEARS} years against, and manufacture defects duly provided by",
      "respective manufacturer {INVERTER_MODEL} {INVERTER_SERIAL}",
      "INSTALLATION WARRANTY",
      "4.1\tSubject to terms, conditions and limitations contained herein. DIVY Power warrants to the Buyer",
      "that commencing on the Warranty Commencement Date (i) the SPG System will be installed in",
      "accordance with all applicable and relevant Indian standards and (ii) designated representatives of",
      "DIVY Power installing the SPG System shall be experienced contractors.",
      "4.2\tDIVY Power is relying on the Buyer’s representation and warranty that the",
      "premises are suitable for the installation of the SPG System and the Buyer indemnifies DIVY Power",
      "for any loss, damage, costs and expenses suffered or incurred by DIVY Power as a result of",
      "this representation and warranty being incorrect.",
      "4.3\tPeriod:",
      "a)\tThe BUYER must notify DIVY Power of any wrong or defective installation of the SPG system by",
      "DIVY Power within Two (2) working days of the Warranty Commencement Period or the Date of",
      "Installation and Commissioning whichever is earlier.",
      "b)\tAt the expiry of such two (2) working days' period as mentioned above, DIVY Power will in no",
      "way be liable for any damage or injury alleged to have been caused in connection with the wrong or",
      "defective installation of the SPG System.",
      "5.\tWARRANTY EXCLUSION AND LIMITATIONS",
      "5.1\tTheir warranties provided herein do not include damage, malfunctions or service failures caused by",
      "or resulting from:",
      "a)\tInappropriate handling during transportation or storage misuse, abuse, neglect or accident.",
      "b)\tNegligent maintenance or non-performance of the periodic function checks of the system and/or",
      "failure to comply with any of the instructions detailed in the DIVY Power installation manual for the",
      "concerned SPG System.",
      "c)\tInstallation of the SPG System or any part thereof by service technicians who have not been",
      "appointed by DIVY Power or their authorized representatives, or under be relevant law and/or",
      "applicable regulations;",
      "d)\tComponents like: Surge Projection Device (SPD), Fuses, Rubber and Plastic items:",
      "e)\tIf the SPG System is used for dealt with in any way which is not consistent with the directions of use",
      "published by DIVY Power in the installation manual or by the manufacturer, for commercial purpose or",
      "in a manner which is otherwise not reasonable:",
      "f)\tType, nameplate or serial number is fully or partly changed/modified/ altered, erased or made illegible",
      "on any component supplied as part of the SPG System.",
      "g)\tThe SPG System’s installation in marine environments such as ships, buoys, offshore structures, or",
      "used for unused purposes, unless these exceptions are expressly permitted by the technical",
      "specifications stipulated by DIVY Power:",
      "h)\tUnauthorized repair or maintenance done on the SPG Systems or any component thereof.",
      "i)\tConnections in SPG Systems not in compliance with specifications provided by DIVY Power.",
      "j)\tExposure to improper voltage or power surges or abnormal environmental",
      "conditions (such as acid rain or other pollution).",
      "k)\tForce majeure events, forces of nature and climatic conditions, acts of violence, intervention by third",
      "parties of other external forces such as explosions, roils, war, terrorist attacks or theft, damage by",
      "animals, floods, water damage, avalanches, fire, storm, typhoons, hurricanes, lightning, or ground",
      "movements, or other similar conditions.",
      "l)\texposure to mold discoloration or similar external effects.",
      "m)\texposure to any of the following: extreme thermal or environmental conditions or rapid changes in",
      "such conditions, corrosion, oxidation, unauthorized modifications or connections, unauthorized",
      "opening, servicing by use of spare parts which are not manufactured or approved by DIVY Power,",
      "influence from chemical products.",
      "n)\tuse of the SPG System in such a manner as to in fridge DIVY Power’s or any third Party’s intellectual",
      "property rights (e.g. patents, trademarks etc.)",
      "o)\tany reception problems, distortion related to noise, echo interference or other signal transmission",
      "problems; and",
      "p)\tany problem with components not supplied by DIVY Power like energy meters, LT panels, evacuation",
      "cable, etc. (which are covered and maintained by the buyer)",
      "5.2\tAny deterioration in appearance of the SPG System (including any scratches, stains, mechanical",
      "wear, rust or mold), or any other alterations to the SPG system which occurs after delivery to the Buyer,",
      "shall not or will not constitute a defect under in terms of this Warranty unless it materially impairs the",
      "SPG system’s functioning.",
      "5.3\tIn no event shall DIVY Power be liable for any incidental, indirect, consequential or like damages",
      "including specifically, but without limitation, lost profits, savings or revenues of any kind, whether or not",
      "DIVY Power or Buyer has been advised of the possibility of any such damages or the like. The warranties",
      "provided here are in lieu of all other warranties, express or implied. There are no warranties which",
      "extend beyond those here stated, all which DIVY Power expressly disclaims, including the implied",
      "warranty of fitness for a particular purpose and/or the warranty of merchantability.",
      "5.4\tDIVY Power excludes its liability for any indirect, special, incidental, consequential or punitive",
      "damages arising from the use or loss of use, or failure of any of the SPG Systems to perform as",
      "warranted, including but not limited to damages for lost services, profits or savings, losses and expenses,",
      "whether or not arising out of third-party claims. DIVY Power’s maximum liability under this warranty,",
      "either expressed, or implied or statutory for any manufacturing or design or installation defects, is",
      "limited to the actual purchase price of the SPG system reduced by all taxes, duties, insurance and",
      "transportation expenses (if any), received by DIVY Power from the buyer at the time of sale and",
      "installation of such SPG System. The Buyer’s exclusive remedy for breach of Warranty",
      "shall be only as stated herein.",
      "5.5\tNotwithstanding anything contained herein, DIVY Power not in any circumstances be liable to the",
      "Buyer or any third party for the death of any person or any loss, injury or damage to any person or",
      "property due to the usage of the SPG System.",
      "6.\tREMEDIES AVAILABLE UNDER THE WARRANTY",
      "6.1\tAs Buyer’s sole and exclusive remedy under this Warranty, DIVY Power will at its sole discretion with",
      "regard to the applicable SPG System, subject to the terms detailed in the Warranty, either:",
      "a)\tRepair the defective SPG System or part thereof at no charge; or,",
      "b)\tReplace the defective SPG System or part thereof by a new or re-manufactured equivalent or better",
      "SPG System, at the sole discretion of DIVY Power at no change.",
      "6.2\tReplaced parts of the SPG System will become the property of DIVY Power and the Buyer shall have",
      "no right over such replaced parts.",
      "6.3\tIn the event of remedies under Clause 6.1 above, DIVY Power shall not be liable for any insurance or",
      "transportation charges, customs clearance or any other costs incurred by the Buyer for returning the",
      "defective components of SPG Systems to DIVY Power and shipping repaired or replaced components of",
      "SPG System to the Buyer. Further, DIVY Power shall not be responsible for, and Buyer hereby agrees to",
      "be solely responsible for the costs and any ancillary expenses regarding any on-site labor and any costs",
      "associated with the installation, removal, reinstallation of any component of SPG System thereof for",
      "service under this warranty.",
      "6.4\tThe period(s) as defined in Section 3 as applicable shall not be extended, altered, or renewed upon",
      "the repair or replacement of a defective SPG System by DIVY Power. It is clarified that the Warranty",
      "Period for replaced or repaired SPG System(s) is the remainder of the warranty on the original SPG",
      "System.",
      "7.\tWARRANTY CLAIMS AND SERVICE",
      "7.1\tAll warranty claims must be received by DIVY Power within the Warranty Period for the claim to be",
      "valid. Subject to the aforesaid, all Warranty claims shall be made immediately to DIVY Power and",
      "maximum within two (2) working days of first discovery of the defect. Any claim made after two (2)",
      "working days from the date on which the defect is discovered by the Buyer or ought to have been",
      "discovered by the Buyer, shall not be considered as a valid claim under this Warranty even if such claim",
      "is made within the Warranty period.",
      "7.2\tAll Warranty claims must be in writing and should be provided to DIVY Power along with full and",
      "proper details of the purchase date, serial number of the SPG System, detailed description of the alleged",
      "defect, a copy of the corresponding invoice and other related documents evidencing",
      "that the claim is within the Warranty Period and in compliance with the terms of this Warranty.",
      "7.3\tThe return of any defective SPG System will not be accepted unless prior written authorization has",
      "been given by DIVY Power in this regard.",
      "7.4\tDIVY Power may, at its sole discretion appoint a reputable researcher from a first-class international",
      "test-institute (“Technical Expert”) to examine and verify and Warranty claims made by the Buyer in",
      "relation to the SPG System . The determined by the technical expert in relation to any Warranty claim or",
      "alleged defect in the SPG System will be final, conclusive and binding on the Buyer and DIVY Power. If",
      "the SPG System is found defective, DIVY Power will bear the cost of such testing, however if the SPG",
      "System is found to be without defect then the Buyer shall bear the cost of testing the SPG System.",
      "7.5\tFor information relating to Warranty claims/service, disposal and/or recycling options, the Buyer",
      "should contact DIVY Power or contact the customer service representative at www.divypower.com",
      "8.\tFORCE MAJEURE",
      "8.1\tNotwithstanding anything contained herein , DIVY Power shall not be responsible or liable in any",
      "way to the Buyer or any third party for any non-performance or delay in performance under this",
      "Warranty due to occurrence of any force majeure events such as fire, war, riots, strikes, thunderstorms,",
      "unusual weather conditions, abnormal increase in the price of raw materials and other components of",
      "the SPG System, unavailability of suitable and sufficient labor, material, or capacity or technical or yield",
      "failures and any unforeseen event beyond its control, including, without limitation, any technological or",
      "physical event or condition which is not reasonably known or understood at the time of the sale of the",
      "SPG System or the notification of the relevant warranty claim under this Warranty.",
      "9.\tTRANSFER OF WARRANTY",
      "9.1\tThe Warranty shall be applicable only to the original purchaser of the SPG System, and so long as the",
      "SPG System continues to be physically installed at its first installation location. In case of transfer",
      "ownership of the SPG System by the Buyer to any third party, the Warranty for the SPG System shall",
      "become void.",
      "10.\tMODIFICATION OF WARRANTY",
      "10.1\tUnless modified in writing and signed by an authorized representative of the DIVY Power, the",
      "Warranty set forth herein is the only warranty by DIVY Power applicable to the SPG System and no one",
      "is authorized to restrict, expand or otherwise modify this Warranty.",
      "11.\tMISCELLANEOUS",
      "11.1\tIt is clarified that correction of defects in the manner and for the period of the described in this",
      "Warranty shall constitute full and complete satisfaction of all warranties, liabilities and obligations of",
      "DIVY Power to the Buyer with respect to the SPG System and shall constitute full and",
      "complete settlement of all claims of the Buyer against DIVY Power, whether based on contract, tort or",
      "otherwise.",
      "11.2\tNothing contained in this Warranty shall constitute a new warranty or commencement of a fresh or",
      "extension time period during which the warranties set out herein apply.",
      "11.3\tIf any provision of this Warranty shall constitute a new warranty or commencement of a fresh or",
      "extension time period during which the warranties set out herein apply.",
      "a)\tSuch provision shall be fully several; and,",
      "b)\tthese remaining provisions of this Warranty shall be construed and enforced as if such an illegal,",
      "invalid, or unenforceable provision had never comprised a part hereof.",
      "11.4\tAny dispute, controversy or claim arising out of or relating this Warranty, or the validity,",
      "interpretation, breach or termination thereof as may be designated as Dispute, including claims seeking",
      "redress or asserting rights under applicable law, shall, be resolved and finally settled in accordance with",
      "the provisions of the Arbitration and Conciliation Act, 1996 as may be amended from time to time or its",
      "reenactment. The arbitral tribunal shall be composed of three arbitrators, of which one each is to be",
      "appointed by DIVY Power and Buyer, and the third arbitrator shall be appointed by the arbitrators so",
      "appointed. The seat of such arbitrator shall be in Divy power.",
      "11.5\tThe provisions of this Warranty shall be governed by and construed in accordance with the laws of",
      "India. The courts at Ghaziabad, India, shall have the exclusive jurisdiction to settles any claim or matter",
      "arising under this Warranty, without giving effect to any conflict of laws.",
      "11.6\tThis Warranty constitutes the entire arrangement between DIVY Power and the Buyer with respect to",
      "the SPG system to the exclusion of all other understanding and assurances, either written or oral, the same",
      "shall supersede all such other understandings and assurances.",
    ].join("\n")
  );

  const pageBreakBefore = new Set<string>([
    // Matches the reference PDF page breaks (`assets/warranty-template.txt`)
    "As per invoice shared.",
    "d)\tComponents like: Surge Projection Device (SPD), Fuses, Rubber and Plastic items:",
    "shall not or will not constitute a defect under in terms of this Warranty unless it materially impairs the",
    "associated with the installation, removal, reinstallation of any component of SPG System thereof for",
    "unusual weather conditions, abnormal increase in the price of raw materials and other components of",
    "reenactment. The arbitral tribunal shall be composed of three arbitrators, of which one each is to be",
  ]);

  const bodyHtml = warrantyBodyLines
    .map((line) => {
      const maybeBreak = pageBreakBefore.has(line)
        ? `<div class="pageBreak"></div>`
        : "";

      if (line === "{MODULE_SERIALS}") {
        return `${maybeBreak}<div class="para">
  ${moduleSerialListHtml}
  <div class="para">${moduleSerials.length ? "" : `<span class="muted">` + "—" + `</span>`} ……………….Module series</div>
</div>`;
      }

      const htmlLine = escapeHtml(line)
        .replaceAll("{MODULE_TYPE}", highlight(input.moduleType))
        .replaceAll("{INVERTER_YEARS}", highlight(String(input.inverterWarrantyYears)))
        .replaceAll("{INVERTER_MODEL}", highlight(input.inverterModel))
        .replaceAll("{INVERTER_SERIAL}", highlight(input.inverterSerialNumber))
        .replaceAll("\t", "&nbsp;&nbsp;&nbsp;&nbsp;");

      const isBullet = line.startsWith("•\t");
      const isLettered = /^[a-p]\)\t/i.test(line);

      if (isBullet) {
        const bulletText = escapeHtml(line.replace("•\t", "")).replaceAll(
          "\t",
          "&nbsp;&nbsp;&nbsp;&nbsp;"
        );
        return `${maybeBreak}<div class="bullet">• ${bulletText}</div>`;
      }

      if (isLettered) {
        return `${maybeBreak}<div class="subbullet">${htmlLine}</div>`;
      }

      // Keep tabs as alignment spacing in plain paragraphs.
      return `${maybeBreak}<div class="para">${htmlLine}</div>`;
    })
    .join("");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Warranty Certificate - ${escapeHtml(input.documentNo)}</title>
    <style>
      /* Logo only on page 1 (in flow). Footer: transparent so it never whitens/hides text; sign uses multiply so white in PNG doesn't obscure. */
      @page { size: A4; margin: 48px 48px 100px 48px; }
      * { box-sizing: border-box; }
      body { font-family: "Times New Roman", Times, serif; font-size: 11.5pt; line-height: 1.35; color: #111; margin: 0; }
      .doc-logo { margin-bottom: 20px; }
      .doc-logo .logo { height: 42px; width: auto; object-fit: contain; display: block; }
      footer { position: fixed; bottom: 0; left: 0; right: 0; height: 84px; padding: 8px 48px 18px 48px; display: flex; align-items: flex-end; justify-content: flex-end; background: transparent; }
      footer .sign { height: 54px; width: auto; object-fit: contain; mix-blend-mode: multiply; }

      .content { padding: 0; }
      .title { text-align: center; font-weight: 700; }
      .subtitle { text-align: center; font-weight: 700; margin-top: 2px; }
      .para { margin: 4px 0; white-space: pre-wrap; }
      .bullet { margin: 6px 0 2px 0; font-weight: 700; }
      .subbullet { margin: 2px 0 2px 18px; white-space: pre-wrap; }
      .muted { color: #444; }

      .hl { background: #9AF5C8; padding: 2px 6px; font-weight: 600; border-radius: 2px; }

      .regTitle { margin-top: 10px; font-weight: 700; }
      table.reg { width: 100%; border-collapse: collapse; margin-top: 8px; }
      table.reg, table.reg tr, table.reg td { break-inside: avoid; page-break-inside: avoid; }
      table.reg td { border: 1px solid #222; padding: 6px 8px; vertical-align: top; }
      table.reg td.label { width: 42%; font-weight: 700; }
      .signCell { padding-top: 10px; }
      .signCell img { height: 44px; width: auto; display: block; margin-top: 6px; }

      .serials { margin: 6px 0 6px 22px; }
      .serials li { margin: 2px 0; }

      .pageBreak { break-before: page; page-break-before: always; height: 1px; }
    </style>
  </head>
  <body>
    <footer>
      <img class="sign" src="${assets.signDataUrl}" alt="Authorized Signatory" />
    </footer>

    <main class="content">
      <div class="doc-logo"><img class="logo" src="${assets.logoDataUrl}" alt="Divy Power Logo" /></div>
      <div class="title">${escapeHtml(introLines[0] || "")}</div>
      <div class="subtitle">${escapeHtml(introLines[1] || "")}</div>
      ${introLines
        .slice(2)
        .map((l) => `<div class="para">${escapeHtml(l)}</div>`)
        .join("")}

      <div class="regTitle">For registration of your system:</div>
      <table class="reg">
        <tbody>
          <tr><td class="label">Document No</td><td>${highlight(input.documentNo)}</td></tr>
          <tr><td class="label">System Size (in kwp)</td><td>${highlight(input.systemSizeKwp)}</td></tr>
          <tr><td class="label">Customer Name</td><td>${highlight(input.customerName)}</td></tr>
          <tr><td class="label">Customer Number</td><td>${highlight(input.customerNumber)}</td></tr>
          <tr><td class="label">Customer Address</td><td>${highlight(input.customerAddress)}</td></tr>
          <tr><td class="label">Pin Code with proper landmark</td><td>${highlight(input.pinCode)}</td></tr>
          <tr><td class="label">Date of Installation &amp; Commissioning</td><td>${highlight(input.installationDate)}</td></tr>
          <tr><td class="label">Invoice No.</td><td>${highlight(input.invoiceNo)}</td></tr>
          <tr>
            <td class="signCell">
              <div><strong>Sign. &amp; Stamp of Company</strong></div>
              <div>Divy power pvt ltd</div>
              <img src="${assets.signDataUrl}" alt="Sign & Stamp of Company" />
            </td>
            <td class="signCell">
              <div><strong>Sign. &amp; Stamp of Customer</strong></div>
              <div>${highlight(input.customerName)}</div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Ensure the registration table stays on page 1 -->
      <div class="pageBreak"></div>

      <div style="height: 14px;"></div>

      ${bodyHtml}
    </main>
  </body>
</html>`;
}

