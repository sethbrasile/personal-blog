/**
 * Sätteri mdast plugin: drops markdown `html` nodes that are only HTML comments.
 * Hugo never rendered raw HTML, so comments (unfinished drafts, duplicate
 * disclosures) stayed out of the output; this keeps them out here too.
 */
const ONLY_COMMENTS = /^\s*(?:<!--[\s\S]*?-->\s*)+$/;

export const stripHtmlComments = {
  name: 'strip-html-comments',
  html(node, ctx) {
    if (ONLY_COMMENTS.test(node.value)) ctx.removeNode(node);
  },
};
