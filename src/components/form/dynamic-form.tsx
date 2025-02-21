/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {useTranslations} from "next-intl";

interface Field {
    key: string;
    label?: string;
    type: string;
    fields?: Field[];
    options?: { value: string; label: string }[];
    defaultValue?: string;
    placeholder?: string;
}

interface DynamicFormProps {
    fields: Field[];
    data: Record<string, any>;
    onChange: (key: string, value: string | number | readonly string[] | undefined) => void;
}

export default function DynamicForm({fields, data, onChange}: DynamicFormProps) {
    const t = useTranslations('DynamicForm')
    return (
        <div className="space-y-4">
            {fields.map((field) => (
                <div key={field.key} className="space-y-2">
                    <label className="text-sm font-medium">{field.label}</label>
                    {field.type === 'textarea' ? (
                        <textarea
                            className={`w-full p-2 border rounded ${field.key === 'description' ? 'min-h-[200px]' : 'min-h-[100px]'}`}
                            value={data[field.key] || ''}
                            onChange={(e) => onChange(field.key, e.target.value)}
                        />
                    ) : field.type === 'select' ? (
                        <select
                            className="w-full p-2 border rounded"
                            value={data[field.key] || field.defaultValue || ''}
                            onChange={(e) => onChange(field.key, e.target.value)}
                        >
                            <option value="">{t('selectPlaceholder')}</option>
                            {field.options?.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    ) : field.type === 'compound' ? (
                        <div className="flex gap-2">
                            {field.fields?.map((subField) => (
                                <div key={subField.key} className="flex-1">
                                    {subField.type === 'select' ? (
                                        <select
                                            className="w-full p-2 border rounded"
                                            value={data[field.key]?.[subField.key] || subField.defaultValue || ''}
                                            onChange={(e) => {
                                                const currentValue = data[field.key] || {};
                                                let newValue = {...currentValue, [subField.key]: e.target.value};
                                                if (field.fields?.some(f => f.defaultValue && !currentValue[f.key])) {
                                                    field.fields.forEach(f => {
                                                        if (f.defaultValue && !currentValue[f.key]) {
                                                            newValue = {...newValue, [f.key]: f.defaultValue}
                                                        }
                                                    });
                                                }
                                                onChange(field.key, newValue);
                                            }}
                                        >
                                            {subField.options?.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type={subField.type}
                                            placeholder={subField.placeholder}
                                            className="w-full p-2 border rounded"
                                            value={data[field.key]?.[subField.key] || ''}
                                            onChange={(e) => {
                                                const currentValue = data[field.key] || {};
                                                let newValue = {...currentValue, [subField.key]: e.target.value};
                                                if (field.fields?.some(f => f.defaultValue && !currentValue[f.key])) {
                                                    field.fields.forEach(f => {
                                                        if (f.defaultValue && !currentValue[f.key]) {
                                                            newValue = {...newValue, [f.key]: f.defaultValue}
                                                        }
                                                    });
                                                }
                                                onChange(field.key, newValue);
                                            }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <input
                            type={field.type}
                            className="w-full p-2 border rounded"
                            value={data[field.key] || ''}
                            onChange={(e) => onChange(field.key, e.target.value)}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};
