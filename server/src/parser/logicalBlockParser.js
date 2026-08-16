/**
 * Parses raw text evidence into physical vs logical structure.
 * Handles embedded simulated email threads (LOGICAL-EMAIL-001 .. 010),
 * live Gmail threads (--- LOGICAL EMAIL MESSAGE: ... ---),
 * and detects trailing test answer-key summary sections.
 */
function parseLogicalBlocks(rawText, sourceThreadId = 'GMAIL-THREAD-001', realMessageId = '1904a1f87b2e9c10') {
  if (!rawText || typeof rawText !== 'string') {
    return {
      physicalMessageCount: 1,
      logicalEmailCount: 0,
      summarySectionCount: 0,
      conversationStructure: 'SINGLE_MESSAGE',
      logicalBlocks: []
    };
  }

  const lines = rawText.split(/\r?\n/);
  const blocks = [];
  
  // Check if text contains embedded logical email markers or summary sections
  const hasLogicalEmails = /LOGICAL-EMAIL-\d+/i.test(rawText) || /--- EMAIL \d+ ---/i.test(rawText) || /--- (?:LOGICAL EMAIL|PHYSICAL GMAIL) MESSAGE/i.test(rawText);
  const hasSummarySection = /Expected Requirement Signals for Layer 0 Extraction/i.test(rawText) || /--- SUMMARY SECTION ---/i.test(rawText);

  if (!hasLogicalEmails && !hasSummarySection) {
    // Single plain message or transcript
    const isTranscript = rawText.includes('WEBVTT') || rawText.includes('-->') || /\[\d{2}:\d{2}\]/.test(rawText);
    return {
      physicalMessageCount: 1,
      logicalEmailCount: 1,
      summarySectionCount: 0,
      conversationStructure: isTranscript ? 'TRANSCRIPT' : 'SINGLE_MESSAGE',
      logicalBlocks: [{
        blockId: 'LOGICAL-EMAIL-001',
        sender: 'Unknown',
        role: 'Participant',
        date: new Date().toISOString(),
        subject: 'Direct Input Evidence',
        content: rawText.trim(),
        isSummarySection: false,
        excludeFromPrimaryExtraction: false
      }]
    };
  }

  // Parse multi-block embedded thread
  let currentBlock = null;
  let summaryMode = false;
  let logicalEmailCounter = 0;
  let summaryCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for Summary Section divider
    if (/Expected Requirement Signals for Layer 0 Extraction/i.test(line) || /--- SUMMARY SECTION ---/i.test(line)) {
      if (currentBlock) {
        blocks.push(currentBlock);
      }
      summaryMode = true;
      summaryCounter++;
      currentBlock = {
        blockId: 'SUMMARY_SECTION',
        sender: 'Test Validator / System',
        role: 'Answer Key Validator',
        date: '',
        subject: 'Expected Requirement Signals for Layer 0 Extraction',
        content: line + '\n',
        isSummarySection: true,
        excludeFromPrimaryExtraction: true
      };
      continue;
    }

    // Check for logical email header divider
    const emailHeaderMatch =
      line.match(/(?:---|\#\#)?\s*(?:Logical Email|EMAIL)?\s*(LOGICAL-EMAIL-\d+)/i) ||
      line.match(/--- EMAIL (\d+) ---/i) ||
      line.match(/--- (?:LOGICAL EMAIL|PHYSICAL GMAIL) MESSAGE:?\s*([a-zA-Z0-9_-]+)\s*---/i);
    
    if (emailHeaderMatch && !summaryMode) {
      let initialContent = '';
      if (currentBlock && currentBlock.blockId === 'PENDING_HEADER') {
        initialContent = currentBlock.content;
      } else if (currentBlock && currentBlock.content.trim().length > 0) {
        blocks.push(currentBlock);
      }
      logicalEmailCounter++;
      let blockId;
      if (emailHeaderMatch[1] && emailHeaderMatch[1].toUpperCase().startsWith('LOGICAL-EMAIL-')) {
        blockId = emailHeaderMatch[1].toUpperCase();
      } else {
        blockId = `LOGICAL-EMAIL-${String(logicalEmailCounter).padStart(3, '0')}`;
      }
      
      currentBlock = {
        blockId: blockId,
        sender: '',
        role: '',
        date: '',
        subject: '',
        content: initialContent,
        isSummarySection: false,
        excludeFromPrimaryExtraction: false
      };
      continue;
    }

    if (!currentBlock) {
      currentBlock = {
        blockId: 'PENDING_HEADER',
        sender: '',
        role: '',
        date: '',
        subject: '',
        content: '',
        isSummarySection: false,
        excludeFromPrimaryExtraction: false
      };
    }

    // Extract block metadata headers if line matches
    if (line.match(/^From:\s*(.+)/i)) {
      const fromVal = line.replace(/^From:\s*/i, '').trim();
      currentBlock.sender = fromVal;
      const roleMatch = fromVal.match(/\(([^)]+)\)/);
      if (roleMatch) currentBlock.role = roleMatch[1];
    } else if (line.match(/^Date:\s*(.+)/i)) {
      currentBlock.date = line.replace(/^Date:\s*/i, '').trim();
    } else if (line.match(/^Subject:\s*(.+)/i)) {
      currentBlock.subject = line.replace(/^Subject:\s*/i, '').trim();
    } else if (line.match(/^Role:\s*(.+)/i)) {
      currentBlock.role = line.replace(/^Role:\s*/i, '').trim();
    }

    currentBlock.content += line + '\n';
  }

  if (currentBlock) {
    blocks.push(currentBlock);
  }

  // Clean up content strings
  blocks.forEach(b => {
    b.content = b.content.trim();
  });

  let structure = 'EMBEDDED_SIMULATED_THREAD';
  if (/--- PHYSICAL JIRA ISSUE/i.test(rawText) || /Jira Issue/i.test(rawText)) {
    structure = 'JIRA_ISSUE';
  } else if (/--- PHYSICAL CONFLUENCE DOCUMENT/i.test(rawText) || /Confluence Document/i.test(rawText)) {
    structure = 'CONFLUENCE_DOC';
  } else if (/--- PHYSICAL SLACK MESSAGE/i.test(rawText) || /Slack Channel/i.test(rawText)) {
    structure = 'SLACK_THREAD';
  } else if (/Google Meet Conference Record/i.test(rawText) || /WEBVTT/i.test(rawText)) {
    structure = 'TRANSCRIPT';
  }

  return {
    physicalMessageCount: 1, // Truthful physical message count = 1
    logicalEmailCount: logicalEmailCounter || 1,
    summarySectionCount: summaryCounter,
    conversationStructure: structure,
    logicalBlocks: blocks
  };
}

module.exports = {
  parseLogicalBlocks
};
