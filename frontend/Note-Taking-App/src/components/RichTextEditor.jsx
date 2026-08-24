import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import EmojiPicker from "emoji-picker-react";
import "./richTextContent.css";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Highlighter,
  Code,
  Minus,
  Undo2,
  Redo2,
  Smile,
} from "lucide-react";

const EMOJI_PICKER_WIDTH = 280;
const EMOJI_PICKER_HEIGHT = 330;

/**
 * ToolbarButton — small shared button so every toolbar icon
 * gets the same active/inactive treatment.
 */
const ToolbarButton = ({ onClick, active, disabled, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed ${
      active
        ? "bg-[#FFC93C] text-[#10151F]"
        : "text-gray-500 hover:bg-gray-100 hover:text-[#10151F]"
    }`}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-gray-200 mx-1 shrink-0" />;

/**
 * RichTextEditor
 *
 * Controlled-ish rich text editor. Pass `content` (HTML string) and
 * `onChange(html)`. Internally uses Tiptap; emits HTML on every edit.
 *
 * NOTE: Lists (bulletList / orderedList / listItem) come from StarterKit —
 * do NOT also import @tiptap/extension-bullet-list / -ordered-list /
 * -list-item separately. Registering them a second time creates a duplicate
 * extension name conflict that silently breaks toggleBulletList /
 * toggleOrderedList.
 */
const RichTextEditor = ({ content, onChange, placeholder = "Write your note..." }) => {
  const [showEmoji, setShowEmoji] = useState(false);
  const [emojiPos, setEmojiPos] = useState({ top: 0, left: 0 });
  const emojiButtonRef = useRef(null);
  const emojiPanelRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Highlight.configure({ multicolor: false }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { class: "text-[#E8553D] underline underline-offset-2" },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: content || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[160px] px-4 py-3 text-gray-800",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Keep external content resets (e.g. switching which note is being edited)
  // in sync with the editor instance.
  useEffect(() => {
    if (editor && content !== undefined && content !== editor.getHTML()) {
      editor.commands.setContent(content || "", false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, editor]);

  // Compute a fixed-position spot for the emoji panel that always stays
  // inside the viewport, instead of relying on absolute positioning inside
  // a scrollable modal (which was clipping it off-screen).
  const openEmojiPicker = useCallback(() => {
    const btn = emojiButtonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();

    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < EMOJI_PICKER_HEIGHT + 12;

    let left = rect.left;
    const maxLeft = window.innerWidth - EMOJI_PICKER_WIDTH - 8;
    if (left > maxLeft) left = Math.max(8, maxLeft);

    const top = openUpward
      ? Math.max(8, rect.top - EMOJI_PICKER_HEIGHT - 8)
      : rect.bottom + 8;

    setEmojiPos({ top, left });
    setShowEmoji(true);
  }, []);

  // Close the emoji popover on outside click (checks both the trigger
  // button and the portaled panel, since the panel lives outside the
  // normal DOM tree of this component).
  useEffect(() => {
    if (!showEmoji) return;
    const handleClickOutside = (e) => {
      if (
        emojiButtonRef.current?.contains(e.target) ||
        emojiPanelRef.current?.contains(e.target)
      ) {
        return;
      }
      setShowEmoji(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmoji]);

  // Close on background scroll/resize — but IGNORE scroll events that
  // originate from inside the emoji panel itself (e.g. scrolling the emoji
  // list), otherwise every scroll inside the picker looks like a page
  // scroll and slams it shut.
  useEffect(() => {
    if (!showEmoji) return;

    const handleScroll = (e) => {
      if (emojiPanelRef.current?.contains(e.target)) return;
      setShowEmoji(false);
    };
    const handleResize = () => setShowEmoji(false);

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [showEmoji]);

  const insertEmoji = (emojiData) => {
    editor?.chain().focus().insertContent(emojiData.emoji).run();
    setShowEmoji(false);
  };

  const setLink = () => {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("Link URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!editor) return null;

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      {/* Toolbar */}
      <div className="flex items-center flex-wrap gap-0.5 border-b border-gray-100 px-2 py-1.5">
        {/* Heading level */}
        <select
          value={
            editor.isActive("heading", { level: 1 })
              ? "1"
              : editor.isActive("heading", { level: 2 })
              ? "2"
              : editor.isActive("heading", { level: 3 })
              ? "3"
              : "0"
          }
          onChange={(e) => {
            const level = Number(e.target.value);
            if (level === 0) {
              editor.chain().focus().setParagraph().run();
            } else {
              editor.chain().focus().toggleHeading({ level }).run();
            }
          }}
          title="Text style"
          className="h-8 text-xs font-medium text-gray-600 border border-gray-200 rounded-md pl-1.5 pr-1 mr-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#FFC93C] cursor-pointer"
        >
          <option value="0">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>

        <Divider />

        <ToolbarButton
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Highlight"
          active={editor.isActive("highlight")}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        >
          <Highlighter size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Inline code"
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code size={16} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          title="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Quote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Divider"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Link"
          active={editor.isActive("link")}
          onClick={setLink}
        >
          <LinkIcon size={16} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          title="Insert emoji"
          active={showEmoji}
          onClick={showEmoji ? () => setShowEmoji(false) : openEmojiPicker}
        >
          <span ref={emojiButtonRef} className="flex items-center justify-center">
            <Smile size={16} />
          </span>
        </ToolbarButton>

        <div className="flex-1" />

        <ToolbarButton
          title="Undo"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Redo"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 size={16} />
        </ToolbarButton>
      </div>

      {/* Editor surface */}
      <EditorContent editor={editor} />

      {/* Emoji panel — portaled to <body> and fixed-positioned so it always
          stays inside the viewport, regardless of the modal's own scroll
          container clipping it. */}
      {showEmoji &&
        createPortal(
          <div
            ref={emojiPanelRef}
            style={{
              position: "fixed",
              top: emojiPos.top,
              left: emojiPos.left,
              zIndex: 9999,
              maxHeight: EMOJI_PICKER_HEIGHT,
            }}
            className="shadow-xl rounded-lg overflow-hidden border border-gray-200 bg-white"
          >
            <EmojiPicker
              onEmojiClick={insertEmoji}
              width={EMOJI_PICKER_WIDTH}
              height={EMOJI_PICKER_HEIGHT}
              previewConfig={{ showPreview: false }}
              skinTonesDisabled
              searchDisabled={false}
              lazyLoadEmojis
            />
          </div>,
          document.body
        )}
    </div>
  );
};

export default RichTextEditor;