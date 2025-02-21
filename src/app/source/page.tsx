'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import SourceAddScreen from '@/components/source/source-add-screen';

export default function SourcePage() {
    const router = useRouter();

    return (
        <div className="relative">
            <Button
                variant="ghost"
                className="absolute right-4 top-4 z-50"
                onClick={() => router.back()}
            >
                <X className="h-4 w-4" />
            </Button>
            <SourceAddScreen />
        </div>
    );
} 