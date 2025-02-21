import {useRef, useState} from 'react';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Button} from '@/components/ui/button';
import {useTranslations} from 'next-intl';

interface MedicalRecordsProps {
    value: File[];
    onValueChange: (newFiles: File[]) => void;
}

export default function MedicalRecords({value, onValueChange}: MedicalRecordsProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [dragActive, setDragActive] = useState(false);

    const t = useTranslations('Onboarding.medicalRecords');

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        onValueChange([...value, ...droppedFiles]);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            onValueChange([...value, ...Array.from(e.target.files)]);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const removeFile = (index: number) => {
        onValueChange(value.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-8">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">{t('title')}</h2>
                <p className="text-gray-600">{t('description')}</p>
            </div>

            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center ${
                    dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-center">
                        <svg
                            className="w-12 h-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                    </div>
                    <div>
                        <p className="text-lg font-medium">{t('dragDrop.title')}</p>
                        <p className="text-sm text-gray-500">{t('dragDrop.or')}</p>
                    </div>
                    <div>
                        <Label htmlFor="file-upload" className="cursor-pointer">
                            <Input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                onChange={handleFileInput}
                                multiple
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                ref={fileInputRef}
                            />
                            <Button type="button" variant="outline" onClick={handleButtonClick}>
                                {t('dragDrop.browse')}
                            </Button>
                        </Label>
                    </div>
                    <p className="text-sm text-gray-500">
                        {t('dragDrop.supportedFormats')}
                    </p>
                </div>
            </div>

            {value.length > 0 && (
                <div className="space-y-4">
                    <h3 className="font-medium">Selected Files:</h3>
                    <div className="space-y-2">
                        {value.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                                <span className="truncate">{file.name}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}