'use client';

import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import React, {useEffect, useMemo, useState} from "react";
import useSWR from "swr";
import {AssistantMode, AssistantModeListResponse} from "@/app/api/assistant-modes/route";
import {ChatRoomGetResponse} from "@/app/api/chat-rooms/[id]/route";
import {AssistantModePatchRequest} from "@/app/api/assistant-modes/[id]/route";
import {LLMProvider, LLMProviderListResponse} from "@/app/api/llm-providers/route";
import {LLMProviderModel, LLMProviderModelListResponse} from "@/app/api/llm-providers/[id]/models/route";
import {cn} from "@/lib/utils";
import {ConditionalDeploymentEnv} from "@/components/common/deployment-env";
import {useTranslations} from "next-intl";

interface ChatSettingSideBarProps {
    isRightSidebarOpen: boolean;
    chatRoomId: string;
}

export default function ChatSettingSideBar({isRightSidebarOpen, chatRoomId}: ChatSettingSideBarProps
) {
    const t = useTranslations('ChatSettingSideBar')

    const [selectedAssistantMode, setSelectedAssistantMode] = useState<AssistantMode>();
    const [selectedLLMProvider, setSelectedLLMProvider] = useState<LLMProvider>();
    const [selectedLLMProviderModel, setSelectedLLMProviderModel] = useState<LLMProviderModel>();
    const [llmProviderModels, setLLMProviderModels] = useState<LLMProviderModel[]>([]);
    const [showApiKey, setShowApiKey] = useState(false);

    const {
        data: chatRoomData,
        mutate: chatRoomMutate
    } = useSWR<ChatRoomGetResponse>(`/api/chat-rooms/${chatRoomId}`, async (url: string) => {
        const response = await fetch(url);
        return response.json();
    });

    const {
        data: llmProvidersData,
        mutate: llmProvidersMutate
    } = useSWR<LLMProviderListResponse>('/api/llm-providers', async (url: string) => {
        const response = await fetch(url);
        return response.json();
    })

    useEffect(() => {
        onChangeChatRoom({
            llmProviderModelId: selectedLLMProviderModel?.id
        })
    }, [selectedLLMProviderModel]);

    // Initialize assistant mode from localStorage or chatRoomData
    useEffect(() => {
        if (!chatRoomData?.chatRoom.assistantMode) return;

        // If no saved prompt, use the current one and save it
        setSelectedAssistantMode(chatRoomData.chatRoom.assistantMode);
    }, [chatRoomData?.chatRoom.assistantMode?.id]);

    useEffect(() => {
        const chatRoom = chatRoomData?.chatRoom;
        if (!chatRoom) return;

        const llmProviders = llmProvidersData?.llmProviders || [];
        const models = llmProviderModels || [];

        if (selectedLLMProvider === undefined && llmProviders.length > 0) {
            setSelectedLLMProvider(llmProviders.find((provider) => provider.id === chatRoom.llmProviderId) || llmProviders[0]);
        }

        if (selectedLLMProviderModel === undefined && models.length > 0) {
            setSelectedLLMProviderModel(models.find((model) => model.id === chatRoom.llmProviderModelId) || models[0]);
        }
    }, [chatRoomData, llmProvidersData, llmProviderModels]);

    const {
        data: assistantModesData,
        mutate: assistantModesMutate
    } = useSWR<AssistantModeListResponse>('/api/assistant-modes', async (url: string) => {
        const response = await fetch(url);
        return response.json();
    })
    const assistantModes = useMemo(() => assistantModesData?.assistantModes || [], [assistantModesData]);

    // Fetch models when LLM is selected
    useEffect(() => {
        if (!selectedLLMProvider) return;
        const fetchLLMProviderModels = async () => {
            const response = await fetch(`/api/llm-providers/${selectedLLMProvider.id}/models`)
            const data: LLMProviderModelListResponse = await response.json();
            setLLMProviderModels(data.llmProviderModels || []);
        }
        fetchLLMProviderModels();
    }, [selectedLLMProvider]);

    const onChangeChatRoom = async ({
                                        assistantModeId,
                                        llmProviderId,
                                        llmProviderModelId,
                                    }: {
        assistantModeId?: string
        llmProviderId?: string
        llmProviderModelId?: string | null
    }) => {
        if (chatRoomData === undefined) return;
        const response = await fetch(`/api/chat-rooms/${chatRoomId}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({assistantModeId, llmProviderId, llmProviderModelId}),
        });
        const data = await response.json();

        // Get the saved system prompt
        const updatedAssistantMode = {
            ...data.chatRoom.assistantMode,
            systemPrompt: data.chatRoom.assistantMode.systemPrompt
        };

        await chatRoomMutate({
            ...chatRoomData,
            chatRoom: {
                ...chatRoomData.chatRoom,
                assistantMode: updatedAssistantMode,
                llmProviderId: llmProviderId || chatRoomData.chatRoom.llmProviderId,
                llmProviderModelId: llmProviderModelId || chatRoomData.chatRoom.llmProviderModelId,
            }
        });
        setSelectedAssistantMode(updatedAssistantMode);
    }

    const onChangeAssistantMode = async (assistantModeId: string, body: AssistantModePatchRequest) => {
        const response = await fetch(`/api/assistant-modes/${assistantModeId}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body),
        })
        const data = await response.json();

        await assistantModesMutate({
            ...assistantModesData,
            assistantModes: assistantModesData?.assistantModes.map((assistantMode) => {
                if (assistantMode.id === assistantModeId) {
                    return data.assistantMode;
                }
                return assistantMode;
            }) || []
        })
    }

    const onLLMProviderChange = async ({
                                           apiKey,
                                           apiURL,
                                       }: {
        apiKey?: string,
        apiURL?: string,
    }) => {
        if (!selectedLLMProvider) return;

        const data = {
            ...selectedLLMProvider,
            apiKey: apiKey || selectedLLMProvider.apiKey,
            apiURL: apiURL || selectedLLMProvider.apiURL
        };
        setSelectedLLMProvider(data);
        await fetch(`/api/llm-providers/${selectedLLMProvider.id}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data),
        });
        await llmProvidersMutate();
        setSelectedLLMProvider(data)

        // Patch ChatRoom with new LLMProvider
        await onChangeChatRoom({llmProviderId: selectedLLMProvider.id, llmProviderModelId: null});
    }

    return <div className={`border-l bg-gray-50 flex flex-col transition-all duration-300 ease-in-out
          ${isRightSidebarOpen ? 'w-80' : 'w-0'} relative`}>
        <div className={`absolute inset-0 ${isRightSidebarOpen ? 'opacity-100' : 'opacity-0'}
            transition-opacity duration-300 overflow-y-auto`}>
            <div className="p-4 space-y-4">
                <div className="space-y-4">
                    <h4 className="text-sm font-medium">{t('modelSettings')}</h4>
                    <div className="space-y-2">
                        <Select value={selectedLLMProvider?.id}
                                onValueChange={(value) => {
                                    setSelectedLLMProvider(llmProvidersData?.llmProviders.find((provider) => provider.id === value));
                                    setLLMProviderModels([])
                                    setSelectedLLMProviderModel(undefined);
                                    onChangeChatRoom({llmProviderId: value, llmProviderModelId: null});
                                }}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('selectCompany')}/>
                            </SelectTrigger>
                            <SelectContent className={cn('bg-white max-h-64 overflow-y-auto')}>
                                {llmProvidersData?.llmProviders.map((provider) => <SelectItem
                                    key={provider.id}
                                    value={provider.id}>{provider.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={selectedLLMProviderModel?.id}
                                onValueChange={(value) => setSelectedLLMProviderModel(llmProviderModels.find((model) => model.id === value))}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('selectModel')}/>
                            </SelectTrigger>
                            <SelectContent className={cn('bg-white max-h-64 overflow-y-auto')}>
                                {llmProviderModels.map((model) => (
                                    <SelectItem key={model.id} value={model.id}>
                                        {model.name}
                                    </SelectItem>
                                ))}

                                {llmProviderModels.length === 0 && (
                                    <div className="p-2 text-sm text-gray-500">{t('noModelsFound')}</div>
                                )}
                            </SelectContent>
                        </Select>

                        <ConditionalDeploymentEnv env={['local']}>
                            {selectedLLMProvider && (['ollama', 'openai'].includes(selectedLLMProvider.providerId)) && (
                                <Input
                                    type="text"
                                    placeholder={`API endpoint (default: ${selectedLLMProvider?.providerId === 'ollama' ? 'http://localhost:11434' : 'https://api.openai.com/v1'})`}
                                    value={selectedLLMProvider?.apiURL}
                                    onChange={(e) => onLLMProviderChange({apiURL: e.target.value})}
                                />
                            )}
                            {selectedLLMProvider?.providerId !== 'ollama' && selectedLLMProvider?.apiKeyRequired && (
                                <div className="relative">
                                    <Input
                                        type={showApiKey ? "text" : "password"}
                                        placeholder={t('enterApiKey')}
                                        value={selectedLLMProvider?.apiKey || ''}
                                        onChange={(e) => onLLMProviderChange({apiKey: e.target.value})}
                                        className="pr-16"
                                    />
                                    <button
                                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
                                        onClick={() => setShowApiKey(!showApiKey)}
                                    >
                                        {showApiKey ? t('hide') : t('show')}
                                    </button>
                                </div>
                            )}
                            {selectedLLMProvider?.providerId !== 'ollama' && !selectedLLMProvider?.apiKeyRequired && (
                                <div className="p-2 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
                                    {t('apiKeyConfigured')}
                                </div>
                            )}
                        </ConditionalDeploymentEnv>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">{t('systemPrompt')}</label>
                    <Textarea
                        value={selectedAssistantMode?.systemPrompt || ''}
                        onChange={async (e) => {
                            if (selectedAssistantMode) {
                                setSelectedAssistantMode({...selectedAssistantMode, systemPrompt: e.target.value});
                                await onChangeAssistantMode(selectedAssistantMode.id, {systemPrompt: e.target.value});
                            }
                        }}
                        rows={6}
                        className="resize-none"
                    />
                </div>

                <div className="space-y-3">
                    <h4 className="text-sm font-medium">{t('assistantMode')}</h4>
                    <div className="space-y-2">
                        {assistantModes.map((assistantMode) => (
                            <button
                                key={assistantMode.id}
                                className={`w-full p-3 rounded-lg text-left border transition-colors
                        ${selectedAssistantMode?.id === assistantMode.id ? 'bg-white border-gray-300' :
                                    'border-transparent hover:bg-gray-100'}`}
                                onClick={async () => {
                                    await onChangeChatRoom({assistantModeId: assistantMode.id});
                                }}
                            >
                                <div className="text-sm font-medium">{assistantMode.name}</div>
                                <div className="text-xs text-gray-500">{assistantMode.description}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
}
