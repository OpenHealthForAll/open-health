import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {useTranslations} from 'next-intl';

interface NavigationButtonsProps {
    onNext: () => void;
    onBack: () => void;
    onSkip?: () => void;
    isFirstStep: boolean;
    isLastStep: boolean;
    showSkip?: boolean;
    showBack?: boolean;
}

export default function NavigationButtons({
                                              onNext,
                                              onBack,
                                              onSkip,
                                              isFirstStep,
                                              isLastStep,
                                              showSkip,
                                              showBack = true
                                          }: NavigationButtonsProps) {
    const t = useTranslations('Onboarding.navigation');

    return (
        <div className="flex justify-between mt-8">
            {showBack && (
                <Button
                    variant="ghost"
                    onClick={onBack}
                    className={cn(
                        'text-muted-foreground hover:text-foreground',
                        isFirstStep && 'invisible'
                    )}
                >
                    {t('back')}
                </Button>
            )}
            <div className="flex gap-3">
                {showSkip && onSkip && (
                    <Button
                        variant="ghost"
                        onClick={onSkip}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        {t('skip')}
                    </Button>
                )}
                {!isLastStep && (
                    <Button onClick={onNext}>
                        {t('next')}
                    </Button>
                )}
            </div>
        </div>
    );
}