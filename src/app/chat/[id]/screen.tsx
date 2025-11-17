'use client'

import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Menu, Send, Settings} from 'lucide-react';
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import LogoutButton from "@/components/auth/logout-button";

import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import ChatSideBar from "@/components/chat/chat-side-bar";
import ChatMessage from "@/components/chat/chat-message";
import useSWR from "swr";
import {useParams} from "next/navigation";
import {ChatMessageListResponse} from "@/app/api/chat-rooms/[id]/messages/route";
import {ChatRole} from "@prisma/client";
import ChatSettingSideBar from "@/components/chat/chat-setting-side-bar";
import {useTranslations} from "next-intl";
import {NavLinks} from "@/components/ui/nav-links";

interface ScreenProps {
    isMobile: boolean;
}

export default function Screen(
    {isMobile}: ScreenProps
) {
    const {id} = useParams<{ id: string }>();
    const t = useTranslations('Chat')

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [inputText, setInputText] = useState('');
    const [sources] = useState([]);
    const [isJsonViewerOpen, setIsJsonViewerOpen] = useState(false);
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(!isMobile);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(!isMobile);
    const [showFeedbackBanner, setShowFeedbackBanner] = useState<boolean>();

    const {data, mutate} = useSWR<ChatMessageListResponse>(`/api/chat-rooms/${id}/messages`, async (url: string) => {
        const response = await fetch(url);
        return response.json();
    });
    const messages = useMemo(() => data?.chatMessages || [], [data]);

    useEffect(() => {
        if (showFeedbackBanner === undefined) {
            setShowFeedbackBanner(!localStorage.getItem('feedbackBannerClosed'));
        }
    }, [showFeedbackBanner]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({behavior: 'smooth'});
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        // Clear input
        setInputText('');

        const oldMessages = [...messages, {
            id: new Date().toISOString(),
            content: inputText,
            role: 'USER' as ChatRole,
            createdAt: new Date(),
        }];
        await mutate({chatMessages: oldMessages}, {revalidate: false});

        const response = await fetch(`/api/chat-rooms/${id}/messages`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                content: inputText,
                role: 'USER',
            })
        });

        // Read as a stream
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        const createdAt = new Date()
        if (reader) {
            let done = false;
            while (!done) {
                const {value, done: isDone} = await reader.read();
                done = isDone;
                const content = decoder.decode(value, {stream: !done});
                for (const data of content.split('\n').filter(Boolean)) {
                    const {content, error}: { content?: string, error?: string } = JSON.parse(data)
                    if (error) {
                        console.error('Error from LLM:', error);
                        continue;
                    }
                    if (content) {
                        await mutate({
                            chatMessages: [
                                ...oldMessages,
                                {id: new Date().toISOString(), content: content, role: 'ASSISTANT', createdAt}
                            ]
                        }, {revalidate: false});
                    }
                }
            }
            await mutate();
        }
    };

    return (
        <div className="h-screen flex flex-col">
            <div className="bg-white dark:bg-zinc-900 border-b h-14 flex items-center px-4 shrink-0">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="default" onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}>
                        <Menu className="w-4 h-4"/>
                    </Button>
                    <h1 className="text-lg font-semibold">OpenHealth</h1>
                </div>
                <div className="flex-1"/>
                <div className="flex items-center gap-4">
                    <NavLinks/>
                    <div className="flex items-center gap-1">
                        <LogoutButton/>
                        <Button variant="ghost" size="default" onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}>
                            <Settings className="w-4 h-4"/>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <ChatSideBar chatRoomId={id} isLeftSidebarOpen={isLeftSidebarOpen}/>

                <div className="flex-1 flex flex-col bg-white min-w-0">
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {messages.map((message, index) => (
                            <ChatMessage key={index} message={message}/>
                        ))}
                        <div ref={messagesEndRef}/>
                    </div>
                    <div className="border-t mb-16 md:mb-0">
                        <div className="border-t p-4 z-10 md:static fixed bottom-0 left-0 w-full bg-white">
                            <div className="flex gap-2">
                                <Input
                                    placeholder={t('inputPlaceholder')}
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                />
                                <Button onClick={handleSendMessage}>
                                    <Send className="w-4 h-4"/>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <ChatSettingSideBar
                    chatRoomId={id}
                    isRightSidebarOpen={isRightSidebarOpen}
                />
            </div>

            <Dialog open={isJsonViewerOpen} onOpenChange={setIsJsonViewerOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh]">
                    <DialogHeader><DialogTitle>Source Data</DialogTitle></DialogHeader>
                    <div className="overflow-y-auto">
            <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto">
              {JSON.stringify(sources, null, 2)}
            </pre>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
