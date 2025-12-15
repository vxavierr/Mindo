import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { MentionChip } from '../components/MentionChip';

export interface MentionNodeOptions {
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        mentionComponent: {
            insertMention: (attributes: { id: string; label: string }) => ReturnType;
        };
    }
}

export const MentionNode = Node.create<MentionNodeOptions>({
    name: 'mentionComponent',

    group: 'inline',

    inline: true,

    atom: true, // Cursor treats it as single unit

    selectable: true,

    draggable: false,

    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },

    addAttributes() {
        return {
            id: {
                default: null,
                parseHTML: element => element.getAttribute('data-id'),
                renderHTML: attributes => {
                    if (!attributes.id) return {};
                    return { 'data-id': attributes.id };
                },
            },
            label: {
                default: null,
                parseHTML: element => element.getAttribute('data-label'),
                renderHTML: attributes => {
                    if (!attributes.label) return {};
                    return { 'data-label': attributes.label };
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: `span[data-type="${this.name}"]`,
            },
        ];
    },

    renderHTML({ node, HTMLAttributes }) {
        return [
            'span',
            mergeAttributes(
                { 'data-type': this.name },
                this.options.HTMLAttributes,
                HTMLAttributes
            ),
            node.attrs.label || 'Unknown',
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(MentionChip);
    },

    addCommands() {
        return {
            insertMention:
                (attributes) =>
                    ({ commands }) => {
                        return commands.insertContent({
                            type: this.name,
                            attrs: attributes,
                        });
                    },
        };
    },
});
