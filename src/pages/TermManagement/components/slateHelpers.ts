import { Text, Element } from "slate";

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

type SlateValue = Element[];

// Helper để chuyển HTML sang Slate value
export const htmlToSlate = (html: string): SlateValue => {
  if (!html) {
    return [
      {
        type: "paragraph",
        children: [{ text: "" }],
      },
    ];
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const body = doc.body;

  const parseNode = (node: Node): CustomText[] => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      return text ? [{ text }] : [];
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return [];
    }

    const element = node as HTMLElement;
    const tagName = element.tagName.toLowerCase();
    const children: CustomText[] = [];

    Array.from(element.childNodes).forEach((child) => {
      const parsed = parseNode(child);
      children.push(...parsed);
    });

    if (children.length === 0) {
      children.push({ text: "" });
    }

    const marks: Partial<CustomText> = {};
    if (
      element.style.fontWeight === "bold" ||
      tagName === "strong" ||
      tagName === "b"
    ) {
      marks.bold = true;
    }
    if (
      element.style.fontStyle === "italic" ||
      tagName === "i" ||
      tagName === "em"
    ) {
      marks.italic = true;
    }
    if (
      element.style.textDecoration?.includes("underline") ||
      tagName === "u"
    ) {
      marks.underline = true;
    }

    if (Object.keys(marks).length > 0) {
      return children.map((child) => ({ ...child, ...marks }));
    }

    return children;
  };

  const parseElement = (node: Node): SlateValue => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      return [
        {
          type: "paragraph",
          children: text ? [{ text }] : [{ text: "" }],
        },
      ];
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return [];
    }

    const element = node as HTMLElement;
    const tagName = element.tagName.toLowerCase();
    const children: CustomText[] = [];

    Array.from(element.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        children.push(...parseNode(child));
      } else {
        const nested = parseElement(child);
        nested.forEach((item) => {
          children.push(...item.children);
        });
      }
    });

    if (children.length === 0) {
      children.push({ text: "" });
    }

    switch (tagName) {
      case "p":
        return [{ type: "paragraph", children }];
      case "ul":
        return [{ type: "bulleted-list", children }];
      case "ol":
        return [{ type: "numbered-list", children }];
      case "li":
        return [{ type: "list-item", children }];
      default:
        return [{ type: "paragraph", children }];
    }
  };

  const result: SlateValue = [];
  Array.from(body.childNodes).forEach((node) => {
    const parsed = parseElement(node);
    if (parsed.length > 0) {
      result.push(...parsed);
    }
  });

  return result.length > 0
    ? result
    : [{ type: "paragraph", children: [{ text: "" }] }];
};

// Helper để chuyển Slate value sang HTML
export const slateToHtml = (value: SlateValue): string => {
  if (!value || value.length === 0) return "";

  const serialize = (node: Element | CustomText): string => {
    // Type guard để kiểm tra Text node
    if (Text.isText(node)) {
      const textNode = node as CustomText;
      let text = textNode.text;
      if (textNode.bold) text = `<strong>${text}</strong>`;
      if (textNode.italic) text = `<em>${text}</em>`;
      if (textNode.underline) text = `<u>${text}</u>`;
      return text;
    }

    // Element node
    const element = node as Element;
    const children = element.children.map(serialize).join("");

    switch (element.type) {
      case "paragraph":
        return `<p>${children}</p>`;
      case "bulleted-list":
        return `<ul>${children}</ul>`;
      case "numbered-list":
        return `<ol>${children}</ol>`;
      case "list-item":
        return `<li>${children}</li>`;
      default:
        return `<p>${children}</p>`;
    }
  };

  return value.map(serialize).join("");
};
