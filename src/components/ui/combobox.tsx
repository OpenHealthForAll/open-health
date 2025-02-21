"use client"

import * as React from "react"
import {cn} from "@/lib/utils"
import {useClickAway} from "@/hooks/use-click-away"
import {Input} from "@/components/ui/input"

export interface ComboboxProps {
    options: { value: string; label: string; searchTerms?: string }[]
    value?: string
    onValueChange?: (value: string) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyMessage?: string
    className?: string
}

export function Combobox({
                             options,
                             value,
                             onValueChange,
                             placeholder = "Type to search...",
                             emptyMessage = "No results found.",
                             className,
                         }: ComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const ref = React.useRef<HTMLDivElement>(null)

    // eslint-disable-next-line
    useClickAway(ref as any, () => setOpen(false))

    const filteredOptions = React.useMemo(() => {
        if (!searchQuery) return options;
        const query = searchQuery.toLowerCase();
        return options.filter(option => {
            const label = option.label.toLowerCase();
            const value = option.value.toLowerCase();
            const searchTerms = option.searchTerms?.toLowerCase() || '';

            return label.includes(query) ||
                value.includes(query) ||
                searchTerms.includes(query);
        });
    }, [options, searchQuery]);

    const handleInputChange = (value: string) => {
        setSearchQuery(value);
        setOpen(true);
        if (!value) {
            onValueChange?.('');
        }
    };

    const handleSelect = (selectedValue: string) => {
        const option = options.find(opt => opt.value === selectedValue);
        if (option) {
            onValueChange?.(selectedValue);
            setSearchQuery("");
            setOpen(false);
        }
    };

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div ref={ref} className={cn("relative", className)}>
            <Input
                value={selectedOption?.label || searchQuery}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={placeholder}
                onClick={() => {
                    setOpen(true);
                    if (selectedOption) {
                        setSearchQuery("");
                        onValueChange?.('');
                    }
                }}
            />
            {open && (
                <div
                    className="absolute top-full left-0 w-full z-50 bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
                    <div className="p-2">
                        {filteredOptions.length === 0 ? (
                            <div className="text-center py-2 text-gray-500">{emptyMessage}</div>
                        ) : (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={cn(
                                        "px-2 py-1 cursor-pointer rounded hover:bg-gray-100",
                                        value === option.value && "bg-gray-100"
                                    )}
                                    onClick={() => handleSelect(option.value)}
                                >
                                    {option.label}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 