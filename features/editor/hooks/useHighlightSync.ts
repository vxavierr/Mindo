import { useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { MemoryUnit } from '../../canvas/types';
import { useEditorContext } from '../components/EditorContext';

export function useHighlightSync(editor: Editor | null, memoryUnits?: MemoryUnit[]) {
  const { hoveredUnitId } = useEditorContext();

  useEffect(() => {
    if (!editor) return;

    // Reset all marks
    const marks = document.querySelectorAll('mark');
    marks.forEach(m => {
      m.classList.remove('ring-2', 'ring-mindo-accent', 'scale-105', 'font-bold', 'shadow-lg');
      m.style.boxShadow = 'none';
    });

    if (hoveredUnitId && memoryUnits) {
      const unit = memoryUnits.find(u => u.id === hoveredUnitId);
      if (unit) {
        // Find marks that match the text segment
        marks.forEach(m => {
          if (m.textContent?.trim() === unit.textSegment.trim()) {
            m.classList.add('ring-2', 'ring-mindo-accent', 'scale-105', 'font-bold', 'shadow-lg');
            m.style.transition = 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
            m.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
      }
    }
  }, [editor, hoveredUnitId, memoryUnits]);
}