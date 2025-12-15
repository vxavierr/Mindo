import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

export const MentionList = forwardRef((props: any, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectItem = (index: number) => {
        const item = props.items[index]

        if (item) {
            props.command({ id: item })
        }
    }

    const upHandler = () => {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
    }

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % props.items.length)
    }

    const enterHandler = () => {
        selectItem(selectedIndex)
    }

    useEffect(() => setSelectedIndex(0), [props.items])

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === 'ArrowUp') {
                upHandler()
                return true
            }

            if (event.key === 'ArrowDown') {
                downHandler()
                return true
            }

            if (event.key === 'Enter') {
                enterHandler()
                return true
            }

            return false
        },
    }))

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden min-w-[180px] p-1">
            {props.items.length ? (
                props.items.map((item: string, index: number) => (
                    <button
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${index === selectedIndex
                                ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                            }`}
                        key={index}
                        onClick={() => selectItem(index)}
                    >
                        {item}
                    </button>
                ))
            ) : (
                <div className="px-3 py-2 text-sm text-slate-400 italic">No result</div>
            )}
        </div>
    )
})

MentionList.displayName = 'MentionList'
