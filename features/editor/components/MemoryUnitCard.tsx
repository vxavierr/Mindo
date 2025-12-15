
import React, { useState } from 'react';
import { Check, Edit2 } from 'lucide-react';
import { MemoryUnit } from '../../canvas/types'; // Types are now in feature/canvas/types
import { useMindoStore } from '../../../store/useMindoStore';
import { useEditorContext } from './EditorContext';

interface MemoryUnitCardProps {
    unit: MemoryUnit;
    nodeId: string;
}

export const MemoryUnitCard: React.FC<MemoryUnitCardProps> = ({ unit, nodeId }) => {
    const { updateMemoryUnit } = useMindoStore();
    const { hoveredUnitId, setHoveredUnitId } = useEditorContext();
    const [isEditing, setIsEditing] = useState(false);
    const [q, setQ] = useState(unit.question);
    const [a, setA] = useState(unit.answer);

    const handleSave = () => {
        updateMemoryUnit(nodeId, unit.id, { question: q, answer: a });
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="p-3 rounded-lg border bg-white dark:bg-white/5 border-indigo-300 dark:border-mindo-glow shadow-md space-y-2">
                <input
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    className="w-full text-sm font-bold bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded px-2 py-1 outline-none focus:border-indigo-500"
                    placeholder="Question..."
                    autoFocus
                />
                <textarea
                    value={a}
                    onChange={e => setA(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded px-2 py-1 outline-none focus:border-indigo-500 resize-none h-16"
                    placeholder="Answer..."
                />
                <div className="flex justify-end gap-2">
                    <button onClick={() => setIsEditing(false)} className="text-[10px] text-slate-500 hover:text-slate-800">Cancel</button>
                    <button onClick={handleSave} className="bg-indigo-600 text-white p-1 rounded hover:bg-indigo-700"><Check size={12} /></button>
                </div>
            </div>
        );
    }

    return (
        <div
            onMouseEnter={() => setHoveredUnitId(unit.id)}
            onMouseLeave={() => setHoveredUnitId(null)}
            className={`p-3 rounded-lg border transition-all cursor-pointer group relative ${hoveredUnitId === unit.id
                    ? 'bg-white dark:bg-mindo-primary/10 border-indigo-500 dark:border-mindo-glow shadow-md translate-x-1'
                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-indigo-300 dark:hover:border-white/20'
                }`}
        >
            <button
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 dark:hover:bg-white/20 rounded text-slate-500"
            >
                <Edit2 size={10} />
            </button>

            <div className="flex items-start gap-2 pr-4">
                <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${unit.status === 'mastered' ? 'bg-emerald-500' : 'bg-purple-500'}`} />
                <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1 leading-snug">
                        {unit.question}
                    </p>
                    <p className="text-xs text-slate-400 line-clamp-1 italic font-mono border-l-2 border-slate-200 dark:border-white/10 pl-2">
                        "{unit.textSegment}"
                    </p>
                </div>
            </div>
        </div>
    );
};
