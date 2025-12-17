import React from 'react';
import { FileText, Code2, Video, Image, FileType, Plus } from 'lucide-react';
import { useMindoStore } from '../../../../store/useMindoStore';
import { NodeType } from '../../types';

interface NodeTypeButton {
    type: NodeType;
    label: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
}

const nodeTypeButtons: NodeTypeButton[] = [
    {
        type: 'text',
        label: 'Texto',
        icon: <FileText size={18} />,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/20 hover:bg-purple-500/30'
    },
    {
        type: 'code',
        label: 'Código',
        icon: <Code2 size={18} />,
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-500/20 hover:bg-cyan-500/30'
    },
    {
        type: 'video',
        label: 'Vídeo',
        icon: <Video size={18} />,
        color: 'text-red-400',
        bgColor: 'bg-red-500/20 hover:bg-red-500/30'
    },
    {
        type: 'image',
        label: 'Imagem',
        icon: <Image size={18} />,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/20 hover:bg-emerald-500/30'
    },
    {
        type: 'pdf',
        label: 'PDF',
        icon: <FileType size={18} />,
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/20 hover:bg-orange-500/30'
    }
];

/**
 * CreationDock - Floating toolbar for creating polymorphic nodes
 * 
 * Creates "Empty State" nodes immediately.
 * For Video/Image/PDF, the node appears with an upload placeholder.
 * For Text/Code, the node appears with default content.
 */
export function CreationDock() {
    const addNodeByType = useMindoStore((state) => state.addNodeByType);

    const handleCreate = (type: NodeType) => {
        addNodeByType(type);
    };

    return (
        <div
            className="
        absolute bottom-6 left-1/2 -translate-x-1/2 z-30
        flex items-center gap-2
        bg-black/60 backdrop-blur-xl
        border border-white/10
        rounded-2xl
        px-3 py-2
        shadow-2xl
      "
        >
            {/* Add indicator */}
            <div className="flex items-center gap-2 pr-2 border-r border-white/10">
                <Plus size={16} className="text-gray-400" />
                <span className="text-xs text-gray-400 font-medium">Adicionar</span>
            </div>

            {/* Node type buttons */}
            {nodeTypeButtons.map((nodeType) => (
                <button
                    key={nodeType.type}
                    onClick={() => handleCreate(nodeType.type)}
                    className={`
            flex items-center justify-center gap-2
            px-3 py-2
            rounded-xl
            ${nodeType.bgColor}
            ${nodeType.color}
            transition-all duration-200
            hover:scale-110 active:scale-95
            group
            min-w-[42px]
          `}
                    title={`Criar ${nodeType.label}`}
                >
                    {nodeType.icon}
                    <span className="text-xs font-medium max-w-0 overflow-hidden group-hover:max-w-[80px] transition-all duration-200 whitespace-nowrap">
                        {nodeType.label}
                    </span>
                </button>
            ))}
        </div>
    );
}
