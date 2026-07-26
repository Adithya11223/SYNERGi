import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer relative inline-flex shrink-0 cursor-pointer items-center justify-start transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
      "w-[51px] h-[29px] bg-[#ffffff2b] rounded-[100px]",
      "shadow-[inset_0px_0px_5px_rgba(0,0,0,0.62),inset_0px_0px_0px_24px_rgba(0,0,0,0.21),inset_0px_0px_0px_0px_#22cc3f,0px_1px_0px_0px_rgba(224,224,224,0.45)]",
      "data-[state=checked]:shadow-[inset_0px_0px_5px_rgba(0,0,0,0.62),inset_0px_0px_0px_2px_#22cc3f,inset_0px_0px_0px_24px_#22cc3f,0px_1px_0px_0px_rgba(224,224,224,0.45)]",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-[26px] w-[26px] rounded-[200px] bg-[#e3e3e3] ring-0 transition-all duration-300 ease-out will-change-[transform,background-color]",
        "shadow-[0px_0px_0px_2px_transparent,0px_6px_6px_rgba(0,0,0,0.3)]",
        "translate-x-[2px] data-[state=checked]:translate-x-[23px]"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
