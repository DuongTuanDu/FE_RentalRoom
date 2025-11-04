import { useMemo, useCallback } from "react";
import { createEditor, Editor, Transforms, Element } from "slate";
import type { BaseEditor } from "slate";
import type { ReactEditor } from "slate-react";
import { Slate, Editable, withReact, useSlate } from "slate-react";
import { withHistory } from "slate-history";
import { Bold, Italic, Underline, List, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";

type CustomElement = {
  type: "paragraph" | "bulleted-list" | "numbered-list" | "list-item";
  children: CustomText[];
};

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

type SlateValue = Element[];

interface SlateEditorProps {
  value: SlateValue;
  onChange: (value: SlateValue) => void;
  placeholder?: string;
}

// Toolbar Button Component
const ToolbarButton = ({
  icon: Icon,
  isActive,
  onMouseDown,
  "aria-label": ariaLabel,
}: {
  icon: typeof Bold;
  isActive: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  "aria-label": string;
}) => (
  <Button
    type="button"
    variant="ghost"
    size="sm"
    onMouseDown={onMouseDown}
    className={`h-8 w-8 p-0 ${
      isActive ? "bg-accent text-accent-foreground" : ""
    }`}
    aria-label={ariaLabel}
  >
    <Icon className="h-4 w-4" />
  </Button>
);

// Toolbar Component
const Toolbar = () => {
  const editor = useSlate();

  const isMarkActive = (format: "bold" | "italic" | "underline") => {
    const marks = Editor.marks(editor);
    return marks ? (marks[format] === true) : false;
  };

  const toggleMark = (format: "bold" | "italic" | "underline") => {
    const isActive = isMarkActive(format);
    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  };

  const isBlockActive = (editor: Editor, format: "bulleted-list" | "numbered-list") => {
    const { selection } = editor;
    if (!selection) return false;

    const [match] = Array.from(
      Editor.nodes(editor, {
        at: selection,
        match: (n) => {
          if (Editor.isEditor(n)) return false;
          if (Element.isElement(n)) {
            return (
              n.type === format ||
              (n.type === "list-item" &&
                Editor.above(editor, {
                  match: (node) => {
                    if (Editor.isEditor(node)) return false;
                    if (Element.isElement(node)) {
                      return node.type === format;
                    }
                    return false;
                  },
                }) !== undefined)
            );
          }
          return false;
        },
      })
    );

    return !!match;
  };

  const toggleList = (type: "bulleted-list" | "numbered-list") => {
    const isActive = isBlockActive(editor, type);
    Transforms.unwrapNodes(editor, {
      match: (n) => {
        if (Editor.isEditor(n)) return false;
        if (Element.isElement(n)) {
          return n.type === "bulleted-list" || n.type === "numbered-list";
        }
        return false;
      },
      split: true,
    });

    if (isActive) {
      Transforms.setNodes(editor, { type: "paragraph" });
    } else {
      Transforms.setNodes(editor, { type: "list-item" });
      Transforms.wrapNodes(editor, { type, children: [] });
    }
  };

  return (
    <div className="flex items-center gap-1 p-2 border-b border-border">
      <ToolbarButton
        icon={Bold}
        isActive={isMarkActive("bold")}
        onMouseDown={(e) => {
          e.preventDefault();
          toggleMark("bold");
        }}
        aria-label="Bold"
      />
      <ToolbarButton
        icon={Italic}
        isActive={isMarkActive("italic")}
        onMouseDown={(e) => {
          e.preventDefault();
          toggleMark("italic");
        }}
        aria-label="Italic"
      />
      <ToolbarButton
        icon={Underline}
        isActive={isMarkActive("underline")}
        onMouseDown={(e) => {
          e.preventDefault();
          toggleMark("underline");
        }}
        aria-label="Underline"
      />
      <div className="w-px h-6 bg-border mx-1" />
      <ToolbarButton
        icon={List}
        isActive={isBlockActive(editor, "bulleted-list")}
        onMouseDown={(e) => {
          e.preventDefault();
          toggleList("bulleted-list");
        }}
        aria-label="Bullet List"
      />
      <ToolbarButton
        icon={ListOrdered}
        isActive={isBlockActive(editor, "numbered-list")}
        onMouseDown={(e) => {
          e.preventDefault();
          toggleList("numbered-list");
        }}
        aria-label="Numbered List"
      />
    </div>
  );
};

// Render Element
const renderElement = ({
  attributes,
  children,
  element,
}: {
  attributes: any;
  children: any;
  element: any;
}) => {
  switch (element.type) {
    case "bulleted-list":
      return (
        <ul {...attributes} className="list-disc pl-6">
          {children}
        </ul>
      );
    case "numbered-list":
      return (
        <ol {...attributes} className="list-decimal pl-6">
          {children}
        </ol>
      );
    case "list-item":
      return <li {...attributes}>{children}</li>;
    default:
      return (
        <p {...attributes} className="mb-2">
          {children}
        </p>
      );
  }
};

// Render Leaf
const renderLeaf = ({
  attributes,
  children,
  leaf,
}: {
  attributes: any;
  children: any;
  leaf: any;
}) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }
  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  if (leaf.underline) {
    children = <u>{children}</u>;
  }
  return <span {...attributes}>{children}</span>;
};

export const SlateEditor = ({
  value,
  onChange,
  placeholder = "Nhập mô tả...",
}: SlateEditorProps) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  const handleChange = useCallback(
    (newValue: SlateValue) => {
      onChange(newValue);
    },
    [onChange]
  );

  return (
    <div className="border border-input rounded-md overflow-hidden bg-background">
      <Slate editor={editor} initialValue={value} onChange={handleChange as any}>
        <Toolbar />
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder={placeholder}
          className="min-h-[200px] max-h-[400px] overflow-y-auto p-4 focus:outline-none prose prose-sm max-w-none dark:prose-invert"
          style={{ minHeight: "200px" }}
        />
      </Slate>
    </div>
  );
};

