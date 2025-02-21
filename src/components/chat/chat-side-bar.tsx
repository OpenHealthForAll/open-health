/* eslint-disable @typescript-eslint/no-unused-vars,@typescript-eslint/no-explicit-any */
'use client';

import React, {useMemo, useState} from "react";
import useSWR from "swr";
import {ChatRoom, ChatRoomListResponse} from "@/app/api/chat-rooms/route";
import {Button} from "@/components/ui/button";
import {Copy, Download, Files, FileText, MessageCircle, Trash2} from "lucide-react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {HealthDataListResponse} from "@/app/api/health-data/route";
import dayjs from "@/lib/dayjs";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import JSONEditor from "@/components/form/json-editor";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,} from "@/components/ui/tooltip"
import {useTranslations} from "next-intl";

interface ChatSideBarProps {
    isLeftSidebarOpen: boolean;
    chatRoomId: string;
}

export default function ChatSideBar({
                                        chatRoomId,
                                        isLeftSidebarOpen
                                    }: ChatSideBarProps) {
    const t = useTranslations('ChatSideBar')
    const router = useRouter()
    const [jsonViewerOpen, setJsonViewerOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [chatToDelete, setChatToDelete] = useState<string | null>(null);

    const {data: chatRoomData, mutate: chatRoomMutate} = useSWR<ChatRoomListResponse>(
        '/api/chat-rooms',
        (url: string) => fetch(url).then(res => res.json())
    )

    const {data: healthDataListResponse} = useSWR<HealthDataListResponse>(
        '/api/health-data',
        (url: string) => fetch(url).then(res => res.json())
    )

    const healthDataList = useMemo(() => healthDataListResponse?.healthDataList || [], [healthDataListResponse])
    const chatRooms = useMemo(() => chatRoomData?.chatRooms || [], [chatRoomData])
    const totalTokens = useMemo(() => healthDataList.reduce((sum, source) => {
        if (typeof source.data === 'object' && source.data !== null && 'tokens' in source.data) {
            return sum + (source.data.tokens as number);
        }
        return sum;
    }, 0), [healthDataList]);

    const handleStartNewChat = async () => {
        const chatRoomResponse = await fetch('/api/chat-rooms', {method: 'POST'})
        const newChatRoom: ChatRoom = await chatRoomResponse.json();
        const oldChatRooms = chatRooms || []
        await chatRoomMutate({chatRooms: [newChatRoom, ...oldChatRooms]})
        router.push(`/chat/${newChatRoom.id}`)
    }

    const handleCopyToClipboard = () => {
        const cleanedData = {
            sources: healthDataList.map(({data, type}) => ({
                type,
                data: typeof data === 'object' && data !== null ?
                    (() => {
                        const {
                            parsingLogs: _,
                            id: __,
                            filePath: ___,
                            fileType: ____,
                            status: _____,
                            updatedAt: ______,
                            createdAt: _______,
                            ...cleanedContent
                        } = data as any;
                        return cleanedContent;
                    })()
                    : data
            }))
        };
        navigator.clipboard.writeText(JSON.stringify(cleanedData, null, 2));
    }

    const handleDownload = () => {
        const cleanedData = {
            sources: healthDataList.map(({data, type}) => ({
                type,
                data: typeof data === 'object' && data !== null ?
                    (() => {
                        const {
                            parsingLogs: _,
                            id: __,
                            filePath: ___,
                            fileType: ____,
                            status: _____,
                            updatedAt: ______,
                            createdAt: _______,
                            ...cleanedContent
                        } = data as any;
                        return cleanedContent;
                    })()
                    : data
            }))
        };
        const blob = new Blob([JSON.stringify(cleanedData, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'aggregated-sources.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        setChatToDelete(id);
        setDeleteDialogOpen(true);
    }

    const confirmDelete = async () => {
        if (!chatToDelete) return;

        await fetch(`/api/chat-rooms/${chatToDelete}`, {
            method: 'DELETE'
        });

        const updatedChatRooms = chatRooms.filter(room => room.id !== chatToDelete);
        await chatRoomMutate({chatRooms: updatedChatRooms}, false);

        if (chatRoomId === chatToDelete) {
            router.push('/');
        }

        setDeleteDialogOpen(false);
        setChatToDelete(null);
    }

    return <>
        <div className={`border-r bg-gray-50 flex flex-col transition-all duration-300 ease-in-out overflow-clip
          ${isLeftSidebarOpen ? 'w-72' : 'w-0'} relative`}>
            <div className={`absolute inset-0 ${isLeftSidebarOpen ? 'opacity-100' : 'opacity-0'} 
                transition-opacity duration-300 overflow-hidden flex flex-col`}>
                <div className="border-b bg-white">
                    <div className="p-4 space-y-3">
                        {healthDataList.length > 0 ? (
                            <>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-medium tracking-tight">{t('sources')}</h3>
                                        <div className="flex gap-3 text-xs text-gray-500">
                                            <span>{t('numberOfFiles', {value: healthDataList.length})}</span>
                                            <span>{t('countOfTokens', {value: totalTokens.toLocaleString()})}</span>
                                        </div>
                                    </div>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button size="sm" variant="ghost"
                                                        onClick={() => setJsonViewerOpen(true)}
                                                        className="h-7 hover:bg-gray-100">
                                                    <FileText className="w-3 h-3"/>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{t('viewAggregatedSources')}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <Button
                                    className="w-full justify-start"
                                    variant="outline"
                                    onClick={() => router.push('/source')}
                                >
                                    <Files className="w-3 h-3 mr-2"/>
                                    {t('manageSources')}
                                </Button>
                            </>
                        ) : (
                            <Button
                                className="w-full justify-start"
                                variant="outline"
                                onClick={() => router.push('/source')}
                            >
                                <Files className="w-3 h-3 mr-2"/>
                                {t('manageSources')}
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={handleStartNewChat}
                    >
                        <MessageCircle className="w-3 h-3 mr-2"/>
                        {t('newChat')}
                    </Button>

                    <div className="space-y-1">
                        {chatRooms?.map((chatRoom) => (
                            <Link
                                key={chatRoom.id}
                                className={`group block w-full text-left p-2.5 rounded-md text-sm hover:bg-gray-100 transition-colors relative
                                    ${chatRoomId === chatRoom.id ? 'bg-gray-100' : ''}`}
                                href={`/chat/${chatRoom.id}`}
                            >
                                <div className="pr-8 font-medium truncate">{chatRoom.name}</div>
                                <div
                                    className="pr-8 text-xs text-gray-500 mt-0.5">{dayjs(chatRoom.lastActivityAt).format('L LT')}</div>
                                <Button
                                    variant="ghost"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 h-7 w-7"
                                    onClick={(e) => handleDeleteChat(chatRoom.id, e)}
                                >
                                    <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500"/>
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            {!isLeftSidebarOpen && (
                <div className="flex flex-col items-center pt-4 gap-4">
                    <Button variant="ghost">
                        <Files className="h-4 w-4"/>
                    </Button>
                    <Button variant="ghost">
                        <MessageCircle className="h-4 w-4"/>
                    </Button>
                </div>
            )}
        </div>

        <Dialog open={jsonViewerOpen} onOpenChange={setJsonViewerOpen}>
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle>{t('aggregatedSources')}</DialogTitle>
                    <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={handleCopyToClipboard}>
                            <Copy className="w-4 h-4 mr-2"/>
                            {t('copy')}
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleDownload}>
                            <Download className="w-4 h-4 mr-2"/>
                            {t('download')}
                        </Button>
                    </div>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto min-h-0">
                    <JSONEditor
                        data={{
                            sources: healthDataList.map(({data, type}) => ({
                                type,
                                data: typeof data === 'object' && data !== null ?
                                    (() => {
                                        const {
                                            parsingLogs: _,
                                            id: __,
                                            filePath: ___,
                                            fileType: ____,
                                            status: _____,
                                            updatedAt: ______,
                                            createdAt: _______,
                                            ...cleanedContent
                                        } = data as any;
                                        return cleanedContent;
                                    })()
                                    : data
                            }))
                        }}
                        onSave={() => {
                        }}
                        isEditable={false}
                    />
                </div>
            </DialogContent>
        </Dialog>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold tracking-tight">{t('chatDeleteTitle')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-1.5 py-3">
                    <p className="text-sm">{t('chatDeleteMessage')}</p>
                    <p className="text-xs text-gray-500">{t('chatDeleteMessageDetail')}</p>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => setDeleteDialogOpen(false)}
                        className="text-sm"
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={confirmDelete}
                        className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-900"
                    >
                        {t('delete')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>;
}

