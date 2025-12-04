import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EditorContextType {
  hoveredUnitId: string | null;
  setHoveredUnitId: (id: string | null) => void;
  isSuggesting: boolean;
  setIsSuggesting: (loading: boolean) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children?: ReactNode }) {
  const [hoveredUnitId, setHoveredUnitId] = useState<string | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);

  return (
    <EditorContext.Provider value={{ 
      hoveredUnitId, 
      setHoveredUnitId,
      isSuggesting,
      setIsSuggesting
    }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditorContext() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditorContext must be used within an EditorProvider');
  }
  return context;
}