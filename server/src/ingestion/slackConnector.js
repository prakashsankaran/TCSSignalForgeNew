/**
 * Slack Integration Connector
 * Ingests team conversation threads from Slack channels/threads tagged with FrugalForge tags (e.g., #FrugalForge-Capability, #FrugalForge-Candidate).
 * Supports both live Slack Web API fetch and sample Slack data loader.
 */

const config = require('../config');

// Allow local HTTPS fetch in corporate proxy environments
if (process.env.NODE_ENV !== 'production' && !process.env.NODE_TLS_REJECT_UNAUTHORIZED) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

function getSampleSlackData() {
  const rawSlackText = `--- PHYSICAL SLACK MESSAGE ID: C0849201-1700000000.000100 ---
Tag: #FrugalForge-Capability | Channel: #vendor-management-modernization | Workspace: TCS ValueThread

--- Logical Email LOGICAL-EMAIL-001 ---
From: Prakash Sankaran
Date: 2026-08-07T14:43:00Z
Subject: #FrugalForge-Capability Vendor Management System
Role: Stakeholder

#FrugalForge-Capability
We need to seriously look at replacing the spreadsheet-based vendor onboarding process. We now have more than 600 active vendors and the procurement team is spending too much time chasing documents and approvals.
Ideally, I want a Vendor Management System where teams can onboard, approve and manage vendors in one place.

Expected Requirement Signals for Layer 0 Extraction
1. BUSINESS_PROBLEM: We need to seriously look at replacing the spreadsheet-based vendor onboarding process. We now have more than 600 active vendors and the procurement team is spending too much time chasing documents and approvals.
2. PROPOSED_SOLUTION: Ideally, I want a Vendor Management System where teams can onboard, approve and manage vendors in one place.
`;

  return {
    connectorMode: 'SLACK',
    sourceThreadId: 'SLACK-CHANNEL-VENDOR-MGMT',
    realMessageId: 'slack-msg-1700000000',
    rawText: rawSlackText
  };
}

/**
 * Fetch live Slack channel messages or thread messages filtered by tag
 */
async function fetchSlackThread(channelId = null, tagFilter = 'FrugalForge') {
  const token = config.SLACK_BOT_TOKEN || config.SLACK_USER_TOKEN;
  const slackApiBase = config.SLACK_API_BASE_URL || 'https://slack.com/api';
  
  if (!token) {
    return getSampleSlackData();
  }

  // Normalize tag filter
  const targetTag = (tagFilter || 'FrugalForge').replace(/^#/, '');

  try {
    // 1. Query public channels list using types=public_channel
    const listRes = await fetch(`${slackApiBase}/conversations.list?types=public_channel`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const listData = await listRes.json();

    if (!listData.ok) {
      if (listData.error === 'missing_scope') {
        throw new Error('Slack Token Missing Scopes: The current token lacks `channels:read` scope required to list channels.');
      }
      throw new Error(`Slack API error on conversations.list: ${listData.error}`);
    }

    const channels = listData.channels || [];
    if (channels.length === 0) {
      throw new Error('No public channels found in Slack workspace.');
    }

    // Identify target channels (prioritize vendor-management-modernization or specified channelId)
    let channelsToScan = [];
    if (channelId) {
      const matched = channels.find(c => c.id === channelId || c.name === channelId.replace(/^#/, ''));
      if (matched) channelsToScan.push(matched);
    }
    
    if (channelsToScan.length === 0) {
      // Prioritize vendor-management-modernization or frugalforge channels
      const targetChannel = channels.find(c => c.name.includes('vendor-management') || c.name.includes('frugalforge')) || channels[0];
      channelsToScan.push(targetChannel);
    }

    let candidateMessages = [];
    let activeChannel = channelsToScan[0];
    let notInChannelNames = [];

    for (const ch of channelsToScan) {
      let historyRes = await fetch(`${slackApiBase}/conversations.history?channel=${ch.id}&limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let historyData = await historyRes.json();

      // If bot is not in channel, try joining if possible
      if (!historyData.ok && historyData.error === 'not_in_channel') {
        const joinRes = await fetch(`${slackApiBase}/conversations.join`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel: ch.id })
        });
        const joinData = await joinRes.json();
        if (joinData.ok) {
          // Retry history after join
          historyRes = await fetch(`${slackApiBase}/conversations.history?channel=${ch.id}&limit=100`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          historyData = await historyRes.json();
        } else {
          notInChannelNames.push(`#${ch.name}`);
        }
      }

      if (historyData.ok && historyData.messages) {
        const matches = historyData.messages.filter(m => 
          m.text && m.text.toLowerCase().includes('frugalforge')
        );
        if (matches.length > 0) {
          candidateMessages = matches;
          activeChannel = ch;
          break;
        }
      }
    }

    if (candidateMessages.length === 0) {
      if (notInChannelNames.length > 0) {
        throw new Error(`Slack Bot Not In Channel: Please invite the bot to channel ${notInChannelNames.join(', ')} in Slack by typing \`/invite @signal_intake_engine\` in that channel!`);
      }
      throw new Error(`No messages containing tag "FrugalForge" found in scanned channels. Please verify that the bot is added to #${activeChannel.name} and your message contains "#FrugalForge-Capability" or "#FrugalForge-Candidate".`);
    }

    // Format raw text for logical block parsing
    let rawText = `--- PHYSICAL SLACK MESSAGE ID: ${activeChannel.id}-${candidateMessages[0].ts} ---\n`;
    rawText += `Tag: #${targetTag} | Channel: #${activeChannel.name} (${activeChannel.id})\n\n`;

    candidateMessages.reverse().forEach((msg, idx) => {
      const emailIdx = String(idx + 1).padStart(3, '0');
      const senderName = msg.username || (msg.user ? `@User_${msg.user}` : '@TeamMember');
      rawText += `--- Logical Email LOGICAL-EMAIL-${emailIdx} ---\n`;
      rawText += `From: ${senderName}\n`;
      rawText += `Date: ${new Date(parseFloat(msg.ts) * 1000).toISOString()}\n`;
      rawText += `Subject: Slack Message #${idx + 1} (#${activeChannel.name})\n\n`;
      rawText += `${msg.text}\n\n`;
    });

    return {
      connectorMode: 'SLACK',
      sourceThreadId: `SLACK-${activeChannel.id}`,
      realMessageId: candidateMessages[0].ts,
      rawText: rawText
    };
  } catch (err) {
    console.error(`Slack Live Ingestion Error: ${err.message}`);
    throw err;
  }
}

module.exports = {
  getSampleSlackData,
  fetchSlackThread
};
