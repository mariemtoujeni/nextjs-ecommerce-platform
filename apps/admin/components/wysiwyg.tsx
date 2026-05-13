"use client";

import { SerializedEditorState } from "lexical";
import { useMemo, useState, useEffect } from "react";
import { Editor } from "./blocks/editor-00/editor";
import { serializeEditorStateToHtml } from "./editor/utils/lexical-html-serializer";


export interface WYSIWYGPropos {
  content: string;
  onChange?: (content: string) => void;
  onBlur?: (content: string) => void;
  previewMode?: boolean;
  placeholder?: string;
}

export const getRichTextContent = (state: SerializedEditorState) => {
    if (!state || !state.root || !Array.isArray(state.root.children)) return "";
    return state.root.children
      .map((node: any) => {
        if (node.type === "paragraph") {
          return node.children
            .map((child: { text: string }) => child.text)
            .join("");
        }
        return "";
      })
      .join("\n");
};

// Helper function to create a valid default editor state
const createDefaultEditorState = (content: string): SerializedEditorState => {
  const cleanContent = content ? content.replace(/<[^>]*>/g, "") : "";
  return {
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: "normal",
              style: "",
              text: cleanContent,
              type: "text",
              version: 1,
            },
          ],
          direction: "ltr" as const,
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1,
        },
      ],
      direction: "ltr" as const,
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  } as unknown as SerializedEditorState;
};

// Helper function to validate and parse editor state
const parseEditorState = (content: string): SerializedEditorState => {
  if (!content || content.trim() === "") {
    return createDefaultEditorState("");
  }

  try {
    const parsed = JSON.parse(content);
    
    // Validate that the parsed object has the required structure
    if (parsed && typeof parsed === 'object' && parsed.root && 
        Array.isArray(parsed.root.children) && parsed.root.children.length > 0) {
      return parsed as SerializedEditorState;
    }
    
    // If the structure is invalid, create a default state
    return createDefaultEditorState(content);
  } catch (error) {
    // If JSON parsing fails, treat the content as plain text
    return createDefaultEditorState(content);
  }
};

export const WYSIWYG: React.FunctionComponent<WYSIWYGPropos> = ({ content, onChange, onBlur, previewMode, placeholder }) => {
  const [previousContent, setPreviousContent] = useState(content);
  const [editorState, setEditorState] = useState<SerializedEditorState>(() => {
    return parseEditorState(content);
  });

  // Update editor state when content prop changes
  useEffect(() => {
    if (content !== previousContent) {
      setEditorState(parseEditorState(content));
      setPreviousContent(content);
    }
  }, [content, previousContent]);

  const renderedHtml = useMemo(() => {
    if (!editorState?.root) return "";
    try {
      return serializeEditorStateToHtml(editorState);
    } catch (error) {
      console.error("Error serializing editor state to HTML:", error);
      return "";
    }
  }, [editorState]);

  return previewMode ? (
        <div
          className="wysiwyg-preview max-w-none"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
    ) : (
      <Editor
        editorSerializedState={editorState}
        onSerializedChange={(value: SerializedEditorState) => {
          setEditorState(value);
          if (previousContent !== JSON.stringify(value)) {
            onChange?.(JSON.stringify(value));
            setPreviousContent(JSON.stringify(value));
          }
        }}
        placeholder={placeholder}
      />
  )
};