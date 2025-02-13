'use client';

import {Document, Page, pdfjs} from 'react-pdf';
import React, {ChangeEvent, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Activity, ChevronLeft, ChevronRight, FileText, Loader2, Plus, Trash2, User} from 'lucide-react';
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,} from "@/components/ui/dialog";
import useSWR from "swr";
import {HealthData, HealthDataCreateResponse, HealthDataListResponse} from "@/app/api/health-data/route";
import DynamicForm from '../form/dynamic-form';
import JSONEditor from '../form/json-editor';
import cuid from "cuid";
import {cn} from "@/lib/utils";
import Image from "next/image";
import {FaChevronLeft, FaChevronRight} from 'react-icons/fa';
import testItems from '@/lib/health-data/parser/test-items.json'
import TextInput from "@/components/form/text-input";
import dynamic from "next/dynamic";
import {HealthDataParserVisionListResponse} from "@/app/api/health-data-parser/visions/route";
import {HealthDataGetResponse} from "@/app/api/health-data/[id]/route";
import {HealthDataParserDocumentListResponse} from "@/app/api/health-data-parser/documents/route";
import { getAuthUrl, getToken } from '@/lib/google-health/auth';
import { getGoogleHealthData } from '@/lib/google-health/data';

const Select = dynamic(() => import('react-select'), {ssr: false});

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface BoundingBox {
    vertices: { x: number, y: number }[]
}

interface Word {
    boundingBox: BoundingBox,
    confidence: number,
    id: number,
    text: string,
}

interface SymptomsData {
    date: string;
    description: string;
}

interface Field {
    key: string;
    label?: string;
    type: string;
    fields?: Field[];
    options?: { value: string; label: string }[];
    defaultValue?: string;
    placeholder?: string;
}

interface AddSourceDialogProps {
    onFileUpload: (e: ChangeEvent<HTMLInputElement>) => void;
    onAddSymptoms: (date: string) => void;
    onImportGoogleHealthData: () => void;
    isSetUpVisionParser: boolean;
    isSetUpDocumentParser: boolean;
}

interface HealthDataItemProps {
    healthData: HealthData;
    isSelected: boolean;
    onClick: () => void;
    onDelete: (id: string) => void;
}

interface HealthDataPreviewProps {
    healthData: HealthData;
    formData: Record<string, any>;
    setFormData: (data: Record<string, any>) => void;
    setHealthData?: (data: HealthData) => void;
}

interface ParsingSettings {
    description: string;
    visionModel: {
        company: 'ollama' | 'google' | 'openai';
        modelName: string;
        apiKey?: string;
    };
    ocrModel: {
        company: 'docling' | 'upstage';
        modelName?: string;
        apiKey?: string;
    };
}

interface ParsingSettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (settings: ParsingSettings) => void;
}

const HealthDataType = {
    FILE: {
        id: 'FILE',
        name: 'File'
    },
    PERSONAL_INFO: {
        id: 'PERSONAL_INFO',
        name: 'Personal Info'
    },
    SYMPTOMS: {
        id: 'SYMPTOMS',
        name: 'Symptoms'
    },
    GOOGLE_HEALTH: {
        id: 'GOOGLE_HEALTH',
        name: 'Google Health'
    }
};

const personalInfoFields: Field[] = [
    {key: 'name', label: 'Name', type: 'text'},
    {key: 'birthDate', label: 'Birth Date', type: 'date'},
    {
        key: 'height',
        label: 'Height',
        type: 'compound',
        fields: [
            {key: 'value', type: 'number', placeholder: 'Height'},
            {
                key: 'unit',
                type: 'select',
                options: [
                    {value: 'cm', label: 'cm'},
                    {value: 'ft', label: 'ft'}
                ],
                defaultValue: 'cm'
            }
        ]
    },
    {
        key: 'weight',
        label: 'Weight',
        type: 'compound',
        fields: [
            {key: 'value', type: 'number', placeholder: 'Weight'},
            {
                key: 'unit',
                type: 'select',
                options: [
                    {value: 'kg', label: 'kg'},
                    {value: 'lbs', label: 'lbs'}
                ],
                defaultValue: 'kg'
            }
        ]
    },
    {
        key: 'bloodType',
        label: 'Blood Type',
        type: 'select',
        options: [
            {value: 'A+', label: 'A+'},
            {value: 'A-', label: 'A-'},
            {value: 'B+', label: 'B+'},
            {value: 'B-', label: 'B-'},
            {value: 'O+', label: 'O+'},
            {value: 'O-', label: 'O-'},
            {value: 'AB+', label: 'AB+'},
            {value: 'AB-', label: 'AB-'}
        ]
    },
    {key: 'familyHistory', label: 'Family History', type: 'textarea'}
];

const symptomsFields: Field[] = [
    {key: 'date', label: 'Date', type: 'date'},
    {key: 'description', label: 'Description', type: 'textarea'}
];


