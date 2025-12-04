import { useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { MemoryUnit } from '../../canvas/types';
import { useEditorContext } from '../components/EditorContext';

export function useHighlightSync(editor: Editor | null, memoryUnits?: MemoryUnit[]) {
  const { hoveredUnitId } = useEditorContext();

  useEffect(() => {
    if (!editor) return;
    
    const marks = document.querySelectorAll('mark');
    
    marks.forEach(m => {
        m.style.boxShadow = 'none';
        m.style.transform = 'none';
        m.style.fontWeight = 'normal';
    });

    if (hoveredUnitId && memoryUnits) {
       const unit = memoryUnits.find(u => u.id === hoveredUnitId);
       if (unit) {
           marks.forEach(m => {
               if (m.textContent === unit.textSegment) {
                   m.style.boxShadow = '0 0 10px rgba(192, 132, 252, 0.5)';
                   m.style.transform = 'scale(1.05)';
                   m.style.fontWeight = 'bold';
                   m.style.transition = 'all 0.2s';
                   m.scrollIntoView({ behavior: 'smooth', block: 'center' });
               }
           });
       }
    }
  }, [editor, hoveredUnitId, memoryUnits]);
}