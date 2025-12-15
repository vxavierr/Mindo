import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance } from 'tippy.js';
import { MentionList } from '../components/MentionList';
import { SuggestionOptions, SuggestionProps } from '@tiptap/suggestion';
import { MindNode } from '../../canvas/types';

interface MentionSuggestionOptions {
    nodes: MindNode[];
    currentNodeId: string;
    onSelect: (node: MindNode) => void;
}

export function createMentionSuggestion({ nodes, currentNodeId, onSelect }: MentionSuggestionOptions): Omit<SuggestionOptions, 'editor'> {
    return {
        char: '@',
        allowSpaces: false,

        items: ({ query }) => {
            return nodes
                .filter(n => n.id !== currentNodeId)
                .filter(n => n.data.label.toLowerCase().includes(query.toLowerCase()))
                .slice(0, 6)
                .map(n => ({ id: n.id, label: n.data.label, node: n }));
        },

        render: () => {
            let component: ReactRenderer | null = null;
            let popup: Instance[] | null = null;

            return {
                onStart: (props: SuggestionProps) => {
                    component = new ReactRenderer(MentionList, {
                        props: {
                            ...props,
                            items: props.items.map((item: any) => item.label),
                            command: (payload: { id: string }) => {
                                const selectedItem = props.items.find((item: any) => item.label === payload.id);
                                if (selectedItem) {
                                    onSelect((selectedItem as any).node);
                                }
                            },
                        },
                        editor: props.editor,
                    });

                    if (!props.clientRect) return;

                    popup = tippy('body', {
                        getReferenceClientRect: props.clientRect as () => DOMRect,
                        appendTo: () => document.body,
                        content: component.element,
                        showOnCreate: true,
                        interactive: true,
                        trigger: 'manual',
                        placement: 'bottom-start',
                    });
                },

                onUpdate(props: SuggestionProps) {
                    if (!component) return;

                    component.updateProps({
                        ...props,
                        items: props.items.map((item: any) => item.label),
                        command: (payload: { id: string }) => {
                            const selectedItem = props.items.find((item: any) => item.label === payload.id);
                            if (selectedItem) {
                                onSelect((selectedItem as any).node);
                            }
                        },
                    });

                    if (popup && props.clientRect) {
                        popup[0].setProps({
                            getReferenceClientRect: props.clientRect as () => DOMRect,
                        });
                    }
                },

                onKeyDown(props: { event: KeyboardEvent }) {
                    if (props.event.key === 'Escape') {
                        popup?.[0]?.hide();
                        return true;
                    }

                    return (component?.ref as any)?.onKeyDown?.(props) ?? false;
                },

                onExit() {
                    popup?.[0]?.destroy();
                    component?.destroy();
                },
            };
        },
    };
}
