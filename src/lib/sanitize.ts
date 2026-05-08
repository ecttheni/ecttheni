const ALLOWED_TAGS = ["br", "strong", "em", "b", "i", "u", "span", "a"];
const ALLOWED_ATTRS = ["href", "target", "rel", "class"];
const DANGEROUS_PROTOCOLS = ["javascript:", "data:", "vbscript:"];

export function sanitizeHTML(html: string): string {
  if (typeof html !== "string") return "";

  let sanitized = html;

  ALLOWED_TAGS.forEach((tag) => {
    const openRegex = new RegExp(`<${tag}(\\s[^>]*)?>`, "gi");
    const closeRegex = new RegExp(`</${tag}>`, "gi");
    sanitized = sanitized.replace(openRegex, (match) => match);
    sanitized = sanitized.replace(closeRegex, (match) => match);
  });

  sanitized = sanitized.replace(/<(?!\/?(?:br|strong|em|b|i|u|span|a)\b)[^>]*>/gi, "");

  sanitized = sanitized.replace(
    /<a\s+[^>]*href\s*=\s*["']([^"']*)["'][^>]*>/gi,
    (match, href) => {
      const lowerHref = href.toLowerCase();
      if (DANGEROUS_PROTOCOLS.some((p) => lowerHref.startsWith(p))) {
        return match.replace(href, "#");
      }
      return match;
    }
  );

  return sanitized;
}
