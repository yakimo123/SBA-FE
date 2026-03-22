// RichEditor.tsx — TipTap rich text editor component
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from 'lucide-react';
import { useCallback, useMemo, useRef } from 'react';

import { FILE_TYPES } from '../../constants/FILE_TYPES';
import { mediaService } from '../../services/mediaService';

interface RichEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const ToolbarButton = ({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    title={title}
    onMouseDown={(e) => {
      e.preventDefault(); // Prevent loss of focus
      onClick();
    }}
    className={`flex h-8 w-8 items-center justify-center rounded-[10px] text-[#5c5347] transition-all hover:bg-[#f2efe9] ${
      active ? 'bg-[#ee4d2d]/10 text-[#ee4d2d]' : ''
    }`}
  >
    {children}
  </button>
);

const Divider = () => <div className="mx-0.5 h-5 w-px bg-[#e8e3da]" />;

export default function RichEditor({
  content,
  onChange,
  placeholder = 'Write detailed product description here...',
}: RichEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: true }),
      Placeholder.configure({ placeholder }),
    ],
    [placeholder]
  );

  const editor = useEditor({
    extensions,
    content,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href as string;
    const url = window.prompt('URL', prev);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!editor) return;
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        // Use mediaService to upload the image to R2
        const publicUrl = await mediaService.uploadFile(file, FILE_TYPES.OTHER);
        editor.chain().focus().setImage({ src: publicUrl }).run();
      } catch (error) {
        console.error('Failed to upload image:', error);
        alert('Failed to upload image. Please try again.');
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [editor]
  );

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-[10px] border border-[#c9bfad] bg-white focus-within:border-[#ee4d2d] focus-within:ring-3 focus-within:ring-[#ee4d2d]/12 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[#e8e3da] bg-[#faf9f7] p-1.5">
        {/* History */}
        <ToolbarButton
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 size={15} />
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        <ToolbarButton
          title="Heading 1"
          active={editor.isActive('heading', { level: 1 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <Heading1 size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Heading 2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 size={15} />
        </ToolbarButton>

        <Divider />

        {/* Inline marks */}
        <ToolbarButton
          title="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Underline"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Strike"
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Code"
          active={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code size={15} />
        </ToolbarButton>

        <Divider />

        {/* Align */}
        <ToolbarButton
          title="Align Left"
          active={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          <AlignLeft size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Align Center"
          active={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          <AlignCenter size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Align Right"
          active={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          <AlignRight size={15} />
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton
          title="Bullet List"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Ordered List"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Blockquote"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={15} />
        </ToolbarButton>

        <Divider />

        {/* Link */}
        <ToolbarButton
          title="Link"
          active={editor.isActive('link')}
          onClick={setLink}
        >
          <LinkIcon size={15} />
        </ToolbarButton>

        {/* Image */}
        <button
          type="button"
          title="Add Image"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[#5c5347] transition-all hover:bg-[#f2efe9]"
        >
          <ImageIcon size={15} />
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={addImage}
        />
      </div>

      {/* Editor area */}
      <style>{`
        .ProseMirror { min-height: 220px; outline: none; }
        .ProseMirror h1 { font-size: 1.8rem; font-weight: 800; margin-bottom: 0.5rem; }
        .ProseMirror h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.4rem; }
        .ProseMirror h3 { font-size: 1.25rem; font-weight: 600; }
        .ProseMirror p { margin-bottom: 0.5rem; }
        .ProseMirror bold, .ProseMirror b, .ProseMirror strong { font-weight: bold !important; }
        .ProseMirror italic, .ProseMirror i, .ProseMirror em { font-style: italic !important; }
        .ProseMirror u { text-decoration: underline !important; }
        .ProseMirror ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin-bottom: 0.5rem; }
        .ProseMirror ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin-bottom: 0.5rem; }
        .ProseMirror li { margin-bottom: 0.2rem; }
        .ProseMirror blockquote { border-left: 3px solid #e8e3da; padding-left: 1rem; color: #5c5347; font-style: italic; }
        .ProseMirror a { color: #ee4d2d; text-decoration: underline; cursor: pointer; }
        .ProseMirror img { max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0; }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9c9085;
          pointer-events: none;
          height: 0;
        }
      `}</style>
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 text-[#1a1612]"
      />
    </div>
  );
}
