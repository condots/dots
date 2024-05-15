import DOMPurify from "dompurify";
import { parse } from "marked";

export const advisoryText = (text: string) => {
  DOMPurify.addHook("afterSanitizeElements", function (node) {
    if (node.tagName && node.tagName.toLowerCase() === "a") {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
  });
  const clean = DOMPurify.sanitize(parse(text));
  DOMPurify.removeHook("afterSanitizeElements");
  return parse(clean) as string;
};
