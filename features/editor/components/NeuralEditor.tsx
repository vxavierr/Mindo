import React, { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { Bold, Italic, List, Heading1, Heading2, BrainCircuit, Network, Link as LinkIcon, LucideIcon, Check, X as XIcon } from 'lucide-react';
import { useMindoStore } from '../../../store/useMindoStore';
import { MemoryUnit, MindNode } from '../../canvas/types';
import { useHighlightSync } from '../hooks/useHighlightSync';
import { MentionNode } from '../extensions/MentionNode';

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
  const { updateNode, addMemoryUnit, addNode, nodes, createSolidEdge } = useMindoStore();

  // UI States for link creation
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkReason, setLinkReason] = useState('');

  // Mention states
  const [showMentionPopup, setShowMentionPopup] = useState(false);
  const [filteredNodes, setFilteredNodes] = useState<MindNode[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStartPos, setMentionStartPos] = useState<number | null>(null);

  // Reason dialog states
  const [pendingMention, setPendingMention] = useState<MindNode | null>(null);
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [mentionReason, setMentionReason] = useState('');
  const reasonInputRef = useRef<HTMLInputElement>(null);

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
        placeholder: 'Comece a digitar... Use @ para mencionar e conectar neurônios.',
      }),
      MentionNode,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-slate prose-lg dark:prose-invert focus:outline-none min-h-[500px] max-w-none p-6 text-slate-600 dark:text-slate-300 prose-headings:text-slate-800 dark:prose-headings:text-slate-100',
      },
    },
    onUpdate: ({ editor }) => {
      updateNode(nodeId, { content: editor.getHTML() });

      // Only check for mentions when not showing reason dialog
      if (showReasonDialog) return;

      const { from } = editor.state.selection;
      const textContent = editor.state.doc.textBetween(Math.max(0, from - 50), from, '\n');
      const lastAtIndex = textContent.lastIndexOf('@');

      if (lastAtIndex !== -1) {
        const query = textContent.slice(lastAtIndex + 1);
        if (!query.includes(' ') && !query.includes('\n') && query.length < 25) {
          const absolutePos = from - (textContent.length - lastAtIndex);
          setMentionStartPos(absolutePos);

          const filtered = nodes
            .filter(n => n.id !== nodeId && n.data.label.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 6);
          setFilteredNodes(filtered);
          setShowMentionPopup(filtered.length > 0);
          setSelectedIndex(0);
        } else {
          setShowMentionPopup(false);
        }
      } else {
        setShowMentionPopup(false);
      }
    },
  });

  // Handle keyboard navigation for mention popup
  useEffect(() => {
    if (!showMentionPopup || filteredNodes.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredNodes.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredNodes.length) % filteredNodes.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSelectMention(filteredNodes[selectedIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowMentionPopup(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showMentionPopup, filteredNodes, selectedIndex]);

  // Focus reason input when dialog opens
  useEffect(() => {
    if (showReasonDialog && reasonInputRef.current) {
      setTimeout(() => reasonInputRef.current?.focus(), 50);
    }
  }, [showReasonDialog]);

  // Apply highlights for memory units
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

  useHighlightSync(editor, memoryUnits);

  const handleSelectMention = (selectedNode: MindNode) => {
    setPendingMention(selectedNode);
    setShowMentionPopup(false);
    setShowReasonDialog(true);
  };

  const confirmMention = () => {
    if (!editor || !pendingMention || !mentionReason.trim()) return;

    // Delete @query and insert mention chip
    if (mentionStartPos !== null) {
      const currentPos = editor.state.selection.from;
      editor
        .chain()
        .focus()
        .deleteRange({ from: mentionStartPos, to: currentPos })
        .insertMention({ id: pendingMention.id, label: pendingMention.data.label })
        .insertContent(' ')
        .run();
    }

    // Create solid edge
    createSolidEdge(nodeId, pendingMention.id, mentionReason);

    // Reset states
    setPendingMention(null);
    setShowReasonDialog(false);
    setMentionReason('');
    setMentionStartPos(null);
  };

  const cancelMention = () => {
    setPendingMention(null);
    setShowReasonDialog(false);
    setMentionReason('');
    setMentionStartPos(null);
    editor?.chain().focus().run();
  };

  const handleCreateUM = () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, ' ');
    if (!text) return;

    editor.chain().focus().setHighlight({ color: '#c084fc4d' }).run();
    addMemoryUnit(nodeId, {
      id: crypto.randomUUID(),
      question: 'Novo Conceito',
      answer: 'Defina isso...',
      textSegment: text,
      status: 'new'
    });
  };

  const handleRefactorClick = () => {
    setShowLinkInput(true);
    setTimeout(() => {
      const input = document.getElementById('link-reason-input');
      if (input) input.focus();
    }, 50);
  };

  const confirmRefactor = () => {
    if (!editor || !linkReason.trim()) return;
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, ' ');

    if (text) {
      const newNodeId = addNode(text, 'text', nodeId, 'new', linkReason);

      editor
        .chain()
        .focus()
        .deleteSelection()
        .insertMention({ id: newNodeId, label: text })
        .insertContent(' ')
        .run();
    }

    setShowLinkInput(false);
    setLinkReason('');
  };

  const cancelRefactor = () => {
    setShowLinkInput(false);
    setLinkReason('');
  };

  if (!editor) return null;

  return (
    <div className="relative flex flex-col h-full">
      {/* Mention Suggestion Popup */}
      {showMentionPopup && filteredNodes.length > 0 && (
        <div className="fixed z-[9999] bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden min-w-[220px] py-1" style={{ top: '200px', left: '100px' }}>
          <div className="px-3 py-1.5 text-xs text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-slate-700">
            Conectar ao neurônio
          </div>
          {filteredNodes.map((node, index) => (
            <button
              key={node.id}
              onClick={() => handleSelectMention(node)}
              className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${index === selectedIndex
                ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
            >
              <span className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs">📄</span>
              <span className="truncate">{node.data.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Mention Reason Dialog */}
      {showReasonDialog && pendingMention && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5 min-w-[320px] max-w-md">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-sm">📄</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{pendingMention.data.label}</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Por que você está conectando a este neurônio?</p>
            <input
              ref={reasonInputRef}
              type="text"
              value={mentionReason}
              onChange={(e) => setMentionReason(e.target.value)}
              placeholder="ex: Conceito relacionado, Exemplo, Evidência..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmMention();
                if (e.key === 'Escape') cancelMention();
              }}
            />
            <div className="flex justify-end gap-2">
              <button onClick={cancelMention} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors">Cancelar</button>
              <button onClick={confirmMention} disabled={!mentionReason.trim()} className="px-4 py-2 text-sm bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Conectar</button>
            </div>
          </div>
        </div>
      )}

      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100, maxWidth: 500 }}>
          <div className="flex items-center gap-3 bg-white dark:bg-[#1E293B] px-3 py-2 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.2)] dark:shadow-black/50 border border-slate-200 dark:border-white/10">
            {!showLinkInput ? (
              <>
                <div className="flex items-center gap-1">
                  <EditorIconButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} />
                  <EditorIconButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} />
                  <div className="w-px h-4 bg-slate-300 dark:bg-white/10 mx-1" />
                  <EditorIconButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} icon={Heading1} />
                  <EditorIconButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} icon={Heading2} />
                  <div className="w-px h-4 bg-slate-300 dark:bg-white/10 mx-1" />
                  <EditorIconButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={List} />
                  <EditorIconButton onClick={() => editor.chain().focus().setLink({ href: '#' }).run()} isActive={editor.isActive('link')} icon={LinkIcon} />
                </div>

                <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-white/10">
                  <button onClick={handleCreateUM} className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500 hover:bg-purple-600 text-white shadow-lg hover:shadow-purple-500/40 transition-all" title="Create Memory Unit">
                    <BrainCircuit size={14} />
                  </button>
                  <button onClick={handleRefactorClick} className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/40 transition-all" title="Create New Node from Selection">
                    <Network size={14} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 animate-fade-in">
                <input id="link-reason-input" type="text" value={linkReason} onChange={(e) => setLinkReason(e.target.value)} placeholder="Por que esta conexão?" className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-md px-2 py-1 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48" onKeyDown={(e) => e.key === 'Enter' && confirmRefactor()} />
                <button onClick={confirmRefactor} className="p-1 rounded-full bg-green-500 text-white hover:bg-green-600"><Check size={14} /></button>
                <button onClick={cancelRefactor} className="p-1 rounded-full bg-slate-200 dark:bg-white/10 text-slate-500 hover:bg-slate-300 dark:hover:bg-white/20"><XIcon size={14} /></button>
              </div>
            )}
          </div>
        </BubbleMenu>
      )}

      <EditorContent editor={editor} className="flex-1 overflow-y-auto outline-none" />
    </div>
  );
}