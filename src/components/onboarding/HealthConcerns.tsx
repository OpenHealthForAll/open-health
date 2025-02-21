import {Textarea} from "@/components/ui/textarea";
import {cn} from "@/lib/utils";
import {useTranslations} from 'next-intl';

interface HealthConcernsProps {
    value: string;
    onChange: (value: string) => void;
    isInvalid?: boolean;
}

export default function HealthConcerns({value, onChange, isInvalid}: HealthConcernsProps) {
    const t = useTranslations('Onboarding.healthConcerns');

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">{t('title')}</h2>
                <p className="text-gray-600">{t('description')}</p>
            </div>

            <div className="space-y-4">
                <Textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={t('placeholder')}
                    className={cn(
                        "min-h-[200px] text-base",
                        isInvalid && "border-red-500 bg-red-50"
                    )}
                />
                {isInvalid && (
                    <p className="text-sm text-red-500">{t('error')}</p>
                )}
            </div>
        </div>
    );
} 