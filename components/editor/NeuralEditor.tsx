import React, { useEffect } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { Bold, Italic, List, Heading1, Heading2, BrainCircuit, Network, Link as LinkIcon, LucideIcon } from 'lucide-react';
import { useMindoStore } from '../../store/useMindoStore';
import { MemoryUnit } from '../../types';
import { useHighlightSync } from './hooks/useHighlightSync';

interface NeuralEditorProps {
  nodeId: string;
  initialContent: string;
  memoryUnits?: MemoryUnit[];
}

const EditorIconButton = ({ onClick, isActive, icon: Icon }: { onClick: () => void, isActive: boolean, icon: LucideIcon }) => (
  <button 
    onClick={onClick} 
    className={`p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition ${isActive ? 'text-indigo-600 bg-indigo-50 dark:bg-white/10' : 'text-slate-500'}`}
  >
    <Icon size={16} />
  </button>
);

export function NeuralEditor({ nodeId, initialContent, memoryUnits }: NeuralEditorProps) {
  const { updateNode, addMemoryUnit, addNode } = useMindoStore();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: true }), 
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-indigo-600 font-medium underline cursor-pointer hover:text-indigo-800',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start typing or paste content to expand your mind...',
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-slate prose-lg dark:prose-invert focus:outline-none min-h-[500px] max-w-none p-6 text-slate-600 dark:text-slate-300 prose-headings:text-slate-800 dark:prose-headings:text-slate-100',
      },
    },
    onUpdate: ({ editor }) => {
      updateNode(nodeId, { content: editor.getHTML() });
    },
  });

  // === 1. HIGHLIGHT PERSISTENCE LOGIC (Keep marks in editor) ===
  useEffect(() => {
    if (editor && memoryUnits) {
      memoryUnits.forEach(unit => {
        if (!unit.textSegment) return;
        
        const docText = editor.state.doc.textBetween(0, editor.state.doc.content.size, '\n', '\n');
        let pos = docText.indexOf(unit.textSegment);
        
        while (pos !== -1) {
            editor.commands.setTextSelection({ from: pos + 1, to: pos + 1 + unit.textSegment.length });
            editor.commands.setHighlight({ color: '#c084fc4d' }); 
            pos = docText.indexOf(unit.textSegment, pos + 1);
        }
      });
    }
  }, [editor, memoryUnits?.length]); 

  // === 2. HOVER SYNC LOGIC (Using Custom Hook) ===
  useHighlightSync(editor, memoryUnits);

  // === 3. ACTIONS ===
  const handleCreateUM = () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, ' ');
    if (!text) return;

    editor.chain().focus().setHighlight({ color: '#c084fc4d' }).run();
    addMemoryUnit(nodeId, {
        id: `mu-${Date.now()}`,
        question: 'New Concept',
        answer: 'Define this...',
        textSegment: text,
        status: 'new'
    });
  };

  const handleRefactorToNode = () => {
      if (!editor) return;
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, ' ');
      if (!text) return;

      editor.chain().focus().setHighlight({ color: '#60a5fa4d' }).run();
      addNode(text, 'text', nodeId, 'new'); 
  };

  if (!editor) return null;

  return (
    <div className="relative flex flex-col h-full">
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100, maxWidth: 500 }}>
          <div className="flex items-center gap-3">
            
            <div className="flex items-center gap-1 bg-white dark:bg-[#1E293B] px-3 py-2 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.2)] dark:shadow-black/50 border border-slate-200 dark:border-white/10">
                <EditorIconButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} />
                <EditorIconButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} />
                <div className="w-px h-4 bg-slate-300 dark:bg-white/10 mx-1" />
                <EditorIconButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} icon={Heading1} />
                <EditorIconButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} icon={Heading2} />
                <div className="w-px h-4 bg-slate-300 dark:bg-white/10 mx-1" />
                <EditorIconButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={List} />
                <EditorIconButton onClick={() => editor.chain().focus().setLink({ href: '#' }).run()} isActive={editor.isActive('link')} icon={LinkIcon} />
            </div>

            <div className="flex items-center gap-2">
                <button 
                    onClick={handleCreateUM}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500 hover:bg-purple-600 text-white shadow-lg hover:shadow-purple-500/40 hover:-translate-y-1 transition-all"
                    title="Create Memory Unit"
                >
                    <BrainCircuit size={18} />
                </button>

                <button 
                    onClick={handleRefactorToNode}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/40 hover:-translate-y-1 transition-all"
                    title="Link New Node"
                >
                    <Network size={18} />
                </button>
            </div>

          </div>
        </BubbleMenu>
      )}

      <EditorContent editor={editor} className="flex-1 overflow-y-auto outline-none" />
    </div>
  );
}