/**
 * Atomic Segmentation & Noise Stripping Engine
 * Converts logical blocks into sentence/line level AtomicSourceUnits
 * and tags non-extraction noise (greetings, sign-offs, separators, headers, signatures, disclaimers, metadata, changelogs, macros, boilerplate).
 */

const GREETING_REGEX = /^(hi|hello|dear|hey|good morning|good afternoon|good evening)\b/i;
const CLOSING_REGEX = /^(regards|thanks|thank you|best regards|warm regards|cheers|sincerely|yours|best|warmly)\b/i;
const SEPARATOR_REGEX = /^[-_=#*]{3,}|---.*---|===.*===|___.*___/;
const HEADER_REGEX = /^(from|to|date|subject|role|cc|bcc|sent|message-id|reply-to):\s*/i;
const DISCLAIMER_REGEX = /^(sent from my|disclaimer|confidentiality note|this email and any files|the information contained in this|please consider the environment)\b/i;
const SIGNATURE_REGEX = /^\*?[A-Z][a-z]+ [A-Z][a-z]+\*?$|^([A-Z][a-z]+ )+(Lead|Manager|Architect|Engineer|Officer|Director|VP|Specialist|Head)\b/i;

// JIRA & Confluence specific noise patterns
const METADATA_REGEX = /^(project|space|issue type|priority|status|reporter|assignee|sprint|created|updated|last modified|contributors|page title|document status|version|page id|breadcrumbs|labels|components|fix versions?|affects versions?|resolution|votes|watchers|source file):\s*|^Project:\s*.*\|\s*Issue Type:\s*|^Reporter:\s*.*\|\s*Assignee:\s*|^Space:\s*.*\|\s*Page Title:\s*/i;
const CHANGELOG_REGEX = /^(changed status|status changed|transitioned to|assigned to|unassigned from|attachment added|worklog added|field changed by|updated priority|added comment)\b/i;
const MACRO_REGEX = /^\{(?:\/?(?:code|noformat|quote|info|tip|warning|expand|status|toc|panel|table))(?::.*)?\}|^\!.*?\!$|^\[~[a-zA-Z0-9._-]+\]$/i;
const BOILERPLATE_REGEX = /^(table of contents|child pages|page rating|related articles|document history)\b/i;

function segmentAtomicUnits(logicalBlocks, realMessageId = '1904a1f87b2e9c10') {
  const atomicUnits = [];
  let globalLineNumber = 1;

  for (const block of logicalBlocks) {
    const blockId = block.blockId;
    const isSummary = block.isSummarySection || block.excludeFromPrimaryExtraction;
    const lines = block.content.split(/\r?\n/);

    let sentenceCounter = 1;

    for (let lIndex = 0; lIndex < lines.length; lIndex++) {
      const lineText = lines[lIndex].trim();
      const currentLineNum = globalLineNumber++;

      if (!lineText) continue; // Skip blank empty lines

      // Check noise categories
      let noiseType = 'NONE';
      let eligible = !isSummary;

      if (SEPARATOR_REGEX.test(lineText)) {
        noiseType = 'SEPARATOR';
        eligible = false;
      } else if (HEADER_REGEX.test(lineText)) {
        noiseType = 'HEADER';
        eligible = false;
      } else if (METADATA_REGEX.test(lineText)) {
        noiseType = 'METADATA';
        eligible = false;
      } else if (CHANGELOG_REGEX.test(lineText)) {
        noiseType = 'CHANGELOG';
        eligible = false;
      } else if (MACRO_REGEX.test(lineText)) {
        noiseType = 'MACRO';
        eligible = false;
      } else if (BOILERPLATE_REGEX.test(lineText)) {
        noiseType = 'BOILERPLATE';
        eligible = false;
      } else if (GREETING_REGEX.test(lineText) && lineText.length < 35) {
        noiseType = 'GREETING';
        eligible = false;
      } else if (CLOSING_REGEX.test(lineText) && lineText.length < 35) {
        noiseType = 'CLOSING';
        eligible = false;
      } else if (DISCLAIMER_REGEX.test(lineText)) {
        noiseType = 'DISCLAIMER';
        eligible = false;
      } else if (SIGNATURE_REGEX.test(lineText) && lineText.length < 40) {
        noiseType = 'SIGNATURE';
        eligible = false;
      }

      // Format sentence number with 3 digits e.g. SENTENCE-001
      const sentenceTag = `SENTENCE-${String(sentenceCounter).padStart(3, '0')}`;
      const compoundUnitId = `GMAIL-MESSAGE-${realMessageId}#${blockId}#${sentenceTag}`;

      atomicUnits.push({
        unitId: compoundUnitId,
        logicalBlockId: blockId,
        lineNumber: currentLineNum,
        text: lineText,
        eligibleForExtraction: eligible,
        noiseType: noiseType
      });

      sentenceCounter++;
    }
  }

  return atomicUnits;
}

module.exports = {
  segmentAtomicUnits,
  GREETING_REGEX,
  CLOSING_REGEX,
  SEPARATOR_REGEX,
  HEADER_REGEX,
  DISCLAIMER_REGEX,
  SIGNATURE_REGEX,
  METADATA_REGEX,
  CHANGELOG_REGEX,
  MACRO_REGEX,
  BOILERPLATE_REGEX
};
