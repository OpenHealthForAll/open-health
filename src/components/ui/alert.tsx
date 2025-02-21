import {forwardRef, HTMLAttributes} from 'react';
import {cn} from '@/lib/utils';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'destructive';
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
    ({className, variant = 'default', ...props}, ref) => {
        return (
            <div
                ref={ref}
                role="alert"
                className={cn(
                    'relative w-full rounded-lg border p-4',
                    {
                        'bg-background text-foreground': variant === 'default',
                        'bg-destructive text-destructive-foreground': variant === 'destructive',
                    },
                    className
                )}
                {...props}
            />
        );
    }
);

Alert.displayName = 'Alert';

export type AlertDescriptionProps = HTMLAttributes<HTMLParagraphElement>

const AlertDescription = forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
    ({className, ...props}, ref) => {
        return (
            <p
                ref={ref}
                className={cn('text-sm [&:not(:first-child)]:mt-2', className)}
                {...props}
            />
        );
    }
);

AlertDescription.displayName = 'AlertDescription';

export {Alert, AlertDescription};