const AddSourceDialog: React.FC<AddSourceDialogProps> = ({
                                                             isSetUpVisionParser,
                                                             isSetUpDocumentParser,
                                                             onFileUpload,
                                                             onAddSymptoms,
                                                             onImportGoogleHealthData
                                                         }) => {
    const [open, setOpen] = useState(false);
    const [showSettingsAlert, setShowSettingsAlert] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string>('');

    const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        try {
            if (!isSetUpVisionParser || !isSetUpDocumentParser) {
                setShowSettingsAlert(true);
                return;
            }

            setUploadStatus('uploading');
            onFileUpload(e);
            setOpen(false);
        } catch (error) {
            console.error('Failed to check settings:', error);
            setShowSettingsAlert(true);
        } finally {
            setUploadStatus('');
        }
    };

    const handleAddSymptoms = () => {
        const today = new Date().toISOString().split('T')[0];
        onAddSymptoms(today);
        setOpen(false);
    };

    const handleImportGoogleHealthData = async () => {
        onImportGoogleHealthData();
        setOpen(false);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full flex gap-2 items-center">
                        <Plus className="w-4 h-4"/>
                        Add Source
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Source</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 min-w-[300px]">
                        <label
                            htmlFor="file-upload"
                            className={cn(
                                "flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50",
                                uploadStatus === 'uploading' && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {uploadStatus === 'uploading' ? (
                                <Loader2 className="h-6 w-6 text-gray-500 animate-spin"/>
                            ) : (
                                <FileText className="w-6 h-6 text-gray-500"/>
                            )}
                            <div className="flex-1">
                                <h3 className="font-medium">Upload Files</h3>
                                <p className="text-sm text-gray-500">Add images or PDF files</p>
                            </div>
                        </label>
                        <input
                            type="file"
                            id="file-upload"
                            multiple
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={uploadStatus === 'uploading'}
                        />

                        <button
                            className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 w-full"
                            onClick={handleAddSymptoms}
                        >
                            <Activity className="w-6 h-6 text-gray-500"/>
                            <div className="flex-1 text-left">
                                <h3 className="font-medium">New Symptoms</h3>
                                <p className="text-sm text-gray-500">Record today&#39;s symptoms</p>
                            </div>
                        </button>

                        <button
                            className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 w-full"
                            onClick={handleImportGoogleHealthData}
                        >
                            <Activity className="w-6 h-6 text-gray-500"/>
                            <div className="flex-1 text-left">
                                <h3 className="font-medium">Import Google Health Data</h3>
                                <p className="text-sm text-gray-500">Import data from Google Health</p>
                            </div>
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {showSettingsAlert && (
                <Dialog open={showSettingsAlert} onOpenChange={setShowSettingsAlert}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Settings Required</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <p className="text-sm">Please configure the parsing settings before uploading files. You
                                need to:</p>
                            <ul className="list-disc pl-4 text-sm space-y-2">
                                <li>Select your preferred Vision and OCR models</li>
                                <li>Enter the required API keys</li>
                            </ul>
                            <p className="text-sm">You can find these settings in the Parsing Settings panel on the
                                right.</p>
                            <div className="flex justify-end">
                                <Button onClick={() => setShowSettingsAlert(false)}>
                                    OK
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};

const HealthDataItem: React.FC<HealthDataItemProps> = ({healthData, isSelected, onClick, onDelete}) => {
    const getIcon = (type: string) => {
        switch (type) {
            case HealthDataType.FILE.id:
                return <FileText className="h-5 w-5"/>;
            case HealthDataType.PERSONAL_INFO.id:
                return <User className="h-5 w-5"/>;
            case HealthDataType.SYMPTOMS.id:
                return <Activity className="h-5 w-5"/>;
            case HealthDataType.GOOGLE_HEALTH.id:
                return <Activity className="h-5 w-5"/>;
            default:
                return <FileText className="h-5 w-5"/>;
        }
    };

    const getName = (type: string) => {
        if (type === HealthDataType.SYMPTOMS.id && healthData.data) {
            const data = healthData.data as unknown as SymptomsData;
            return `${HealthDataType.SYMPTOMS.name} (${data.date})`;
        }
        if (type === HealthDataType.FILE.id && healthData.data) {
            const data = healthData.data as any;
            return data.fileName || HealthDataType.FILE.name;
        }
        return Object.values(HealthDataType)
            .find((t) => t.id === type)?.name || '';
    };

    return (
        <div
            className={`flex items-center justify-between p-2 rounded cursor-pointer transition-all
${isSelected
                ? 'text-primary text-base font-semibold bg-primary/5'
                : 'text-sm hover:bg-gray-50'}`}
            onClick={onClick}
        >
            <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex-shrink-0">
                    {getIcon(healthData.type)}
                </div>
                <span className="truncate">{getName(healthData.type)}</span>
            </div>
            <div className="flex items-center gap-1">
                {healthData.status === 'PARSING' && (
                    <Loader2 className="h-5 w-5 animate-spin"/>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(healthData.id);
                    }}
                >
                    <Trash2 className="h-5 w-5"/>
                </Button>
            </div>
        </div>
    );
};

const HealthDataPreview = ({healthData, formData, setFormData, setHealthData}: HealthDataPreviewProps) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [numPages, setNumPages] = useState(0);
    const [page, setPage] = useState<number>(1);
    const [focusedItem, setFocusedItem] = useState<string | null>(null);
    const [inputFocusStates, setInputFocusStates] = useState<{ [key: string]: boolean }>({});
    const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    const [showAddFieldModal, setShowAddFieldModal] = useState<boolean>(false);
    const [showAddFieldName, setShowAddFieldName] = useState<{
        value: string;
        label: string;
        isDisabled?: boolean
    } | undefined>(undefined);

    const [userBloodTestResults, setUserBloodTestResults] = useState<{
        test_result: { [key: string]: { value: string, unit: string } }
    } | null>(null);

    const [userBloodTestResultsPage, setUserBloodTestResultsPage] = useState<{
        [key: string]: { page: number }
    } | null>(null);

    const {ocr, dataPerPage: sourceDataPerPage} = (healthData?.metadata || {}) as {
        ocr?: any,
        dataPerPage?: any
    };
    const [dataPerPage, setDataPerPage] = useState(sourceDataPerPage)

    const allInputsBlurred = Object.values(inputFocusStates).every((isFocused) => !isFocused);

    const handleFocus = (name: string) => {
        setFocusedItem(name);
        setInputFocusStates((prev) => ({...prev, [name]: true}));
    };

    const handleBlur = (name: string) => {
        if (focusedItem === name) setFocusedItem(null);
        setInputFocusStates((prev) => ({...prev, [name]: false}));
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, name: string) => {
        if (event.key === 'Enter') {
            const inputNames = Object.keys(inputRefs.current);
            const currentIndex = inputNames.indexOf(name);
            const nextInput = inputRefs.current[inputNames[currentIndex + 1]];
            if (nextInput) {
                nextInput.focus();
            } else {
                event.currentTarget.blur();
            }

        }
    };

    const getNearestBoundingBox = (a: BoundingBox, b: BoundingBox): number => {
        const aCenter = {
            x: a.vertices.reduce((acc, cur) => acc + cur.x, 0) / a.vertices.length,
            y: a.vertices.reduce((acc, cur) => acc + cur.y, 0) / a.vertices.length,
        }

        const bCenter = {
            x: b.vertices.reduce((acc, cur) => acc + cur.x, 0) / b.vertices.length,
            y: b.vertices.reduce((acc, cur) => acc + cur.y, 0) / b.vertices.length,
        }

        const aDistance = Math.sqrt(Math.pow(aCenter.x, 2) + Math.pow(aCenter.y, 2));
        const bDistance = Math.sqrt(Math.pow(bCenter.x, 2) + Math.pow(bCenter.y, 2));

        return aDistance - bDistance;
    }

    const getFocusedWords = useCallback((page: number, keyword: string): Word[] => {
        if (!keyword) return [];
        if (!ocr) return [];
        const ocrPageData: { words: Word[] } = ocr.pages[page - 1];
        if (!ocrPageData) return [];
        let eFields = ocrPageData.words.filter((word) => word.text === keyword)
        if (eFields.length === 0) {
            eFields = ocrPageData.words.filter((word) => word.text.includes(keyword))
        }
        return eFields.sort((a, b) => getNearestBoundingBox(a.boundingBox, b.boundingBox));
    }, [ocr]);

    const currentPageTestResults = useMemo(() => {
        if (!dataPerPage) return {}

        const {test_result} = formData as {
            test_result: { [key: string]: { value: string, unit: string } }
        }

        const entries = Object.entries(dataPerPage).filter(([, value]) => {
            if (!value) return false;
            const {page: fieldPage} = value as { page: number }
            return fieldPage === page
        }).map(([key,]) => key);

        if (!dataPerPage) return {};

        return Object.entries(dataPerPage).reduce((acc, [key, value]) => {
            const newValue = test_result[key] || {value: '', unit: ''};
            if (entries.includes(key)) {
                return {...acc, [key]: newValue}
            }
            return acc
        }, {})
    }, [page, dataPerPage, formData]);

    const sortedPageTestResults = useMemo(() => {
        return testItems
            .filter((item) => Object.entries(currentPageTestResults).some(([key, _]) => key === item.name))
            .sort((a, b) => {
                const aFocusedWords = userBloodTestResults?.test_result[a.name] ? getFocusedWords(page, userBloodTestResults?.test_result[a.name].value) : [];
                const bFocusedWords = userBloodTestResults?.test_result[b.name] ? getFocusedWords(page, userBloodTestResults?.test_result[b.name].value) : [];

                // focused words 에 좌표 정보가 없는게 있으면 가장 마지막 인덱스로 보내기
                if (aFocusedWords.length === 0) return 1;
                if (bFocusedWords.length === 0) return -1;

                return getNearestBoundingBox(aFocusedWords[0].boundingBox, bFocusedWords[0].boundingBox);
            })
    }, [getFocusedWords, page, currentPageTestResults, healthData, dataPerPage])

    const getFields = (): Field[] => {
        switch (healthData.type) {
            case HealthDataType.PERSONAL_INFO.id:
                return personalInfoFields;
            case HealthDataType.SYMPTOMS.id:
                return symptomsFields;
            default:
                return [];
        }
    };

    const handleFormChange = (key: string, value: any) => {
        const newData = {...formData, [key]: value};
        setFormData(newData);
    };

    const handleJSONSave = (newData: Record<string, any>) => {
        setFormData(newData);
    };

    const onDocumentLoadSuccess = async ({numPages}: pdfjs.PDFDocumentProxy) => {
        setLoading(true);
        setNumPages(numPages);
        setUserBloodTestResults(JSON.parse(JSON.stringify(healthData.data)));
        setUserBloodTestResultsPage(dataPerPage);
        setTimeout(() => {
            setLoading(false);
        }, 300);
    }

    useEffect(() => {
        let focusedWords: Word[];

        if (userBloodTestResultsPage && focusedItem !== null) {
            const resultPage = userBloodTestResultsPage[focusedItem];
            const result = userBloodTestResults?.test_result[focusedItem];
            if (!resultPage || !result) return;
            const {page} = resultPage;
            focusedWords = getFocusedWords(page, result.value);
        } else {
            focusedWords = Object.entries(currentPageTestResults).map(([_, value]) => {
                return getFocusedWords(page, (value as any).value);
            }).flat();
        }

        if (focusedWords && ocr) {
            const ocrPageMetadata = ocr.metadata.pages[page - 1];

            // pdf canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const element: HTMLElement | null = document.querySelector(`div[data-page-number="${page}"]`);
            if (!element) return;

            const pageElement = element.querySelector('canvas');
            if (!pageElement) return;

            canvas.width = pageElement.width;
            canvas.height = pageElement.height;
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = pageElement.style.width;
            canvas.style.height = pageElement.style.height;

            ctx.drawImage(pageElement, 0, 0);

            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;

            const paddingX = 5;
            const paddingY = 5;

            focusedWords.forEach((word) => {
                const {vertices} = word.boundingBox;

                const originalHeight = ocrPageMetadata.height;
                const originalWidth = ocrPageMetadata.width;

                const canvasWidth = pageElement.width;
                const canvasHeight = pageElement.height;

                const scaleX = canvasWidth / originalWidth;
                const scaleY = canvasHeight / originalHeight;

                ctx.beginPath();
                ctx.moveTo(vertices[0].x * scaleX - paddingX, vertices[0].y * scaleY - paddingY);
                ctx.lineTo(vertices[1].x * scaleX + paddingX, vertices[1].y * scaleY - paddingY);
                ctx.lineTo(vertices[2].x * scaleX + paddingX, vertices[2].y * scaleY + paddingY);
                ctx.lineTo(vertices[3].x * scaleX - paddingX, vertices[3].y * scaleY + paddingY);
                ctx.closePath();
                ctx.stroke();
            });

            element.style.position = 'relative';
            element.appendChild(canvas);

            return () => {
                element.removeChild(canvas);
            };
        }

    }, [loading, focusedItem, getFocusedWords, ocr, userBloodTestResults?.test_result, allInputsBlurred, page]);

    useEffect(() => {
        document.querySelector('#test-result')?.scrollTo(0, 0);
        document.querySelector('#pdf')?.scrollTo(0, 0);
    }, [page]);

    return (
        <>
            <div className="flex flex-col gap-4 h-full">
                <div className="h-[40%] min-h-[300px]">
                    <div className="bg-white h-full overflow-y-auto rounded-lg border">
                        {(healthData?.type === HealthDataType.PERSONAL_INFO.id || healthData?.type === HealthDataType.SYMPTOMS.id) ? (
                            <div className="p-4">
                                <DynamicForm
                                    fields={getFields()}
                                    data={formData}
                                    onChange={handleFormChange}
                                />
                            </div>
                        ) : healthData?.type === HealthDataType.FILE.id ? (
                            healthData?.fileType?.includes('image') && healthData?.filePath ? (
                                <div className="p-4">
                                    <Image
                                        src={`/api/static${healthData.filePath}`}
                                        alt="Preview"
                                        className="w-full h-auto"
                                        width={800}
                                        height={600}
                                        unoptimized
                                        style={{objectFit: 'contain'}}
                                    />
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-4 rounded-lg relative flex flex-row h-full">
                                    <div id="pdf" className="w-[60%] overflow-y-auto h-full">
                                        <Document file={`/api/static${healthData.filePath}`}
                                                  className="w-full"
                                                  onLoadSuccess={onDocumentLoadSuccess}>
                                            {Array.from(new Array(numPages), (_, index) => {
                                                return (
                                                    <Page
                                                        className={cn(
                                                            'w-full',
                                                            {hidden: index + 1 !== page}
                                                        )}
                                                        key={`page_${index + 1}`}
                                                        pageNumber={index + 1}
                                                        renderAnnotationLayer={false}
                                                        renderTextLayer={false}
                                                    />
                                                );
                                            })}
                                        </Document>
                                        <div
                                            className="relative w-fit bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-white p-2 rounded shadow">
                                            <button
                                                className="px-4 py-2 bg-gray-300 rounded"
                                                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                                disabled={page <= 1}
                                            >
                                                <FaChevronLeft/>
                                            </button>
                                            <span>{page} / {numPages}</span>
                                            <button
                                                className="px-4 py-2 bg-gray-300 rounded"
                                                onClick={() => setPage((prev) => Math.min(prev + 1, numPages))}
                                                disabled={page >= numPages}
                                            >
                                                <FaChevronRight/>
                                            </button>
                                        </div>
                                    </div>
                                    {userBloodTestResults?.test_result && <div
                                        id="test-result"
                                        className="w-[40%] overflow-y-auto p-4">
                                        {sortedPageTestResults.map((item) =>
                                            <TextInput
                                                key={item.name}
                                                name={item.name.replace(/(^\w|_\w)/g, (match) => match.replace('_', '').toUpperCase())}
                                                label={item.description}
                                                value={
                                                    userBloodTestResults && userBloodTestResults.test_result ? userBloodTestResults.test_result[item.name]?.value : ''
                                                }
                                                onChange={(v) => {
                                                    setUserBloodTestResults((prev) => {
                                                        return {
                                                            ...prev,
                                                            test_result: {
                                                                ...prev?.test_result,
                                                                [item.name]: {
                                                                    ...prev?.test_result[item.name],
                                                                    value: v.target.value,
                                                                }
                                                            }
                                                        } as any;
                                                    });
                                                    setFormData({
                                                        ...formData,
                                                        test_result: {
                                                            ...formData?.test_result,
                                                            [item.name]: {
                                                                ...formData?.test_result[item.name],
                                                                value: v.target.value,
                                                            }
                                                        }
                                                    })
                                                }}
                                                onDelete={() => {
                                                    setUserBloodTestResults((prev) => {
                                                        const {test_result} = prev ?? {test_result: {}};
                                                        delete test_result[item.name];
                                                        return {test_result};
                                                    });

                                                    // Delete From Metadata
                                                    setDataPerPage((prev: any) => {
                                                        delete prev[item.name]
                                                        return {...prev}
                                                    })

                                                    // Delete From FormData
                                                    delete formData.test_result[item.name]
                                                    setFormData(formData)

                                                    // Update Health Data
                                                    if (setHealthData) {
                                                        const metadata: any = healthData.metadata || {}
                                                        delete dataPerPage[item.name]
                                                        setHealthData({
                                                            ...healthData,
                                                            metadata: {...metadata, dataPerPage}
                                                        })
                                                    }
                                                }}
                                                onBlur={(v) => handleBlur(item.name)}
                                                onFocus={(v) => handleFocus(item.name)}
                                                onKeyDown={(e) => handleKeyDown(e, item.name)}
                                                ref={(el) => {
                                                    inputRefs.current[item.name] = el;
                                                }}
                                            />)}

                                        {healthData &&
                                            <div className="mt-4 w-full">
                                                <button
                                                    className="w-full py-2 bg-blue-500 text-white rounded"
                                                    onClick={() => {
                                                        setShowAddFieldName(undefined);
                                                        setShowAddFieldModal(true);
                                                    }}
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        }
                                    </div>}
                                </div>
                            )
                        ) : null}
                    </div>
                </div>

                <div className="flex-1">
                    <div className="bg-white rounded-lg border h-full flex flex-col gap-4">
                        <div className="flex-1 min-h-0 p-4">
                            <JSONEditor
                                data={formData}
                                onSave={handleJSONSave}
                                isEditable={healthData?.type === HealthDataType.FILE.id && healthData?.status === 'COMPLETED'}
                            />
                        </div>
                        {healthData?.type === HealthDataType.FILE.id && formData.parsingLogs && (
                            <div className="border-t">
                                <div className="p-4">
                                    <h3 className="text-sm font-medium mb-2">Processing Log</h3>
                                    <div
                                        className="h-[160px] bg-gray-50 p-3 rounded-lg text-sm font-mono overflow-y-auto">
                                        {(formData.parsingLogs as string[]).map((log, index) => (
                                            <div key={index} className="mb-1">
                                                {log}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {showAddFieldModal && <div
                className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50 flex justify-center items-center">
                {/* Input modal for adding, searchable dropdown to select a field, with confirm and cancel buttons */}
                <div className="bg-white p-4 rounded-lg flex flex-col w-[50vw]">
                    <p className="mb-4 font-bold">
                        Please select a field to add
                    </p>
                    <Select
                        className="basic-single"
                        classNamePrefix="select"
                        isDisabled={false}
                        isLoading={false}
                        isClearable={true}
                        isRtl={false}
                        isSearchable={true}
                        name="field"
                        options={testItems.map((bloodTestItem) => (
                            {
                                value: bloodTestItem.name,
                                label: `${bloodTestItem.name} (${bloodTestItem.description})`,
                                isDisabled: Object.entries(userBloodTestResults?.test_result ?? {}).filter(([_, value]) => value).map(([key, _]) => key).includes(bloodTestItem.name),
                            }
                        ))}
                        value={showAddFieldName}
                        onChange={(selectedOption) => {
                            if (selectedOption) {
                                setShowAddFieldName(selectedOption as {
                                    value: string;
                                    label: string;
                                    isDisabled?: boolean
                                });
                            } else {
                                setShowAddFieldName(undefined);
                            }
                        }}
                    />
                    <div className="flex flex-row gap-2 mt-4">
                        <p className={
                            cn(
                                'bg-blue-500 text-white py-2 px-4 rounded',
                                'hover:bg-blue-600',
                                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50',
                            )
                        }
                           onClick={() => {
                               if (showAddFieldName) {
                                   const value = showAddFieldName.value

                                   setUserBloodTestResults((prev) => {
                                       return {
                                           test_result: {
                                               ...prev?.test_result,
                                               [value]: {
                                                   value: '',
                                                   unit: '',
                                               }
                                           }
                                       } as any;
                                   });

                                   setDataPerPage({
                                       ...dataPerPage,
                                       [value]: {page: page}
                                   })
                                   setUserBloodTestResultsPage({
                                       ...userBloodTestResultsPage,
                                       [value]: {page: page}
                                   })

                                   setFormData(
                                       {
                                           ...formData,
                                           test_result: {
                                               ...formData?.test_result,
                                               [value]: {
                                                   value: '',
                                                   unit: '',
                                               }
                                           }
                                       }
                                   )

                                   // Update Health Data
                                   if (setHealthData) {
                                       const metadata: any = healthData.metadata || {}
                                       setHealthData({
                                           ...healthData,
                                           metadata: {
                                               ...metadata, dataPerPage: {
                                                   ...dataPerPage,
                                                   [value]: {page: page}
                                               }
                                           }
                                       })
                                   }

                               }
                               setShowAddFieldModal(false);
                           }}
                        >Add
                        </p>
                        <p className={
                            cn(
                                'bg-gray-300 text-black py-2 px-4 rounded',
                                'hover:bg-gray-400',
                                'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50',
                            )
                        }
                           onClick={() => setShowAddFieldModal(false)}
                        >Cancel</p>
                    </div>
                </div>
            </div>
            }
        </>
    );
};

export default function SourceAddScreen() {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [isOpen, setIsOpen] = useState(true);

    // Vision Parser
    const [visionParser, setVisionParser] = useState<{ value: string; label: string }>()
    const [visionParserModel, setVisionParserModel] = useState<{ value: string; label: string }>()
    const [visionParserApiKey, setVisionParserApiKey] = useState<string>('')

    // Document Parser
    const [documentParser, setDocumentParser] = useState<{ value: string; label: string }>()
    const [documentParserModel, setDocumentParserModel] = useState<{ value: string; label: string }>()
    const [documentParserApiKey, setDocumentParserApiKey] = useState<string>('')

    const {data: healthDataList, mutate} = useSWR<HealthDataListResponse>(
        '/api/health-data',
        (url: string) => fetch(url).then((res) => res.json()),
    );

    const {data: visionDataList} = useSWR<HealthDataParserVisionListResponse>(
        '/api/health-data-parser/visions',
        (url: string) => fetch(url).then((res) => res.json()),
    )

    const {data: documentDataList} = useSWR<HealthDataParserDocumentListResponse>(
        '/api/health-data-parser/documents',
        (url: string) => fetch(url).then((res) => res.json()),
    )

    const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        try {
            const files = Array.from(e.target.files);

            for (const file of files) {
                const id = cuid();
                const formData = new FormData();
                formData.append('file', file);
                formData.append('id', id);

                // Vision Parser
                if (visionParser?.value) formData.append('visionParser', visionParser.value);
                if (visionParserModel?.value) formData.append('visionParserModel', visionParserModel.value);
                if (visionParserApiKey) formData.append('visionParserApiKey', visionParserApiKey);

                // Document Parser
                if (documentParser?.value) formData.append('documentParser', documentParser.value);
                if (documentParserModel?.value) formData.append('documentParserModel', documentParserModel.value);
                if (documentParserApiKey) formData.append('documentParserApiKey', documentParserApiKey);

                // Add temporary entries to the list first
                await mutate({
                    healthDataList: [
                        ...healthDataList?.healthDataList || [],
                        {
                            id: id,
                            type: HealthDataType.FILE.id,
                            data: {fileName: file.name} as Record<string, any>,
                            metadata: {} as Record<string, any>,
                            status: 'PARSING',
                            filePath: null,
                            fileType: file.type,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }
                    ]
                }, {revalidate: false});

                // Request
                const response = await fetch('/api/health-data', {method: 'POST', body: formData});
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Failed to upload file:', {
                        fileName: file.name,
                        status: response.status,
                        error: errorText
                    });
                    continue;
                }

                const data: HealthDataCreateResponse = await response.json();
                console.log('File upload successful:', {fileName: file.name, response: data});

                // Start polling for parsing status
                if (data.id) {
                    let attempts = 0;
                    const maxAttempts = 30; // 30 seconds timeout
                    const pollInterval = setInterval(async () => {
                        try {
                            const statusResponse = await fetch(`/api/health-data/${data.id}`);
                            const {healthData: statusData}: HealthDataGetResponse = await statusResponse.json();
                            console.log('Parsing status check:', {
                                id: data.id,
                                status: statusData.status,
                                attempt: attempts + 1
                            });

                            if (statusData.status === 'COMPLETED' || statusData.status === 'ERROR' || attempts >= maxAttempts) {
                                clearInterval(pollInterval);
                                if (statusData.status === 'ERROR') {
                                    console.error('Parsing failed:', statusData);
                                } else if (statusData.status === 'COMPLETED') {
                                    console.log('Parsing completed successfully:', statusData);
                                }
                                await mutate();
                                setSelectedId(data.id);
                                setFormData(statusData.data as Record<string, any>);
                            }
                            attempts++;
                        } catch (error) {
                            console.error('Failed to check parsing status:', error);
                            clearInterval(pollInterval);
                        }
                    }, 1000); // Check every second
                }
            }
        } catch (error) {
            console.error('Failed to upload files:', error);
        }
    };

    const handleAddSymptoms = async (date: string) => {
        const now = new Date();
        const body = {
            id: cuid(),
            type: HealthDataType.SYMPTOMS.id,
            data: {
                date,
                description: ''
            } as Record<string, any>,
            status: 'COMPLETED',
            filePath: null,
            fileType: null,
            createdAt: now,
            updatedAt: now
        } as HealthData;

        try {
            const response = await fetch(`/api/health-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', errorText || 'Empty response');
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const text = await response.text();
            let newSource;
            try {
                newSource = text ? JSON.parse(text) : body;
            } catch (e) {
                console.error('Failed to parse response:', e);
                newSource = body;
            }

            setSelectedId(newSource.id);
            setFormData(newSource.data as Record<string, any>);
            await mutate({healthDataList: [...healthDataList?.healthDataList || [], newSource]});
        } catch (error) {
            console.error('Failed to add symptoms:', error);
            // Add the data anyway for better UX
            setSelectedId(body.id);
            setFormData(body.data as Record<string, any>);
            await mutate({healthDataList: [...healthDataList?.healthDataList || [], body]});
        }
    };

    const handleDeleteSource = async (id: string) => {
        await fetch(`/api/health-data/${id}`, {method: 'DELETE'});

        const newSources = healthDataList?.healthDataList.filter(s => s.id !== id) || [];
        await mutate({healthDataList: newSources});

        if (selectedId === id) {
            if (newSources.length > 0) {
                setSelectedId(newSources[0].id);
                setFormData(newSources[0].data as Record<string, any>);
            } else {
                setSelectedId(null);
                setFormData({})
            }
        }
    };

    const onChangeHealthData = async (data: HealthData) => {
        if (selectedId) {
            setSelectedId(data.id);
            setFormData(data.data as Record<string, any>);
            await fetch(`/api/health-data/${selectedId}`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            await mutate({
                healthDataList: healthDataList?.healthDataList?.map(s =>
                    s.id === selectedId
                        ? data
                        : s
                ) || []
            });
        }
    };

    const onChangeFormData = async (data: Record<string, any>) => {
        if (selectedId) {
            setFormData(data);
            await fetch(`/api/health-data/${selectedId}`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({data: data})
            });
            await mutate({
                healthDataList: healthDataList?.healthDataList?.map(s =>
                    s.id === selectedId
                        ? {...s, data: data}
                        : s
                ) || []
            });
        }
    };

    const handleImportGoogleHealthData = async () => {
        try {
            const authUrl = getAuthUrl();
            const authCode = prompt(`Please visit the following URL to authorize the app:\n\n${authUrl}\n\nThen enter the authorization code here:`);
            if (!authCode) {
                alert('Authorization code is required to import Google Health data.');
                return;
            }

            const tokens = await getToken(authCode);
            const healthData = await getGoogleHealthData(tokens.access_token);

            const now = new Date();
            const body = {
                id: cuid(),
                type: HealthDataType.GOOGLE_HEALTH.id,
                data: healthData,
                status: 'COMPLETED',
                filePath: null,
                fileType: null,
                createdAt: now,
                updatedAt: now
            } as HealthData;

            setSelectedId(body.id);
            setFormData(body.data as Record<string, any>);
            await mutate({healthDataList: [...healthDataList?.healthDataList || [], body]});
        } catch (error) {
            console.error('Failed to import Google Health data:', error);
            alert('Failed to import Google Health data. Please try again.');
        }
    };

    useEffect(() => {
        if (visionDataList?.visions && visionParser === undefined) {
            const {name, models} = visionDataList.visions[0];
            setVisionParser({value: name, label: name})
            setVisionParserModel({value: models[0].id, label: models[0].name})
        }
    }, [visionDataList, visionParser]);

    useEffect(() => {
        if (documentDataList?.documents && documentParser === undefined) {
            const {name, models} = documentDataList.documents[0];
            setDocumentParser({value: name, label: name})
            setDocumentParserModel({value: models[0].id, label: models[0].name})
        }
    }, [documentDataList, documentParser]);

    return (
        <div className="flex flex-col h-screen">
            <div className="h-14 border-b px-4 flex items-center justify-between">
                <h1 className="text-base font-semibold">Source Management</h1>
            </div>
            <div className="flex flex-1 overflow-hidden">
                <div className="w-80 border-r flex flex-col">
                    <div className="p-4 flex flex-col gap-4">
                        <AddSourceDialog
                            isSetUpVisionParser={visionParser !== undefined && visionParserModel !== undefined && visionParserApiKey.length > 0}
                            isSetUpDocumentParser={documentParser !== undefined && documentParserModel !== undefined && documentParserApiKey.length > 0}
                            onFileUpload={handleFileUpload}
                            onAddSymptoms={handleAddSymptoms}
                            onImportGoogleHealthData={handleImportGoogleHealthData}/>
                        <div className="flex-1 overflow-y-auto">
                            {healthDataList?.healthDataList?.map((item) => (
                                <HealthDataItem
                                    key={item.id}
                                    healthData={item}
                                    isSelected={selectedId === item.id}
                                    onClick={() => {
                                        if (item.status === 'PARSING') return;
                                        setSelectedId(item.id)
                                        setFormData(item.data as Record<string, any>)
                                    }}
                                    onDelete={handleDeleteSource}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto">
                    {selectedId && healthDataList?.healthDataList && (
                        <HealthDataPreview
                            key={selectedId}
                            healthData={healthDataList.healthDataList.find(s => s.id === selectedId) as HealthData}
                            formData={formData}
                            setFormData={onChangeFormData}
                            setHealthData={onChangeHealthData}
                        />
                    )}
                </div>

                <div className={cn(
                    "border-l transition-all duration-300 flex flex-col",
                    isOpen ? "w-96" : "w-12"
                )}>
                    {isOpen ? (
                        <>
                            <div className="h-12 px-4 flex items-center justify-between border-t">
                                <h2 className="text-sm font-medium">Parsing Settings</h2>
                                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                                    <ChevronRight className="h-4 w-4"/>
                                </Button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <div className="p-4 space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Vision and OCR models are used together to enhance parsing performance.
                                    </p>

                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-sm font-medium mb-2">Vision Model</h3>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                Only models with vision capabilities can be used.
                                            </p>
                                            <div className="space-y-2">
                                                <Select
                                                    className="basic-single text-sm"
                                                    classNamePrefix="select"
                                                    isSearchable={false}
                                                    value={visionParser}
                                                    onChange={(selected: any) => {
                                                        const model = visionDataList?.visions?.find(v => v.name === selected.value)?.models[0]
                                                        setVisionParser(selected)
                                                        setVisionParserModel(model && {
                                                            value: model.id,
                                                            label: model.name
                                                        })
                                                    }}
                                                    options={visionDataList?.visions?.map((vision) => ({
                                                        value: vision.name,
                                                        label: vision.name
                                                    }))}
                                                />

                                                <Select
                                                    className="basic-single text-sm"
                                                    classNamePrefix="select"
                                                    isSearchable={false}
                                                    placeholder="Select model"
                                                    value={visionParserModel}
                                                    onChange={(selected: any) => setVisionParserModel(selected)}
                                                    options={visionDataList?.visions?.find(v => v.name === visionParser?.value)?.models.map((model) => ({
                                                        value: model.id,
                                                        label: model.name
                                                    }))}
                                                />

                                                {visionParser?.value !== 'ollama' && (
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">API Key</label>
                                                        <input
                                                            type="password"
                                                            aria-autocomplete={'none'}
                                                            autoComplete={'off'}
                                                            placeholder="Enter your API key"
                                                            className="w-full p-2 border rounded-md text-sm"
                                                            value={visionParserApiKey}
                                                            onChange={(e) => setVisionParserApiKey(e.target.value)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-medium mb-2">Document Model</h3>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                {/*<span className="block mb-2">*/}
                                                {/*    Docling is an open-source parsing model that runs locally.{' '}*/}
                                                {/*    <a href="https://github.com/DS4SD/docling"*/}
                                                {/*       className="text-primary hover:underline" target="_blank"*/}
                                                {/*       rel="noopener noreferrer">*/}
                                                {/*        GitHub*/}
                                                {/*    </a>*/}
                                                {/*</span>*/}
                                                <span className="block">
                                                        Upstage showed the best performance in our tests.{' '}
                                                    <a href="https://www.upstage.ai"
                                                       className="text-primary hover:underline" target="_blank"
                                                       rel="noopener noreferrer">
                                                            Upstage
                                                        </a>
                                                    {' '}offers $10 free credit for new sign-ups, no card required.
                                                    </span>
                                            </p>
                                            <div className="space-y-2">
                                                <Select
                                                    className="basic-single text-sm"
                                                    classNamePrefix="select"
                                                    isSearchable={false}
                                                    value={documentParser}
                                                    onChange={(selected: any) => {
                                                        setDocumentParser(selected)
                                                    }}
                                                    options={documentDataList?.documents?.map((document) => ({
                                                        value: document.name,
                                                        label: document.name
                                                    }))}
                                                />

                                                <Select
                                                    className="basic-single text-sm"
                                                    classNamePrefix="select"
                                                    isSearchable={false}
                                                    placeholder="Select model"
                                                    value={documentParserModel}
                                                    onChange={(selected: any) => {
                                                        setDocumentParserModel(selected)
                                                    }}
                                                    options={documentDataList?.documents?.find(v => v.name === documentParser?.value)?.models.map((model) => ({
                                                        value: model.id,
                                                        label: model.name
                                                    }))}
                                                />

                                                {documentDataList?.documents?.find(v => v.name === documentParser?.value)?.apiKeyRequired && (
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">API Key</label>
                                                        <input
                                                            type="password"
                                                            placeholder="Enter your API key"
                                                            className="w-full p-2 border rounded-md text-sm"
                                                            value={documentParserApiKey}
                                                            onChange={(e) => setDocumentParserApiKey(e.target.value)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-12 flex items-center justify-center border-t">
                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
                                <ChevronLeft className="h-4 w-4"/>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
