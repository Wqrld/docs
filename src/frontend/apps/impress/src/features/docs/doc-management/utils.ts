import emojiRegex from 'emoji-regex';
import * as Y from 'yjs';

import { Doc, LinkReach } from './types';

export const base64ToYDoc = (base64: string) => {
  const uint8Array = Buffer.from(base64, 'base64');
  const ydoc = new Y.Doc();
  Y.applyUpdate(ydoc, uint8Array);
  return ydoc;
};

export const base64ToBlocknoteXmlFragment = (base64: string) => {
  return base64ToYDoc(base64).getXmlFragment('document-store');
};

export const getDocLinkReach = (doc: Doc): LinkReach => {
  return doc.computed_link_reach ?? doc.link_reach;
};

export const getDocLinkRole = (doc: Doc): Doc['link_role'] => {
  return doc.computed_link_role ?? doc.link_role;
};

export const getEmojiAndTitle = (title: string) => {
  // Use emoji-regex library for comprehensive emoji detection compatible with ES5
  const regex = emojiRegex();

  // Ignore leading spaces when checking for a leading emoji
  const trimmedTitle = title.trimStart();
  const match = trimmedTitle.match(regex);

  if (match && trimmedTitle.startsWith(match[0])) {
    const emoji = match[0];
    const titleWithoutEmoji = trimmedTitle.substring(emoji.length).trim();
    return { emoji, titleWithoutEmoji };
  }

  return { emoji: null, titleWithoutEmoji: title };
};

const normalizeTitle = (title: string) =>
  getEmojiAndTitle(title)
    .titleWithoutEmoji.replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

/**
 * Whether the document already opens with its title: a first block that is a
 * heading of the same text, emoji, case and spacing aside.
 */
export const startsWithTitle = (
  blocks: { type: string; content?: unknown }[],
  title: string,
): boolean => {
  const [first] = blocks;
  if (first?.type !== 'heading' || !Array.isArray(first.content)) {
    return false;
  }

  const text = first.content
    .map((node: { text?: unknown }) =>
      typeof node.text === 'string' ? node.text : '',
    )
    .join('');

  return normalizeTitle(text) === normalizeTitle(title);
};
