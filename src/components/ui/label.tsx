import {forwardRef, LabelHTMLAttributes} from 'react';
import {cn} from '@/lib/utils';

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>

const Label = forwardRef<HTMLLabelElement, LabelProps>(
    ({className, ...props}, ref) => {
        return (
            <label
                ref={ref}
                className={cn(
                    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                    className
                )}
                {...props}
            />
        );
    }
);

Label.displayName = 'Label';

export {Label};