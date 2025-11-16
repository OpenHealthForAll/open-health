// TODO typesafe the form data
/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unused-vars */
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
import {HealthDataParserVisionModelListResponse} from "@/app/api/health-data-parser/visions/[id]/models/route";
import {HealthDataParserDocumentModelListResponse} from "@/app/api/health-data-parser/documents/[id]/models/route";
import {ConditionalDeploymentEnv} from "@/components/common/deployment-env";
import {useTranslations} from "next-intl";
import {countries} from "@/lib/countries";

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
    }
};

const personalInfoFields = (t: any, top: any): Field[] => {
    return [
        {key: 'name', label: t('name'), type: 'text'},
        {
            key: 'gender',
            label: top('gender.label'),
            type: 'select',
            options: [
                {value: 'male', label: top('gender.male')},
                {value: 'female', label: top('gender.female')}
            ]
        },
        {key: 'birthDate', label: t('birthdate'), type: 'date'},
        {
            key: 'height',
            label: t('height'),
            type: 'compound',
            fields: [
                {key: 'value', type: 'number', placeholder: t('height')},
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
            label: t('weight'),
            type: 'compound',
            fields: [
                {key: 'value', type: 'number', placeholder: t('weight')},
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
            key: 'ethnicity',
            label: top('ethnicity.label'),
            type: 'select',
            options: [
                {value: 'east_asian', label: top('ethnicity.options.east_asian')},
                {value: 'southeast_asian', label: top('ethnicity.options.southeast_asian')},
                {value: 'south_asian', label: top('ethnicity.options.south_asian')},
                {value: 'european', label: top('ethnicity.options.european')},
                {value: 'middle_eastern', label: top('ethnicity.options.middle_eastern')},
                {value: 'african', label: top('ethnicity.options.african')},
                {value: 'african_american', label: top('ethnicity.options.african_american')},
                {value: 'pacific_islander', label: top('ethnicity.options.pacific_islander')},
                {value: 'native_american', label: top('ethnicity.options.native_american')},
                {value: 'hispanic', label: top('ethnicity.options.hispanic')},
                {value: 'mixed', label: top('ethnicity.options.mixed')},
                {value: 'other', label: top('ethnicity.options.other')}
            ],
        },
        {
            key: 'country',
            label: top('country.label'),
            type: 'select',
            options: countries.map(({code: value, name: label}) => ({value, label})),
        },
        {
            key: 'bloodType',
            label: t('bloodType'),
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
        {key: 'familyHistory', label: t('familyHistory'), type: 'textarea'}
    ]
};

const symptomsFields = (t: any): Field[] => [
    {key: 'date', label: t('date'), type: 'date'},
    {key: 'endDate', label: t('endDate'), type: 'date'},
    {key: 'description', label: t('description'), type: 'textarea'}
];

const AddSourceDialog: React.FC<AddSourceDialogProps> = ({
                                                             isSetUpVisionParser,
                                                             isSetUpDocumentParser,
                                                             onFileUpload,
                                                             onAddSymptoms
                                                         }) => {
    const t = useTranslations('SourceManagement')

    const [open, setOpen] = useState(false);
    const [showSettingsAlert, setShowSettingsAlert] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

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

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (fileInputRef.current && e.dataTransfer.files) {
            fileInputRef.current.files = e.dataTransfer.files;
            const event = new Event('change', { bubbles: true });
            fileInputRef.current.dispatchEvent(event);
        }
    };

    const handleAddSymptoms = () => {
        const today = new Date().toISOString().split('T')[0];
        onAddSymptoms(today);
        setOpen(false);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full flex gap-2 items-center">
                        <Plus className="w-4 h-4"/>
                        {t('addSource')}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('addNewSource')}</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 min-w-[300px]">
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={cn(
                                "flex items-center gap-4 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                                isDragOver ? "border-primary bg-primary/5" : "border-gray-300 hover:bg-gray-50",
                                uploadStatus === 'uploading' && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <label
                                htmlFor="file-upload"
                                className="flex items-center gap-4 flex-1 cursor-pointer"
                            >
                                {uploadStatus === 'uploading' ? (
                                    <Loader2 className="h-6 w-6 text-gray-500 animate-spin flex-shrink-0"/>
                                ) : (
                                    <FileText className="w-6 h-6 text-gray-500 flex-shrink-0"/>
                                )}
                                <div className="flex-1">
                                    <h3 className="font-medium">{t('uploadFiles')}</h3>
                                    <p className="text-sm text-gray-500">{t('uploadFilesDescription')}</p>
                                </div>
                            </label>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            id="file-upload"
                            multiple
                            accept="image/png,image/jpeg,.pdf"
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
                                <h3 className="font-medium">{t('uploadSymptoms')}</h3>
                                <p className="text-sm text-gray-500">{t('uploadSymptomsDescription')}</p>
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
    const t = useTranslations('SourceManagement')

    const getIcon = (type: string) => {
        switch (type) {
            case HealthDataType.FILE.id:
                return <FileText className="h-5 w-5"/>;
            case HealthDataType.PERSONAL_INFO.id:
                return <User className="h-5 w-5"/>;
            case HealthDataType.SYMPTOMS.id:
                return <Activity className="h-5 w-5"/>;
            default:
                return <FileText className="h-5 w-5"/>;
        }
    };

    const getName = (type: string) => {
        if (type === HealthDataType.PERSONAL_INFO.id) {
            return t('personalInfo')
        } else if (type === HealthDataType.SYMPTOMS.id && healthData.data) {
            const data = healthData.data as unknown as SymptomsData;
            if (data.date) {
                return `${t('symptoms')} (${data.date})`;
            } else {
                return `${t('symptoms')}`;
            }
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
    const t = useTranslations('SourceManagement')
    const top = useTranslations('Onboarding.personalInfo');

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
                return personalInfoFields(t, top);
            case HealthDataType.SYMPTOMS.id:
                return symptomsFields(t);
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
                                        src={healthData.filePath}
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
                                        <Document file={healthData.filePath}
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
    const t = useTranslations('SourceManagement')

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [isOpen, setIsOpen] = useState(true);

    // Vision Parser
    const [visionParser, setVisionParser] = useState<{ value: string; label: string }>()
    const [visionParserModel, setVisionParserModel] = useState<{ value: string; label: string }>()
    const [visionParserApiKey, setVisionParserApiKey] = useState<string>('')
    const [visionParserApiUrl, setVisionParserApiUrl] = useState<string>('')

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

    const {data: visionModelDataList} = useSWR<HealthDataParserVisionModelListResponse>(
        `/api/health-data-parser/visions/${visionParser?.value}/models?apiUrl=${visionParserApiUrl}`,
        (url: string) => fetch(url).then((res) => res.json()),
    )

    const {data: documentDataList} = useSWR<HealthDataParserDocumentListResponse>(
        '/api/health-data-parser/documents',
        (url: string) => fetch(url).then((res) => res.json()),
    )

    const {data: documentModelDataList} = useSWR<HealthDataParserDocumentModelListResponse>(
        `/api/health-data-parser/documents/${documentParser?.value}/models`,
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
                if (visionParserApiUrlRequired) formData.append('visionParserApiUrl', visionParserApiUrl);

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

    const visionParserApiKeyRequired: boolean = useMemo(() => {
        return visionDataList?.visions?.find(v => v.name === visionParser?.value)?.apiKeyRequired || false;
    }, [visionDataList, visionParser]);

    const documentParserApiKeyRequired: boolean = useMemo(() => {
        return documentDataList?.documents?.find(d => d.name === documentParser?.value)?.apiKeyRequired || false;
    }, [documentDataList, documentParser]);

    const visionParserApiUrlRequired: boolean = useMemo(() => {
        return visionDataList?.visions?.find(v => v.name === visionParser?.value)?.apiUrlRequired || false;
    }, [visionDataList, visionParser]);

    useEffect(() => {
        if (visionDataList?.visions && visionParser === undefined) {
            const {name} = visionDataList.visions[0];
            setVisionParser({value: name, label: name})
            setVisionParserModel(undefined)
            setVisionParserApiUrl('')
        }
    }, [visionDataList, visionParser]);

    useEffect(() => {
        if (visionModelDataList?.models && visionModelDataList.models.length > 0 && visionParserModel === undefined) {
            const {name} = visionModelDataList.models[0];
            setVisionParserModel({value: name, label: name})
        }
    }, [visionModelDataList, visionParser, visionParserModel]);

    useEffect(() => {
        if (documentDataList?.documents && documentParser === undefined) {
            const {name} = documentDataList.documents[0];
            setDocumentParser({value: name, label: name})
            setDocumentParserModel(undefined)
        }
    }, [documentDataList, documentParser]);

    useEffect(() => {
        if (documentModelDataList?.models && documentParserModel === undefined) {
            const {id, name} = documentModelDataList.models[0];
            setDocumentParserModel({value: id, label: name})
        }
    }, [documentModelDataList, documentParserModel]);

    return (
        <div className="flex flex-col h-screen">
            <div className="h-14 border-b px-4 flex items-center justify-between">
                <h1 className="text-base font-semibold">{t('title')}</h1>
            </div>
            <div className="flex flex-1 overflow-hidden">
                <div className="w-80 border-r flex flex-col min-h-0">
                    <div className="p-4 flex flex-col gap-4 flex-shrink-0">
                        <AddSourceDialog
                            isSetUpVisionParser={visionParser !== undefined && visionParserModel !== undefined && (!visionParserApiKeyRequired || visionParserApiKey.length > 0)}
                            isSetUpDocumentParser={documentParser !== undefined && documentParserModel !== undefined && (!documentParserApiKeyRequired || documentParserApiKey.length > 0)}
                            onFileUpload={handleFileUpload}
                            onAddSymptoms={handleAddSymptoms}/>
                    </div>
                    <div className="flex-1 overflow-y-auto min-h-0 px-4">
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
                                <h2 className="text-sm font-medium">{t('parsingSettings')}</h2>
                                <Button variant="ghost" onClick={() => setIsOpen(false)}>
                                    <ChevronRight className="h-4 w-4"/>
                                </Button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <div className="p-4 space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        {t('parsingSettingsDescription')}
                                    </p>

                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-sm font-medium mb-2">{t('visionModel')}</h3>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                {t('visionModelDescription')}
                                            </p>
                                            <div className="space-y-2">
                                                <Select
                                                    className="basic-single text-sm"
                                                    classNamePrefix="select"
                                                    isSearchable={false}
                                                    value={visionParser}
                                                    onChange={(selected: any) => {
                                                        setVisionParser(selected)
                                                        setVisionParserModel(undefined)

                                                        // Update API Url
                                                        const parser = visionDataList?.visions?.find(v => v.name === selected.value)
                                                        if (parser?.apiUrlRequired && parser?.apiUrl) {
                                                            setVisionParserApiUrl(parser.apiUrl)
                                                        } else {
                                                            setVisionParserApiUrl('')
                                                        }
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
                                                    placeholder={t('selectModel')}
                                                    value={visionParserModel}
                                                    onChange={(selected: any) => setVisionParserModel(selected)}
                                                    options={visionModelDataList?.models?.map((model) => ({
                                                        value: model.id,
                                                        label: model.name
                                                    }))}
                                                />

                                                <ConditionalDeploymentEnv env={['local']}>
                                                    {visionDataList?.visions?.find(v => v.name === visionParser?.value)?.apiKeyRequired && (
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium">{t('apiKey')}</label>
                                                            <input
                                                                type="password"
                                                                aria-autocomplete={'none'}
                                                                autoComplete={'off'}
                                                                placeholder={t('enterYourAPIKey')}
                                                                className="w-full p-2 border rounded-md text-sm"
                                                                value={visionParserApiKey}
                                                                onChange={(e) => setVisionParserApiKey(e.target.value)}
                                                            />
                                                        </div>
                                                    )}

                                                    {visionDataList?.visions?.find(v => v.name === visionParser?.value)?.apiUrlRequired && (
                                                        <div className="space-y-2">
                                                            <input
                                                                aria-autocomplete={'none'}
                                                                autoComplete={'off'}
                                                                placeholder={t('enterYourAPIUrl')}
                                                                className="w-full p-2 border rounded-md text-sm"
                                                                value={visionParserApiUrl}
                                                                onChange={(e) => setVisionParserApiUrl(e.target.value)}
                                                            />
                                                        </div>
                                                    )}
                                                </ConditionalDeploymentEnv>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-medium mb-2">{t('documentModel')}</h3>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                <span className="block mb-2">
                                                    {t('documentModelDescription')}{' '}
                                                    <a href="https://github.com/DS4SD/docling"
                                                       className="text-primary hover:underline" target="_blank"
                                                       rel="noopener noreferrer">
                                                        {t('documentModelDoclingGithub')}
                                                    </a>
                                                </span>
                                                <span className="block">
                                                        {t('documentModelUpstageDescription')}{' '}
                                                    <a href="https://www.upstage.ai"
                                                       className="text-primary hover:underline" target="_blank"
                                                       rel="noopener noreferrer">
                                                        {t('documentModelUpstage')}
                                                        </a>
                                                    {' '} {t('documentModelUpstageDescription2')}
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
                                                    placeholder={t('selectModel')}
                                                    value={documentParserModel}
                                                    onChange={(selected: any) => {
                                                        setDocumentParserModel(selected)
                                                    }}
                                                    options={documentModelDataList?.models?.map((model: any) => ({
                                                        value: model.id,
                                                        label: model.name
                                                    }))}
                                                />

                                                <ConditionalDeploymentEnv env={['local']}>
                                                    {documentDataList?.documents?.find(v => v.name === documentParser?.value)?.apiKeyRequired && (
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium">{t('apiKey')}</label>
                                                            <input
                                                                type="password"
                                                                placeholder={t('enterYourAPIKey')}
                                                                className="w-full p-2 border rounded-md text-sm"
                                                                value={documentParserApiKey}
                                                                onChange={(e) => setDocumentParserApiKey(e.target.value)}
                                                            />
                                                        </div>
                                                    )}
                                                </ConditionalDeploymentEnv>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-12 flex items-center justify-center border-t">
                            <Button variant="ghost" onClick={() => setIsOpen(true)}>
                                <ChevronLeft className="h-4 w-4"/>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
