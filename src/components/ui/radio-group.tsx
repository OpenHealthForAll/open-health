import {forwardRef, HTMLAttributes} from 'react';
import {cn} from '@/lib/utils';

export interface RadioGroupProps extends HTMLAttributes<HTMLDivElement> {
    value?: string;
    onValueChange?: (value: string) => void;
}

export interface RadioGroupItemProps extends HTMLAttributes<HTMLInputElement> {
    value: string;
    checked?: boolean;
}

const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({className, value, onValueChange, children, ...props}, ref) => {
        return (
            <div
                ref={ref}
                className={cn('grid gap-2', className)}
                role="radiogroup"
                {...props}
            >
                {children}
            </div>
        );
    }
);

RadioGroup.displayName = 'RadioGroup';

const RadioGroupItem = forwardRef<HTMLInputElement, RadioGroupItemProps>(
    ({className, value, checked, children, ...props}, ref) => {
        return (
            <label className="flex items-center space-x-2">
                <input
                    ref={ref}
                    type="radio"
                    value={value}
                    checked={checked}
                    className={cn(
                        'h-4 w-4 rounded-full border border-primary text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                        className
                    )}
                    {...props}
                />
                {children}
            </label>
        );
    }
);

RadioGroupItem.displayName = 'RadioGroupItem';

export {RadioGroup, RadioGroupItem};