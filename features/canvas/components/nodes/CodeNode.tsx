import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import { Code2 } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { MindNodeData } from '../../types';
import { NeuralNodeWrapper } from './NeuralNodeWrapper';

/**
 * CodeNode - Renders code with syntax highlighting inside NeuralNodeWrapper
 * 
 * Uses react-syntax-highlighter with dracula theme.
 * Reads data.code and data.language fields.
 */
export const CodeNode = memo((props: NodeProps<MindNodeData>) => {
    const { id, data, selected } = props;

    const code = data.code || '// No code provided';
    const language = data.language || 'text';

    // Language display name mapping
    const languageLabels: Record<string, string> = {
        javascript: 'JavaScript',
        typescript: 'TypeScript',
        python: 'Python',
        java: 'Java',
        cpp: 'C++',
        csharp: 'C#',
        go: 'Go',
        rust: 'Rust',
        sql: 'SQL',
        html: 'HTML',
        css: 'CSS',
        json: 'JSON',
        yaml: 'YAML',
        markdown: 'Markdown',
        bash: 'Bash',
        text: 'Plain Text',
    };

    return (
        <NeuralNodeWrapper
            id={id}
            selected={selected ?? false}
            label={data.label || 'Snippet'}
            nodeType={data.type}
            width={(props as any).width || 280}
            height={(props as any).height || 150}
        >
            <div className="p-3">
                {/* Header with language badge */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-cyan-500/20">
                            <Code2 size={14} className="text-cyan-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-white truncate">
                            {data.label || 'Snippet'}
                        </h3>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">
                        {languageLabels[language] || language}
                    </span>
                </div>

                {/* Code Block */}
                <div className="rounded-lg overflow-hidden max-h-[200px] overflow-y-auto">
                    <SyntaxHighlighter
                        language={language}
                        style={dracula}
                        customStyle={{
                            margin: 0,
                            padding: '0.75rem',
                            fontSize: '0.7rem',
                            lineHeight: '1.4',
                            borderRadius: '0.5rem',
                            background: 'rgba(0, 0, 0, 0.3)',
                        }}
                        showLineNumbers={code.split('\n').length > 3}
                        wrapLines
                    >
                        {code}
                    </SyntaxHighlighter>
                </div>
            </div>
        </NeuralNodeWrapper>
    );
});

CodeNode.displayName = 'CodeNode';
