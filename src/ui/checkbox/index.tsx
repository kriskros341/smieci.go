import * as CheckboxPrimitive from '@rn-primitives/checkbox';
import * as React from 'react';
import { cn } from '@utils/cn';
import AntDesign from '@expo/vector-icons/AntDesign';

const Checkbox = React.forwardRef<CheckboxPrimitive.RootRef, CheckboxPrimitive.RootProps>(
  ({ className, ...props }, ref) => {
    return (
      <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
          'web:peer h-8 w-8 native:h-[20] native:w-[20] shrink-0 rounded-sm native:rounded border border-primary web:ring-offset-background web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          props.checked && 'bg-primary',
          className
        )}
        {...props}
      >
        {props.checked ? (
          <AntDesign
            name="checkcircle"
            size={24}
            color="green"
          />
        ) : (
          <AntDesign
            name="checkcircleo"
            size={24}
            color="grey"
          />
        )}
      </CheckboxPrimitive.Root>
    );
  }
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
