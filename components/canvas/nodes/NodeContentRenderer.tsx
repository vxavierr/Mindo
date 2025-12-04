import React, { useMemo } from 'react';
import { MemoryUnit } from '../../../types';

interface NodeContentRendererProps {
  content?: string;
  memoryUnits?: MemoryUnit[];
  isReviewMode: boolean;
  activeUnitId?: string | null; // Se estiver em review, qual unidade focar?
}

export function NodeContentRenderer({ content, memoryUnits, isReviewMode, activeUnitId }: NodeContentRendererProps) {
  
  // Parse HTML string e replace segmentos de texto com spans interativos
  // Nota: Em produção, usar um parser HTML real (ex: html-react-parser) é mais seguro.
  // Aqui faremos uma substituição de string simples para o protótipo.
  const renderedContent = useMemo(() => {
    if (!content) return null;
    
    let html = content;

    if (memoryUnits) {
        memoryUnits.forEach(unit => {
            const isActive = activeUnitId === unit.id;
            const isBlurMode = isReviewMode && !isActive; // Se estamos revisando e esta NÃO é a unidade ativa

            // Estilos para o marcador
            let highlightClass = "rounded px-1 transition-all duration-500 cursor-pointer ";
            
            if (isReviewMode) {
                if (isActive) {
                    highlightClass += "bg-mindo-glow text-black font-bold shadow-[0_0_15px_#38bdf8] scale-110 inline-block mx-1 ";
                } else {
                    highlightClass += "bg-transparent text-transparent blur-sm "; // Esconder outros destaques
                }
            } else {
                // Modo normal
                highlightClass += "bg-mindo-primary/20 hover:bg-mindo-primary/40 text-indigo-700 dark:text-mindo-accent border-b border-dashed border-mindo-primary ";
            }

            // Replace simples (cuidado: pode falhar se o texto existir em tags HTML)
            // Para demo funciona.
            const span = `<span id="mu-${unit.id}" class="${highlightClass}" title="${unit.question}">${unit.textSegment}</span>`;
            html = html.replace(unit.textSegment, span);
        });
    }

    // Se estiver em modo revisão, o texto geral (que não é memory unit) deve ficar borrado
    // Envolvemos o conteúdo num container que aplica o blur, mas as memory units ativas (que tem position relative/z-index) vão sobressair?
    // Não, CSS cascade é tricky. Melhor abordagem para o texto geral:
    // Aplicar uma classe no container pai que borra tudo, e o span ativo tenta anular? Não funciona bem.
    // Abordagem Simulada: O CSS abaixo "text-transparent" e "text-shadow" resolve o blur de texto sem afetar layout.
    
    return { __html: html };
  }, [content, memoryUnits, isReviewMode, activeUnitId]);

  if (!content) return <div className="text-slate-400 italic text-xs">No content.</div>;

  return (
    <div 
       className={`
         prose prose-sm dark:prose-invert max-w-none leading-relaxed
         transition-all duration-700
         ${isReviewMode ? 'blur-context' : ''} 
       `}
       dangerouslySetInnerHTML={renderedContent || { __html: '' }}
    />
  );
}