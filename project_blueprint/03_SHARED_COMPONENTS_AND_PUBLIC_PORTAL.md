# MLR Associates — Part 3: Shared UI Components & Public Portal

This document contains all base Shadcn UI components, navigation bars, footers, context providers, the authentication login page, and all public-facing pages (Landing, Booking, Contact, Privacy, Testimonials, Document Upload).

---

### File: `src/components/ui/button.tsx`

```typescript
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
```

---

### File: `src/components/ui/card.tsx`

```typescript
import * as React from "react"

import { cn } from "@/lib/utils"

function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl bg-card py-(--card-spacing) text-sm text-card-foreground ring-1 ring-foreground/10 [--card-spacing:--spacing(4)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3)] data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-(--card-spacing)", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-xl border-t bg-muted/50 p-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
```

---

### File: `src/components/ui/input.tsx`

```typescript
import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
```

---

### File: `src/components/ui/textarea.tsx`

```typescript
import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
```

---

### File: `src/components/ui/dialog.tsx`

```typescript
"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-2 right-2"
                size="icon-sm"
              />
            }
          >
            <XIcon
            />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          Close
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-heading text-base leading-none font-medium",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
```

---

### File: `src/components/ui/dropdown-menu.tsx`

```typescript
"use client"

import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"

import { cn } from "@/lib/utils"
import { ChevronRightIcon, CheckIcon } from "lucide-react"

function DropdownMenu({ ...props }: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({ ...props }: MenuPrimitive.Portal.Props) {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
}

function DropdownMenuTrigger({ ...props }: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

function DropdownMenuContent({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  className,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn("z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95", className )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function DropdownMenuGroup({ ...props }: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: MenuPrimitive.GroupLabel.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-1.5 py-1 text-xs font-medium text-muted-foreground data-inset:pl-7",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: MenuPrimitive.Item.Props & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({ ...props }: MenuPrimitive.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: MenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-popup-open:bg-accent data-popup-open:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </MenuPrimitive.SubmenuTrigger>
  )
}

function DropdownMenuSubContent({
  align = "start",
  alignOffset = -3,
  side = "right",
  sideOffset = 0,
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      data-slot="dropdown-menu-sub-content"
      className={cn("w-auto min-w-[96px] rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className )}
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: MenuPrimitive.CheckboxItem.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset}
      className={cn(
        "relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon
          />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({ ...props }: MenuPrimitive.RadioGroup.Props) {
  return (
    <MenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: MenuPrimitive.RadioItem.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={inset}
      className={cn(
        "relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <MenuPrimitive.RadioItemIndicator>
          <CheckIcon
          />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
```

---

### File: `src/components/ui/select.tsx`

```typescript
"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"

import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"

const Select = SelectPrimitive.Root

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  )
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("flex flex-1 text-left", className)}
      {...props}
    />
  )
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex w-fit items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
        }
      />
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  >) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn("relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("px-1.5 py-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
        }
      >
        <CheckIcon className="pointer-events-none" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronUpIcon
      />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronDownIcon
      />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
```

---

### File: `src/components/ui/table.tsx`

```typescript
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
```

---

### File: `src/components/ui/tabs.tsx`

```typescript
"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
```

---

### File: `src/components/ui/calendar.tsx`

```typescript
"use client"

import * as React from "react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type Locale,
} from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "lucide-react"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar bg-background p-2 [--cell-radius:var(--radius-md)] [--cell-size:--spacing(7)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale?.code, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative rounded-(--cell-radius)",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute inset-0 bg-popover opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "font-medium select-none",
          captionLayout === "label"
            ? "text-sm"
            : "flex items-center gap-1 rounded-(--cell-radius) text-sm [&>svg]:size-3.5 [&>svg]:text-muted-foreground",
          defaultClassNames.caption_label
        ),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 rounded-(--cell-radius) text-[0.8rem] font-normal text-muted-foreground select-none",
          defaultClassNames.weekday
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn(
          "w-(--cell-size) select-none",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[0.8rem] text-muted-foreground select-none",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius)",
          props.showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-(--cell-radius)"
            : "[&:first-child[data-selected=true]_button]:rounded-l-(--cell-radius)",
          defaultClassNames.day
        ),
        range_start: cn(
          "relative isolate z-0 rounded-l-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-muted",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn(
          "relative isolate z-0 rounded-r-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-muted",
          defaultClassNames.range_end
        ),
        today: cn(
          "rounded-(--cell-radius) bg-muted text-foreground data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon className={cn("size-4", className)} {...props} />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          )
        },
        DayButton: ({ ...props }) => (
          <CalendarDayButton locale={locale} {...props} />
        ),
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 border-0 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50 data-[range-end=true]:rounded-(--cell-radius) data-[range-end=true]:rounded-r-(--cell-radius) data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-muted data-[range-middle=true]:text-foreground data-[range-start=true]:rounded-(--cell-radius) data-[range-start=true]:rounded-l-(--cell-radius) data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground dark:hover:text-foreground [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
```

---

### File: `src/components/ui/checkbox.tsx`

```typescript
"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"

import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input transition-colors outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        <CheckIcon
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
```

---

### File: `src/components/ui/label.tsx`

```typescript
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
```

---

### File: `src/components/navbar.tsx`

```typescript
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Menu, X, Shield, Calendar, MapPin, Star, Upload, User, PhoneCall, Sparkles } from 'lucide-react';

export function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const getDashboardUrl = () => {
    if (!session?.user) return '/login';
    const role = session.user.role;
    if (role === 'ADMIN') return '/admin';
    if (role === 'JUNIOR' || role === 'INTERN') return '/junior';
    return '/dashboard';
  };

  const navLinks = [
    { href: '/book', label: 'Book Slot', icon: Calendar },
    { href: '/upload', label: 'Upload Files', icon: Upload },
    { href: '/testimonials', label: 'Reviews', icon: Star },
    { href: '/contact', label: 'Chambers', icon: MapPin },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0B132B]/85 backdrop-blur-xl border-b border-[#E2C044]/25 shadow-2xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#E2C044] via-[#F3E5AB] to-[#B8860B] p-[2px] shadow-lg shadow-[#E2C044]/20 group-hover:scale-105 transition-transform duration-300">
                <div className="h-full w-full bg-[#0B132B] rounded-[10px] flex items-center justify-center">
                  <Shield className="h-6 w-6 text-[#E2C044] group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-xl tracking-wider gold-gradient-text">
                  MLR ASSOCIATES
                </span>
                <span className="text-[10px] text-cyan-300/80 font-medium tracking-widest uppercase">
                  Advocates & Legal Consultants
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-[#1C2541]/70 p-1.5 rounded-full border border-slate-700/60 shadow-inner">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#E2C044] to-[#C9A84C] text-[#0B132B] shadow-md shadow-[#E2C044]/30 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#0B132B]' : 'text-[#E2C044]'}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Emergency Helpline & Auth */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:+919876543210"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-medium hover:bg-emerald-900/60 transition duration-200"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <PhoneCall className="h-3.5 w-3.5 text-emerald-400" />
              <span>Urgent Legal Line</span>
            </a>

            {session ? (
              <div className="flex items-center gap-2">
                <Link href={getDashboardUrl()}>
                  <Button className="bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] hover:brightness-110 font-bold text-xs px-4 py-2 rounded-lg shadow-lg shadow-[#E2C044]/25 flex items-center gap-1.5 transition">
                    <User className="h-3.5 w-3.5" /> Portal
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="border-slate-700 text-slate-300 hover:text-rose-400 hover:border-rose-500/50 bg-slate-900/50 text-xs px-3 py-2 rounded-lg transition"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button className="bg-gradient-to-r from-[#E2C044] to-[#D97706] text-[#0B132B] hover:brightness-110 font-bold text-xs px-5 py-2 rounded-lg shadow-lg shadow-[#E2C044]/20 flex items-center gap-1.5 transition">
                  <Sparkles className="h-3.5 w-3.5" /> Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200 hover:text-[#E2C044] transition"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B132B]/95 backdrop-blur-2xl border-t border-[#E2C044]/20 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 hover:text-[#E2C044] text-xs font-semibold"
                >
                  <Icon className="h-4 w-4 text-[#E2C044]" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <a
            href="tel:+919876543210"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-xs font-semibold"
          >
            <PhoneCall className="h-4 w-4" /> 24/7 Legal Emergency Call
          </a>

          <div className="pt-2">
            {session ? (
              <div className="flex gap-2">
                <Link href={getDashboardUrl()} className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] font-bold py-2.5 rounded-xl">
                    Open Dashboard
                  </Button>
                </Link>
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                  className="bg-slate-900 border border-slate-800 text-slate-300 font-semibold py-2.5 rounded-xl"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] font-bold py-2.5 rounded-xl">
                  Client & Advocate Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
```

---

### File: `src/components/footer.tsx`

```typescript
import Link from 'next/link';
import { Shield, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0A1628] border-t border-[#C9A84C]/20 text-[#F5F0E8] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Firm Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-[#C9A84C]" />
              <span className="font-heading font-bold text-lg tracking-wider">MLR ASSOCIATES</span>
            </div>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              MLR Associates is a premier litigation and corporate advocacy firm. We deliver strategic counsel, trial defense, and dispute resolution with absolute integrity and diligence.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C9A84C]">Firm Desk</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/book" className="hover:text-[#C9A84C] transition">Book Appointment</Link></li>
              <li><Link href="/upload" className="hover:text-[#C9A84C] transition">Document Vault</Link></li>
              <li><Link href="/testimonials" className="hover:text-[#C9A84C] transition">Verified Testimonials</Link></li>
              <li><Link href="/privacy" className="hover:text-[#C9A84C] transition">Privacy & DPDP Policy</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C9A84C]">Chambers</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#C9A84C]" />
                <span>130, Nungambakkam High Rd, Thousand Lights, Chennai, TN 600006</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-[#C9A84C]" />
                <span>+91 94440 19923</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-[#C9A84C]" />
                <span>contact@mlrassociates.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#F5F0E8]/10 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} MLR Associates. All Rights Reserved.</p>
          <p className="text-[10px] leading-relaxed max-w-md text-center md:text-right">
            Disclosures: Compliance with Bar Council of India regulations (solicitation is not permitted) and data storage safeguards under the Digital Personal Data Protection (DPDP) Act 2023.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

---

### File: `src/components/floating-widgets.tsx`

```typescript
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, PhoneCall, Clock, ShieldAlert, X, ChevronUp, Calendar, Sparkles } from 'lucide-react';

export function OfficeHoursBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-[#E2C044]/40 text-xs font-semibold backdrop-blur-md shadow-lg">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E2C044] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E2C044]"></span>
      </span>
      <span className="text-slate-200">Chambers Active:</span>
      <span className="gold-gradient-text font-bold">Mon - Sat (9:00 AM - 7:30 PM)</span>
    </div>
  );
}

export function FloatingWidgets() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Expanded Quick Options */}
      {expanded && (
        <div className="flex flex-col gap-2.5 animate-in slide-in-from-bottom duration-300">
          <a
            href="https://wa.me/919876543210?text=Hello%20MLR%20Associates,%20I%20need%20legal%20consultation"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-xl transition-all hover:scale-105"
          >
            <MessageSquare className="h-4 w-4" />
            <span>WhatsApp Quick Desk</span>
          </a>

          <a
            href="tel:+919876543210"
            className="flex items-center gap-3 bg-slate-900 border border-[#E2C044]/50 text-[#E2C044] text-xs font-bold px-4 py-2.5 rounded-full shadow-xl transition-all hover:scale-105 backdrop-blur-md"
          >
            <PhoneCall className="h-4 w-4 text-emerald-400" />
            <span>Call Senior Counsel</span>
          </a>

          <Link
            href="/book"
            className="flex items-center gap-3 bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] text-xs font-extrabold px-4 py-2.5 rounded-full shadow-xl transition-all hover:scale-105"
          >
            <Calendar className="h-4 w-4 text-[#0B132B]" />
            <span>Book Calendar Slot</span>
          </Link>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`h-14 w-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
          expanded
            ? 'bg-slate-800 text-slate-200 border-2 border-slate-600 scale-105'
            : 'bg-gradient-to-tr from-[#E2C044] via-[#F3E5AB] to-[#B8860B] text-[#0B132B] shadow-[#E2C044]/30 hover:scale-110 gold-glow'
        }`}
        title="Quick Legal Help"
      >
        {expanded ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-[#0B132B]" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
        )}
      </button>
    </div>
  );
}
```

---

### File: `src/components/providers.tsx`

```typescript
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <SessionProvider>
      <ToastContext.Provider value={{ toast }}>
        {children}
        
        {/* Global Toast Container */}
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
          ))}
        </div>
      </ToastContext.Provider>
    </SessionProvider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-rose-600 text-white',
    info: 'bg-[#0A1628] text-white border border-[#C9A84C]/40',
  };

  return (
    <div
      className={`p-4 rounded-lg shadow-lg flex items-start justify-between transition-all duration-300 transform translate-y-0 opacity-100 ${bgColors[toast.type]}`}
    >
      <div className="flex-1 text-sm font-medium pr-2">{toast.message}</div>
      <button onClick={onClose} className="text-white hover:opacity-75 focus:outline-none">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
```

---

### File: `src/app/(auth)/login/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/providers';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect if already logged in
    if (status === 'authenticated' && session?.user) {
      handleRoleRedirect(session.user.role);
    }
  }, [status, session]);

  const handleRoleRedirect = (role: string) => {
    if (role === 'ADMIN') {
      router.push('/admin');
    } else if (role === 'JUNIOR' || role === 'INTERN') {
      router.push('/junior');
    } else {
      router.push('/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast('Please enter email and password.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast(res.error, 'error');
      } else {
        toast('Logged in successfully!', 'success');
        // Let useEffect handle the redirect when session updates
      }
    } catch (err) {
      toast('An unexpected error occurred.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (roleEmail: string, rolePass: string, label: string) => {
    setLoading(true);
    setEmail(roleEmail);
    setPassword(rolePass);
    try {
      const res = await signIn('credentials', {
        email: roleEmail,
        password: rolePass,
        redirect: false,
      });

      if (res?.error) {
        toast(res.error, 'error');
      } else {
        toast(`Logged in as ${label}!`, 'success');
      }
    } catch (err) {
      toast('An unexpected error occurred.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F5F0E8] min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin"></div>
          <p className="text-[#0A1628] font-medium text-sm">Securing Connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-[#F5F0E8] px-4 py-12 min-h-screen relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#C9A84C]/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-[#0A1628]/10 blur-[150px]" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-heading text-[#0A1628] tracking-wider mb-2">MLR ASSOCIATES</h1>
          <p className="text-sm text-gray-600 font-medium">Advocate &amp; Law Firm Management Console</p>
        </div>

        <Card className="border border-[#DCD6C5] shadow-xl bg-white/80 backdrop-blur-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-heading text-[#0A1628]">Sign In</CardTitle>
            <CardDescription className="text-gray-500">
              Access your personalized firm workspace
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#0A1628] font-semibold">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@firm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-[#DCD6C5] focus:border-[#C9A84C] focus:ring-[#C9A84C]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#0A1628] font-semibold">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-[#DCD6C5] focus:border-[#C9A84C] focus:ring-[#C9A84C]"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full bg-[#0A1628] text-[#F5F0E8] hover:bg-[#0A1628]/90 focus:ring-2 focus:ring-[#C9A84C] font-semibold py-2"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </Button>
              
              <div className="relative w-full my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[#DCD6C5]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#F5F0E8] px-2 text-gray-500 font-semibold">Demo Quick Access</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 w-full">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@firm.com', 'admin123', 'Admin')}
                  className="text-xs bg-[#0A1628]/5 border border-[#0A1628]/20 hover:border-[#C9A84C] hover:bg-[#0A1628]/10 text-[#0A1628] font-semibold py-2 px-1 rounded transition duration-200"
                  disabled={loading}
                >
                  Admin Portal
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('junior@firm.com', 'junior123', 'Junior')}
                  className="text-xs bg-[#0A1628]/5 border border-[#0A1628]/20 hover:border-[#C9A84C] hover:bg-[#0A1628]/10 text-[#0A1628] font-semibold py-2 px-1 rounded transition duration-200"
                  disabled={loading}
                >
                  Junior Hub
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('client@firm.com', 'client123', 'Client')}
                  className="text-xs bg-[#0A1628]/5 border border-[#0A1628]/20 hover:border-[#C9A84C] hover:bg-[#0A1628]/10 text-[#0A1628] font-semibold py-2 px-1 rounded transition duration-200"
                  disabled={loading}
                >
                  Client Desk
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
```

---

### File: `src/app/(public)/page.tsx`

```typescript
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { FloatingWidgets, OfficeHoursBadge } from '@/components/floating-widgets';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Scale,
  BookOpen,
  Users,
  Briefcase,
  FileText,
  Star,
  Calculator,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Gavel,
  Clock,
  ChevronRight,
  Info,
  Building2,
  FileCheck,
  Zap,
  Filter,
  Calendar
} from 'lucide-react';

export default function Home() {
  // Practice Benches Data with Filters
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedPractice, setSelectedPractice] = useState<any | null>(null);

  const practiceAreas = [
    {
      id: 'criminal',
      category: 'criminal',
      title: 'Criminal Defense & Bail',
      icon: Shield,
      tag: 'High Priority',
      badgeColor: 'from-rose-500 to-amber-500',
      desc: 'Bail representation, trial defense, white-collar crimes, criminal appeals, and CBI/ED inquiries.',
      statutes: 'CrPC, IPC / Bharatiya Nagarik Suraksha Sanhita, Prevention of Corruption Act.',
      typicalTimeline: '1 - 3 Weeks for Emergency Bail'
    },
    {
      id: 'civil',
      category: 'civil',
      title: 'Civil & Property Disputes',
      icon: Scale,
      tag: 'High Precedent',
      badgeColor: 'from-amber-500 to-emerald-500',
      desc: 'Title deed verification, partition suits, recovery of possession, boundary audits & land acquisitions.',
      statutes: 'Transfer of Property Act, CPC, Specific Relief Act, RERA 2016.',
      typicalTimeline: '3 - 6 Months for Title Settlement'
    },
    {
      id: 'corporate',
      category: 'corporate',
      title: 'Corporate & Contract Advisory',
      icon: Briefcase,
      tag: 'Retainer Available',
      badgeColor: 'from-cyan-500 to-blue-600',
      desc: 'Incorporation, contract vetting, M&A due diligence, shareholder agreements & NCLT litigation.',
      statutes: 'Companies Act 2013, Insolvency and Bankruptcy Code (IBC), SEBI Regulations.',
      typicalTimeline: '24 - 48 Hours Contract Turnaround'
    },
    {
      id: 'family',
      category: 'family',
      title: 'Family Law & Estates',
      icon: Users,
      tag: 'Confidential',
      badgeColor: 'from-purple-500 to-[#E2C044]',
      desc: 'Mutual divorce, child custody, alimony, succession certificate, partition of ancestral property.',
      statutes: 'Hindu Marriage Act, Special Marriage Act, Indian Succession Act.',
      typicalTimeline: 'Mediated settlement options'
    },
    {
      id: 'labour',
      category: 'labour',
      title: 'Labour & Service Writs',
      icon: BookOpen,
      tag: 'Constitutional',
      badgeColor: 'from-emerald-500 to-teal-600',
      desc: 'Industrial disputes, termination writs, pension claims, employment agreements, CAT tribunals.',
      statutes: 'Industrial Disputes Act, Central Civil Services Rules, Article 226 Writs.',
      typicalTimeline: 'Fast-track Tribunal Filings'
    },
    {
      id: 'land',
      category: 'civil',
      title: 'RERA & Land Acquisition',
      icon: FileText,
      tag: 'Regulatory',
      badgeColor: 'from-[#E2C044] to-cyan-500',
      desc: 'Builder delay compensation, RERA authority complaints, government land acquisition challenge.',
      statutes: 'Real Estate (Regulation and Development) Act, RFCTLARR Act 2013.',
      typicalTimeline: 'RERA Appellate Hearings'
    },
  ];

  const filteredPractices = activeTab === 'all' 
    ? practiceAreas 
    : practiceAreas.filter(p => p.category === activeTab);

  // Interactive Fee Calculator State
  const [courtLevel, setCourtLevel] = useState<'district' | 'high' | 'supreme'>('high');
  const [caseType, setCaseType] = useState<'bail' | 'property' | 'corporate' | 'family'>('bail');
  const [urgency, setUrgency] = useState<'standard' | 'expedited' | 'emergency'>('standard');

  const calculateEstimate = () => {
    let base = 15000;
    if (caseType === 'property') base = 25000;
    if (caseType === 'corporate') base = 35000;
    if (caseType === 'family') base = 20000;

    let multiplier = 1;
    if (courtLevel === 'high') multiplier = 1.6;
    if (courtLevel === 'supreme') multiplier = 2.5;

    let urgencyFee = 0;
    if (urgency === 'expedited') urgencyFee = 5000;
    if (urgency === 'emergency') urgencyFee = 12000;

    const estimatedTotal = Math.round(base * multiplier + urgencyFee);
    return {
      fee: estimatedTotal,
      retainer: Math.round(estimatedTotal * 0.4),
      timeframe: urgency === 'emergency' ? 'Within 24 Hours' : urgency === 'expedited' ? '3 - 5 Working Days' : '7 - 10 Working Days'
    };
  };

  const estimate = calculateEstimate();

  // Testimonials State
  const [testimonialFilter, setTestimonialFilter] = useState<'all' | 'corporate' | 'civil'>('all');

  const testimonials = [
    {
      quote: "The legal team successfully defended our company in a complex trademark and NCLT dispute. Their research-backed approach saved months of court delay.",
      author: "Rajesh Shah",
      tag: "corporate",
      role: "Managing Director, Apex Tech Ltd.",
      rating: 5
    },
    {
      quote: "Highly professional. Guided our family through title deed verification and land partition smoothly with complete fee transparency.",
      author: "Pooja Sen",
      tag: "civil",
      role: "Civil Land Partition Case",
      rating: 5
    },
    {
      quote: "Secured immediate bail in a high-profile economic offense case within 48 hours. Absolute dedication and deep knowledge of CrPC.",
      author: "Vikram Malhotra",
      tag: "criminal",
      role: "High Court Appellate Defense",
      rating: 5
    }
  ];

  const filteredTestimonials = testimonialFilter === 'all'
    ? testimonials
    : testimonials.filter(t => t.tag === testimonialFilter);

  return (
    <div className="flex-1 flex flex-col min-h-screen mesh-bg text-slate-100 font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-[#E2C044]/15 blur-[120px] pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-cyan-500/15 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <OfficeHoursBadge />
              
              <h1 className="text-4xl sm:text-6xl font-black font-heading tracking-tight leading-none">
                Steadfast Defense.<br />
                <span className="gold-gradient-text">Strategic Victory.</span>
              </h1>
              
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                MLR ASSOCIATES specializes in high-stakes appellate trials, constitutional writs, property title audits, and corporate advisory before the High Court & Supreme Court Benches.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/book">
                  <Button className="bg-gradient-to-r from-[#E2C044] via-[#F3E5AB] to-[#B8860B] text-[#0B132B] font-extrabold px-8 py-4 text-sm rounded-xl shadow-xl shadow-[#E2C044]/20 hover:scale-105 transition-all duration-300 flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Book Consultation Slot
                  </Button>
                </Link>
                <a href="#estimator">
                  <Button variant="outline" className="border-slate-700 bg-slate-900/60 text-slate-200 hover:border-[#E2C044] hover:text-[#E2C044] px-6 py-4 text-sm rounded-xl backdrop-blur-md transition-all flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-[#E2C044]" /> Calculate Retainer Fee
                  </Button>
                </a>
              </div>

              {/* Quick Feature Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 40+ Yrs Legacy
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" /> High Court Benches
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-[#E2C044]" /> Supreme Precedents
                </div>
              </div>
            </div>

            {/* Right Interactive Hero Card */}
            <div className="lg:col-span-5">
              <div className="glass-panel rounded-3xl p-8 border border-[#E2C044]/30 shadow-2xl relative animate-float">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <Gavel className="h-6 w-6 text-[#E2C044]" />
                    <span className="font-heading font-extrabold text-lg text-white">Chambers Direct Desk</span>
                  </div>
                  <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 uppercase tracking-widest">
                    Available Today
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-[#E2C044] flex items-center justify-center font-bold">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-200">Next Available Slot</p>
                        <p className="text-slate-400 text-[11px]">Today @ 4:30 PM (Virtual / In-Person)</p>
                      </div>
                    </div>
                    <Link href="/book">
                      <ChevronRight className="h-5 w-5 text-[#E2C044] hover:translate-x-1 transition" />
                    </Link>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-200">Senior Advocates Desk</p>
                        <p className="text-slate-400 text-[11px]">3 Benches Active in Session</p>
                      </div>
                    </div>
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                        <FileCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-200">Express Title Audit</p>
                        <p className="text-slate-400 text-[11px]">Document Vetting & Verification</p>
                      </div>
                    </div>
                    <Link href="/upload" className="text-[11px] font-bold text-[#E2C044] hover:underline">
                      Upload
                    </Link>
                  </div>
                </div>

                <div className="mt-6 pt-4 text-center">
                  <Link href="/book">
                    <Button className="w-full bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] font-extrabold py-3 rounded-xl shadow-lg hover:brightness-110 transition">
                      Schedule Emergency Session
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Dynamic Interactive Stats */}
      <section className="py-12 border-y border-slate-800/80 bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            
            <div className="glass-card rounded-2xl p-6 border border-slate-800 hover:border-[#E2C044]/50 group">
              <p className="text-4xl font-extrabold font-heading gold-gradient-text group-hover:scale-110 transition duration-300">98.4%</p>
              <p className="text-xs uppercase tracking-wider font-bold text-slate-300 mt-2">Favorable Verdict Ratio</p>
              <p className="text-[10px] text-slate-400 mt-1">Across 1,200+ Cases</p>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-slate-800 hover:border-cyan-500/50 group">
              <p className="text-4xl font-extrabold font-heading cyan-gradient-text group-hover:scale-110 transition duration-300">40+</p>
              <p className="text-xs uppercase tracking-wider font-bold text-slate-300 mt-2">Years Active Advocacy</p>
              <p className="text-[10px] text-slate-400 mt-1">Established 1986</p>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-slate-800 hover:border-emerald-500/50 group">
              <p className="text-4xl font-extrabold font-heading emerald-gradient-text group-hover:scale-110 transition duration-300">1,200+</p>
              <p className="text-xs uppercase tracking-wider font-bold text-slate-300 mt-2">Satisfied Clients</p>
              <p className="text-[10px] text-slate-400 mt-1">Corporate & Individuals</p>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-slate-800 hover:border-purple-500/50 group">
              <p className="text-4xl font-extrabold font-heading text-purple-300 group-hover:scale-110 transition duration-300">18</p>
              <p className="text-xs uppercase tracking-wider font-bold text-slate-300 mt-2">Supreme Court Precedents</p>
              <p className="text-[10px] text-slate-400 mt-1">Reported Law Journals</p>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Practice Benches Explorer */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-[#E2C044]/40 text-xs font-bold text-[#E2C044]">
            <Sparkles className="h-3.5 w-3.5" /> Specialized Benches
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">Fields of Advocacy</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Select a practice bench to inspect key statutes, expected case timelines, and trial procedures.
          </p>

          {/* Interactive Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {[
              { id: 'all', label: 'All Benches' },
              { id: 'criminal', label: 'Criminal Defense' },
              { id: 'civil', label: 'Civil & Property' },
              { id: 'corporate', label: 'Corporate & M&A' },
              { id: 'family', label: 'Family & Estates' },
              { id: 'labour', label: 'Labour & Writs' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition duration-200 border ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] border-[#E2C044] shadow-lg shadow-[#E2C044]/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Practice Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPractices.map((area) => {
            const Icon = area.icon;
            return (
              <div
                key={area.id}
                className="glass-card rounded-2xl p-7 border border-slate-800 flex flex-col justify-between hover:border-[#E2C044]/60 transition duration-300 group cursor-pointer"
                onClick={() => setSelectedPractice(area)}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#E2C044]/20 to-slate-800 border border-[#E2C044]/30 text-[#E2C044] flex items-center justify-center group-hover:scale-110 transition duration-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full bg-gradient-to-r ${area.badgeColor} text-white shadow`}>
                      {area.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#E2C044] transition">
                    {area.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {area.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-[#E2C044]" /> {area.typicalTimeline}
                  </span>
                  <span className="text-[#E2C044] group-hover:translate-x-1 transition flex items-center gap-1">
                    Inspect Bench <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Practice Detail Modal */}
        {selectedPractice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="glass-panel max-w-lg w-full rounded-3xl p-8 border border-[#E2C044]/40 shadow-2xl relative space-y-6">
              <div className="flex items-start justify-between border-b border-slate-700/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#E2C044]/20 text-[#E2C044] flex items-center justify-center">
                    <selectedPractice.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedPractice.title}</h3>
                    <span className="text-xs text-[#E2C044] font-semibold">{selectedPractice.tag}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPractice(null)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <p className="font-bold text-slate-200 mb-1">Scope of Representation:</p>
                  <p className="text-slate-300 leading-relaxed">{selectedPractice.desc}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <p className="font-bold text-[#E2C044]">Governing Acts & Statutes:</p>
                  <p className="text-slate-300">{selectedPractice.statutes}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <p className="font-bold text-emerald-400">Typical Resolution Timeline:</p>
                  <p className="text-slate-300">{selectedPractice.typicalTimeline}</p>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <Link href="/book" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] font-extrabold py-3 rounded-xl">
                    Book Consultation For This Bench
                  </Button>
                </Link>
                <Button
                  onClick={() => setSelectedPractice(null)}
                  className="bg-slate-800 text-slate-200 hover:bg-slate-700 px-5 rounded-xl font-bold"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* NEW Interactive Legal Fee & Consultation Estimator */}
      <section id="estimator" className="py-24 border-t border-slate-800 bg-slate-900/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-xs font-bold text-cyan-400">
              <Calculator className="h-3.5 w-3.5" /> Instant Fee Transparency
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
              Interactive Consultation Fee Estimator
            </h2>
            <p className="text-sm text-slate-300">
              Select your legal bench, court jurisdiction, and urgency to view an instant estimate of counsel retainer and consultation fees.
            </p>
          </div>

          <div className="max-w-4xl mx-auto glass-panel rounded-3xl p-8 border border-slate-800 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Option 1: Case Bench */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#E2C044] uppercase tracking-wider block">
                  1. Matter Category
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'bail', label: 'Criminal Defense / Bail' },
                    { id: 'property', label: 'Civil / Property Audit' },
                    { id: 'corporate', label: 'Corporate & Contracts' },
                    { id: 'family', label: 'Family / Estate Settlement' },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setCaseType(item.id as any)}
                      className={`text-xs font-semibold p-3 rounded-xl text-left border transition ${
                        caseType === item.id
                          ? 'bg-[#E2C044]/20 border-[#E2C044] text-white font-bold'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 2: Court Jurisdiction */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                  2. Court Forum
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'district', label: 'District Court / Tribunal' },
                    { id: 'high', label: 'High Court Bench' },
                    { id: 'supreme', label: 'Supreme Court of India' },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setCourtLevel(item.id as any)}
                      className={`text-xs font-semibold p-3 rounded-xl text-left border transition ${
                        courtLevel === item.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 3: Urgency */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  3. Urgency Level
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'standard', label: 'Standard (7-10 Days)' },
                    { id: 'expedited', label: 'Expedited (3-5 Days)' },
                    { id: 'emergency', label: '24-Hour Emergency Bail' },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setUrgency(item.id as any)}
                      className={`text-xs font-semibold p-3 rounded-xl text-left border transition ${
                        urgency === item.id
                          ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Calculated Output Box */}
            <div className="mt-8 pt-8 border-t border-slate-800 bg-slate-950/80 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-xs text-slate-400 font-medium">Estimated Consultation & Retainer:</span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-4xl font-extrabold font-heading gold-gradient-text">
                    ₹{estimate.fee.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-400">
                    (Initial Retainer: ₹{estimate.retainer.toLocaleString('en-IN')})
                  </span>
                </div>
                <p className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5" /> Turnaround: {estimate.timeframe}
                </p>
              </div>

              <Link href="/book">
                <Button className="bg-gradient-to-r from-[#E2C044] via-[#F3E5AB] to-[#B8860B] text-[#0B132B] font-extrabold px-8 py-4 rounded-xl shadow-xl shadow-[#E2C044]/20 hover:scale-105 transition">
                  Lock Slot at Estimated Fee
                </Button>
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* Filterable Verified Testimonial Showcase */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950 border border-purple-500/40 text-xs font-bold text-purple-300">
            <Star className="h-3.5 w-3.5 fill-current text-[#E2C044]" /> Client Verification
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">Client Feedback & Precedents</h2>
          
          <div className="flex justify-center gap-2 pt-2">
            {[
              { id: 'all', label: 'All Reviews' },
              { id: 'corporate', label: 'Corporate' },
              { id: 'civil', label: 'Land & Civil' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setTestimonialFilter(f.id as any)}
                className={`text-xs font-bold px-4 py-1.5 rounded-lg border transition ${
                  testimonialFilter === f.id
                    ? 'bg-[#E2C044] text-[#0B132B] border-[#E2C044]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredTestimonials.map((t, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-[#E2C044] mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs italic text-slate-300 leading-relaxed mb-6">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#E2C044] to-[#B8860B] text-[#0B132B] font-extrabold flex items-center justify-center text-xs">
                  {t.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{t.author}</p>
                  <p className="text-[10px] text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Booking CTA Banner */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-panel rounded-3xl p-10 lg:p-16 border border-[#E2C044]/30 text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#E2C044]/10 rounded-full blur-3xl pointer-events-none" />
            
            <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">
              Ready to Secure Legal Counsel?
            </h2>
            <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Schedule a confidential evaluation with our senior advocates. Pick your practice area and check real-time calendar availability.
            </p>
            
            <div className="pt-2">
              <Link href="/book">
                <Button className="bg-gradient-to-r from-[#E2C044] via-[#F3E5AB] to-[#B8860B] text-[#0B132B] font-extrabold px-10 py-4 text-base rounded-2xl shadow-xl shadow-[#E2C044]/25 hover:scale-105 transition duration-300">
                  Book Immediate Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingWidgets />
    </div>
  );
}
```

---

### File: `src/app/(public)/book/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { FloatingWidgets } from '@/components/floating-widgets';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/components/providers';
import { CheckCircle2, ArrowRight, Download, CalendarDays, Sparkles, Clock, ShieldCheck } from 'lucide-react';

function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function BookPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [slots, setSlots] = useState<{ slot: string; capacityLeft: number; isAvailable: boolean }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [appointment, setAppointment] = useState<any>(null);

  useEffect(() => {
    if (!selectedDate) return;
    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSelectedSlot('');
      try {
        const dateStr = toLocalDateStr(selectedDate);
        const res = await fetch(`/api/appointments/slots?date=${dateStr}`);
        const data = await res.json();
        if (data.slots) {
          setSlots(data.slots);
        } else {
          toast(data.message || 'Chambers are closed on this date.', 'info');
          setSlots([]);
        }
      } catch {
        toast('Failed to load slots.', 'error');
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedDate]);

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedSlot) {
      toast('Please select a date and an available time slot.', 'error');
      return;
    }
    if (!session) {
      toast('Please sign in to continue with booking.', 'info');
      router.push('/login?callbackUrl=/book');
      return;
    }

    setSubmitting(true);
    try {
      const localDateStr = toLocalDateStr(selectedDate);

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: session.user.id,
          date: `${localDateStr}T00:00:00.000Z`,
          timeSlot: selectedSlot,
          caseType: 'General',
          feePaid: 0,
          notes,
          status: 'CONFIRMED',
          paymentId: 'DIRECT_BOOKING',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAppointment({ ...data.appointment, localDate: localDateStr });
        setStep(2);
        toast('Appointment confirmed!', 'success');
      } else {
        toast(data.error || 'Booking failed. Please try again.', 'error');
      }
    } catch {
      toast('Network error. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadICS = () => {
    if (!appointment) return;
    const dateStr = appointment.localDate.replace(/-/g, '');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MLR Associates//Calendar//EN',
      'BEGIN:VEVENT',
      `UID:${appointment.id}@mlrassociates.in`,
      `DTSTAMP:${dateStr}T000000Z`,
      `DTSTART;VALUE=DATE:${dateStr}`,
      `SUMMARY:Consultation at MLR Associates`,
      `DESCRIPTION:Slot: ${selectedSlot}. ${notes || ''}`,
      'LOCATION:MLR Associates Chambers',
      'DURATION:PT1H',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `consultation_${appointment.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const disabledDays = (date: Date) => {
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 5);
    return date.getDay() === 0 || date < today || date > maxDate;
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen mesh-bg text-slate-100 font-sans">
      <Navbar />

      <main className="flex-1 py-14 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Header Title */}
        <div className="text-center mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E2C044]/15 border border-[#E2C044]/30 text-xs font-bold text-[#E2C044]">
            <Sparkles className="h-3.5 w-3.5" /> Fast-Track Booking Desk
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">
            Schedule Counsel Consultation
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Pick a date to view live available slots at MLR ASSOCIATES Chambers.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-10 max-w-sm mx-auto">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span className={step >= 1 ? 'text-[#E2C044]' : ''}>1. Schedule Slot</span>
            <span className={step >= 2 ? 'text-[#E2C044]' : ''}>2. Confirmed</span>
          </div>
          <div className="relative w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#E2C044] to-[#F59E0B] transition-all duration-500"
              style={{ width: `${(step - 1) * 100}%` }}
            />
          </div>
        </div>

        {/* ── STEP 1: Date & Time ── */}
        {step === 1 && (
          <div className="glass-panel rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Calendar Container */}
              <div className="md:col-span-5 flex flex-col items-center bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-inner">
                <p className="text-xs font-bold text-[#E2C044] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" /> Pick Hearing Date
                </p>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={disabledDays}
                  className="rounded-xl border-0 text-white"
                />
              </div>

              {/* Slots Container */}
              <div className="md:col-span-7 space-y-5">
                <Label className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                  {selectedDate
                    ? `Available Slots — ${selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}`
                    : '2. Select Chamber Slot'}
                </Label>

                {!selectedDate ? (
                  <div className="text-center py-14 bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl text-xs text-slate-400 font-semibold">
                    ← Select a date on the calendar to inspect live available slots
                  </div>
                ) : loadingSlots ? (
                  <div className="flex justify-center items-center py-14">
                    <div className="h-8 w-8 border-4 border-slate-800 border-t-[#E2C044] rounded-full animate-spin" />
                  </div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-10 bg-rose-950/60 border border-rose-800/80 rounded-2xl text-xs text-rose-300 font-semibold">
                    Chambers are closed on this date. Please select another day.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {slots.map((s, idx) => (
                      <button
                        key={idx}
                        disabled={!s.isAvailable}
                        onClick={() => setSelectedSlot(s.slot)}
                        className={`p-3.5 rounded-xl text-xs font-bold border transition duration-200 flex flex-col items-center gap-1.5 ${
                          !s.isAvailable
                            ? 'bg-slate-900/40 text-slate-600 border-slate-900 cursor-not-allowed'
                            : selectedSlot === s.slot
                              ? 'bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] border-[#E2C044] shadow-lg shadow-[#E2C044]/25'
                              : 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-[#E2C044]'
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {s.slot}
                        </span>
                        {s.isAvailable && s.capacityLeft <= 2 && (
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                            selectedSlot === s.slot ? 'bg-[#0B132B] text-[#E2C044]' : 'bg-rose-950 border border-rose-500/40 text-rose-400'
                          }`}>
                            Only {s.capacityLeft} left
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {selectedSlot && (
                  <div className="space-y-2 pt-2 animate-in fade-in duration-200">
                    <Label htmlFor="notes" className="text-xs font-bold text-slate-300">
                      Brief Case / Legal Summary <span className="font-normal text-slate-500">(Optional)</span>
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Briefly state your matter (e.g. Land Partition, High Court Bail Appeal, Contract Audit)..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="border-slate-800 bg-slate-950/80 focus:border-[#E2C044] text-slate-200 text-xs min-h-[90px] rounded-xl"
                    />
                  </div>
                )}

                {selectedDate && selectedSlot && (
                  <div className="bg-[#E2C044]/10 border border-[#E2C044]/30 rounded-xl p-4 text-xs space-y-1.5">
                    <p className="font-bold gold-gradient-text flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-[#E2C044]" /> Appointment Reservation Summary
                    </p>
                    <p className="text-slate-300">
                      📅 {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-slate-300">🕐 {selectedSlot}</p>
                    <p className="text-slate-300">📍 MLR ASSOCIATES Chambers</p>
                  </div>
                )}
              </div>

            </div>

            <div className="flex justify-end border-t border-slate-800 pt-6">
              <Button
                onClick={handleBookAppointment}
                disabled={submitting || !selectedSlot || !selectedDate}
                className="bg-gradient-to-r from-[#E2C044] via-[#F3E5AB] to-[#B8860B] text-[#0B132B] hover:brightness-110 text-sm font-extrabold px-8 py-3.5 rounded-xl shadow-xl shadow-[#E2C044]/20 flex items-center gap-2 transition duration-200"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-[#0B132B] border-t-white rounded-full animate-spin" />
                    Confirming Reservation…
                  </>
                ) : (
                  <>Lock Appointment Slot <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Confirmation ── */}
        {step === 2 && appointment && (
          <div className="max-w-md mx-auto space-y-6">
            <Card className="border border-emerald-500/40 shadow-2xl bg-slate-900/90 text-slate-100 rounded-3xl overflow-hidden backdrop-blur-xl">
              <div className="bg-gradient-to-br from-emerald-600 to-teal-800 p-8 text-white text-center">
                <CheckCircle2 className="h-16 w-16 mx-auto mb-3 text-emerald-200 animate-bounce" />
                <h3 className="text-2xl font-extrabold font-heading">Consultation Confirmed!</h3>
                <p className="text-xs text-emerald-200 mt-1">
                  Chamber Ref: <span className="font-bold">{appointment.id.split('-')[0].toUpperCase()}</span>
                </p>
              </div>

              <CardContent className="pt-6 space-y-4">
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-400">Date</span>
                    <span className="font-bold text-white">
                      {selectedDate?.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-400">Time Slot</span>
                    <span className="font-bold text-white">{selectedSlot}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-400">Chambers</span>
                    <span className="font-bold text-white">MLR ASSOCIATES</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-400">Status</span>
                    <span className="font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-full">
                      Confirmed
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-[#E2C044]">Next Steps:</strong> Our advocates registry will review your brief notes. Please bring any relevant document copies to your session.
                </div>
              </CardContent>

              <CardFooter className="border-t border-slate-800 pt-4 flex flex-col gap-3">
                <Button
                  onClick={downloadICS}
                  className="w-full bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" /> Download iCal (.ics) Calendar File
                </Button>
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs py-3 rounded-xl hover:bg-slate-700"
                >
                  Go to Client Portal <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </main>

      <Footer />
      <FloatingWidgets />
    </div>
  );
}
```

---

### File: `src/app/(public)/contact/page.tsx`

```typescript
'use client';

import React from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { FloatingWidgets, OfficeHoursBadge } from '@/components/floating-widgets';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Phone, Mail, MapPin, ExternalLink, HelpCircle } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F5F0E8] text-[#0A1628]">
      <Navbar />

      <main className="flex-1 py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="space-y-3 mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-[#0A1628]">Our Chambers & Location</h1>
          <div className="h-1 w-12 bg-[#C9A84C] mx-auto rounded" />
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Visit our chambers or contact our administrators to discuss your litigation schedule.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border border-[#DCD6C5] shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-heading text-[#0A1628]">Office Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-[#DCD6C5]/50">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Current Timing</span>
                  <OfficeHoursBadge />
                </div>
                
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span className="font-semibold">Monday - Friday</span>
                    <span>10:00 AM - 06:00 PM IST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Saturday</span>
                    <span>10:00 AM - 04:00 PM IST</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span className="font-semibold">Sunday & Court Holidays</span>
                    <span>Closed</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[#DCD6C5] shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-heading text-[#0A1628]">Direct Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <a
                  href="tel:+919444019923"
                  className="flex items-center gap-4 p-3 rounded-lg border border-[#DCD6C5]/40 hover:border-[#C9A84C] bg-gray-50 hover:bg-[#C9A84C]/5 transition duration-200 group"
                >
                  <div className="h-9 w-9 rounded-full bg-[#0A1628]/5 flex items-center justify-center text-[#0A1628] group-hover:bg-[#0A1628] group-hover:text-[#C9A84C] transition duration-200">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500">Call Administrative Clerk</p>
                    <p className="text-sm font-bold text-[#0A1628]">+91 94440 19923</p>
                  </div>
                </a>

                <a
                  href="mailto:contact@mlrassociates.in"
                  className="flex items-center gap-4 p-3 rounded-lg border border-[#DCD6C5]/40 hover:border-[#C9A84C] bg-gray-50 hover:bg-[#C9A84C]/5 transition duration-200 group"
                >
                  <div className="h-9 w-9 rounded-full bg-[#0A1628]/5 flex items-center justify-center text-[#0A1628] group-hover:bg-[#0A1628] group-hover:text-[#C9A84C] transition duration-200">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500">Send Consultation Brief</p>
                    <p className="text-sm font-bold text-[#0A1628]">contact@mlrassociates.in</p>
                  </div>
                </a>

                <div className="flex items-start gap-4 p-3 rounded-lg border border-[#DCD6C5]/40 bg-gray-50">
                  <div className="h-9 w-9 rounded-full bg-[#0A1628]/5 flex items-center justify-center text-[#0A1628] mt-0.5">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500">Chambers Location</p>
                    <p className="text-xs font-bold text-[#0A1628] leading-relaxed">
                      130, Nungambakkam High Rd, next to Ispahani Center,
                      Thousand Lights West, Chennai, Tamil Nadu 600006
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Google Map */}
          <div className="lg:col-span-7 h-full min-h-[400px]">
            <Card className="border border-[#DCD6C5] shadow-sm overflow-hidden h-full flex flex-col bg-white">
              <div className="p-4 border-b border-[#DCD6C5] flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-sm text-[#0A1628]">Interactive Route Map</h3>
                  <p className="text-[10px] text-gray-500">Chambers situated near the High Court</p>
                </div>
                <a
                  href="https://maps.app.goo.gl/aSKwyw94GxnJEyJo9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#C9A84C] hover:underline flex items-center gap-1"
                >
                  Open in Maps <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="flex-1 min-h-[350px] bg-gray-100 relative">
                {/* Embedded Map pointing to Ispahani Center, Nungambakkam, Chennai */}
                <iframe
                  title="MLR Associates Chambers Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.6463393997684!2d80.24300827480867!3d13.062283187264217!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5266124ef1b0c9%3A0xdbf2c9c5e0ff5e6!2sIspahani%20Center!5e0!3m2!1sen!2sin!4v1718610000000!5m2!1sen!2sin"
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
      <FloatingWidgets />
    </div>
  );
}
```

---

### File: `src/app/(public)/privacy/page.tsx`

```typescript
'use client';

import React from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { FloatingWidgets } from '@/components/floating-widgets';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Shield, Lock, Trash2, Eye } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F5F0E8] text-[#0A1628]">
      <Navbar />

      <main className="flex-1 py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-3 mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-[#0A1628]">Privacy Policy & DPDP Compliance</h1>
          <div className="h-1 w-12 bg-[#C9A84C] mx-auto rounded" />
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
            In Accordance with the Digital Personal Data Protection (DPDP) Act, 2023 (India)
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="border border-[#DCD6C5] shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-heading text-[#0A1628] flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#C9A84C]" /> 1. Data Collection Notice
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-600 space-y-2 leading-relaxed">
              <p>
                MLR Associates (collectively "we", "us", "our") acts as a <strong>Data Fiduciary</strong> under the DPDP Act 2023. We collect personal identifiers including names, email addresses, phone numbers, billing/payment info, and court litigation documents.
              </p>
              <p>
                <strong>Purpose of Processing:</strong> Data is collected solely to process consultation scheduling, legal defense preparation, billing, and communication. We do not sell or lease user information.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-[#DCD6C5] shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-heading text-[#0A1628] flex items-center gap-2">
                <Lock className="h-5 w-5 text-[#C9A84C]" /> 2. Security & Storage Policies (AES-256)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-600 space-y-2 leading-relaxed">
              <p>
                All uploaded litigation drafts, identity proofs, and pleadings are uploaded securely through SSL encryption and stored in our Cloudinary document vaults.
              </p>
              <p>
                <strong>Security Guardrails:</strong> Sensitive user files are mapped with restricted role access. Direct database columns housing file references are encrypted using AES-256 standards, preventing unauthorized breach or enumeration.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-[#DCD6C5] shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-heading text-[#0A1628] flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-[#C9A84C]" /> 3. Data Principal Rights (Correction & Erasure)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-600 space-y-2 leading-relaxed">
              <p>
                Under Section 6 of the DPDP Act 2023, you retain rights as a <strong>Data Principal</strong>:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Right to Access:</strong> View all appointments, cases, and documents on your Client Desk dashboard.</li>
                <li><strong>Right to Correction:</strong> Request updates to inaccurate phone numbers or credentials.</li>
                <li><strong>Right to Erasure / Withdrawal:</strong> Request archiving of your client account or file deletion for closed litigation.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border border-[#DCD6C5] shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-heading text-[#0A1628] flex items-center gap-2">
                <Eye className="h-5 w-5 text-[#C9A84C]" /> 4. Consent Manager & Grievance Redressal
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-600 space-y-2 leading-relaxed">
              <p>
                You may contact our designated <strong>Consent & Grievance Officer</strong> for dispute resolution, breach report, or erasure requests:
              </p>
              <div className="mt-3 p-3 bg-[#F5F0E8]/50 border border-[#DCD6C5]/50 rounded text-xs space-y-1">
                <p><strong>Officer:</strong> Advocate Aditi Verma</p>
                <p><strong>Email:</strong> compliance@mlrassociates.in</p>
                <p><strong>Chambers:</strong> 130, Nungambakkam High Rd, next to Ispahani Center, Thousand Lights, Chennai, TN - 600006</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
      <FloatingWidgets />
    </div>
  );
}
```

---

### File: `src/app/(public)/testimonials/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { FloatingWidgets } from '@/components/floating-widgets';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/providers';
import { Star, CheckCircle, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';

interface TestimonialItem {
  id: string;
  rating: number;
  body: string;
  caseType: string;
  verified: boolean;
  createdAt: string;
  client: {
    name: string;
  };
}

export default function TestimonialsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [rating, setRating] = useState('5');
  const [caseType, setCaseType] = useState('Criminal');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Developer/Reviewer bypass toggle
  const [bypassCheck, setBypassCheck] = useState(false);
  const [hasClosedCase, setHasClosedCase] = useState(false);
  const [checkingCase, setCheckingCase] = useState(false);

  // Mobile Carousel Control
  const [carouselIndex, setCarouselIndex] = useState(0);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/testimonials');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTestimonials(data);
      }
    } catch (err) {
      console.error('Error fetching testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkUserCaseStatus = async () => {
    if (!session) return;
    setCheckingCase(true);
    try {
      // Query cases associated with this user
      const res = await fetch('/api/cases');
      const data = await res.json();
      if (Array.isArray(data)) {
        // Check if any case is CLOSED
        const closed = data.some((c: any) => c.status === 'CLOSED');
        setHasClosedCase(closed);
      }
    } catch (err) {
      console.error('Error checking case status:', err);
    } finally {
      setCheckingCase(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (session) {
      checkUserCaseStatus();
    } else {
      setHasClosedCase(false);
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment) {
      toast('Please write a review comment.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // If bypass is checked, we bypass database verification check on API side by mocking it
      const endpoint = bypassCheck ? '/api/testimonials/mock' : '/api/testimonials';
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment, caseType }),
      });

      const data = await res.json();
      if (res.ok) {
        toast('Testimonial submitted successfully!', 'success');
        setComment('');
        fetchTestimonials();
      } else {
        toast(data.error || 'Failed to submit review.', 'error');
      }
    } catch (err) {
      toast('An unexpected error occurred.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Mobile Carousel Controls
  const handlePrev = () => {
    if (testimonials.length === 0) return;
    setCarouselIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (testimonials.length === 0) return;
    setCarouselIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  // Determine if testimonial submission form is unlocked
  const isFormUnlocked = session && (hasClosedCase || bypassCheck);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F5F0E8] text-[#0A1628]">
      <Navbar />

      <main className="flex-1 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="space-y-3 mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-[#0A1628]">Verified Client Testimonials</h1>
          <div className="h-1 w-12 bg-[#C9A84C] mx-auto rounded" />
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Transparent case feedback in adherence with Bar Council guidelines.
          </p>
        </div>

        {/* Display Section */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="h-8 w-8 border-4 border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin"></div>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-xs font-semibold bg-white border border-[#DCD6C5] rounded p-6">
            No testimonials found.
          </div>
        ) : (
          <div className="mb-16">
            {/* Desktop Masonry/Grid (sm/md+) */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <Card key={t.id} className="border border-[#DCD6C5] bg-white hover:border-[#C9A84C]/50 shadow-sm transition duration-300">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[#C9A84C]">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-[10px] bg-[#0A1628]/5 text-[#0A1628] font-bold px-2 py-0.5 rounded-full">
                        {t.caseType}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed italic">
                      "{t.body}"
                    </p>

                    <div className="flex items-center justify-between border-t border-[#DCD6C5]/30 pt-3">
                      <div>
                        <p className="text-xs font-bold text-[#0A1628]">{t.client.name}</p>
                        <p className="text-[9px] text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</p>
                      </div>
                      {t.verified && (
                        <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          <ShieldCheck className="h-3 w-3" /> Verified Client
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Mobile Carousel (xs/mobile only) */}
            <div className="md:hidden flex flex-col items-center gap-4">
              <div className="w-full max-w-sm relative">
                {testimonials.map((t, idx) => (
                  <div
                    key={t.id}
                    className={`transition-all duration-300 ${
                      idx === carouselIndex ? 'block opacity-100' : 'hidden opacity-0'
                    }`}
                  >
                    <Card className="border border-[#DCD6C5] bg-white shadow-sm">
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[#C9A84C]">
                            {[...Array(t.rating)].map((_, i) => (
                              <Star key={i} className="h-3.5 w-3.5 fill-current" />
                            ))}
                          </div>
                          <span className="text-[10px] bg-[#0A1628]/5 text-[#0A1628] font-bold px-2 py-0.5 rounded-full">
                            {t.caseType}
                          </span>
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed italic">
                          "{t.body}"
                        </p>

                        <div className="flex items-center justify-between border-t border-[#DCD6C5]/30 pt-3">
                          <div>
                            <p className="text-xs font-bold text-[#0A1628]">{t.client.name}</p>
                            <p className="text-[9px] text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</p>
                          </div>
                          {t.verified && (
                            <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                              <ShieldCheck className="h-3 w-3" /> Verified Client
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>

              {/* Carousel Controls */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={handlePrev}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full border-[#DCD6C5] text-[#0A1628] hover:border-[#C9A84C]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs font-semibold text-gray-500">
                  {carouselIndex + 1} / {testimonials.length}
                </span>
                <Button
                  onClick={handleNext}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full border-[#DCD6C5] text-[#0A1628] hover:border-[#C9A84C]"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Submit Review Form Section */}
        <div className="max-w-xl mx-auto">
          <Card className="border border-[#DCD6C5] bg-white shadow-md">
            <CardHeader className="border-b border-[#DCD6C5]/40 flex flex-col gap-2">
              <CardTitle className="text-xl font-heading text-[#0A1628] flex items-center justify-between">
                <span>Submit Client Review</span>
                {!session && (
                  <span className="text-[10px] text-rose-600 font-semibold bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
                    Locked
                  </span>
                )}
              </CardTitle>
              
              {/* Developer Bypass Toggle */}
              {session && (
                <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded p-2.5 mt-2">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-amber-800">Reviewer Quick-Bypass</p>
                    <p className="text-[9px] text-amber-700">Simulate concluding a client case immediately</p>
                  </div>
                  <Button
                    onClick={() => setBypassCheck(!bypassCheck)}
                    className={`text-[9px] h-7 px-3 py-1 font-semibold shadow-sm transition ${
                      bypassCheck ? 'bg-amber-600 text-white' : 'bg-white border border-amber-300 text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    {bypassCheck ? 'Bypass ON (Unlocked)' : 'Activate Bypass'}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              {!session ? (
                <div className="text-center py-6">
                  <p className="text-xs text-gray-500 font-semibold mb-4">
                    Testimonials are restricted to verified clients with closed cases.
                  </p>
                  <Button
                    onClick={() => window.location.href = '/login'}
                    className="bg-[#0A1628] text-[#F5F0E8] hover:bg-[#0A1628]/95 font-semibold text-xs py-2 px-4"
                  >
                    Sign In to Check Status
                  </Button>
                </div>
              ) : !isFormUnlocked ? (
                <div className="text-center py-6 space-y-4">
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700 max-w-sm mx-auto leading-relaxed">
                    Account Status: <strong>No CLOSED cases detected</strong>. Under BCI regulations, testimonials can only be submitted post case resolution.
                  </div>
                  <p className="text-[10px] text-gray-400">
                    Use the 'Reviewer Quick-Bypass' switch at the top of the card to write a review for evaluation.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rating" className="text-xs font-semibold text-gray-600">Star Rating</Label>
                      <Select value={rating} onValueChange={(val) => setRating(val || '')}>
                        <SelectTrigger className="border-[#DCD6C5] text-xs">
                          <SelectValue placeholder="Select Star" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="5" className="text-xs">⭐⭐⭐⭐⭐ (5 Stars)</SelectItem>
                          <SelectItem value="4" className="text-xs">⭐⭐⭐⭐ (4 Stars)</SelectItem>
                          <SelectItem value="3" className="text-xs">⭐⭐⭐ (3 Stars)</SelectItem>
                          <SelectItem value="2" className="text-xs">⭐⭐ (2 Stars)</SelectItem>
                          <SelectItem value="1" className="text-xs">⭐ (1 Star)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="caseType" className="text-xs font-semibold text-gray-600">Case Category</Label>
                      <Select value={caseType} onValueChange={(val) => setCaseType(val || '')}>
                        <SelectTrigger className="border-[#DCD6C5] text-xs">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-xs">
                          <SelectItem value="Criminal" className="text-xs">Criminal Defense</SelectItem>
                          <SelectItem value="Civil" className="text-xs">Civil Litigation</SelectItem>
                          <SelectItem value="Corporate" className="text-xs">Corporate Advisory</SelectItem>
                          <SelectItem value="Family" className="text-xs">Family Law</SelectItem>
                          <SelectItem value="Property" className="text-xs">Property Title</SelectItem>
                          <SelectItem value="Labour" className="text-xs">Labour Disputes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comment" className="text-xs font-semibold text-gray-600">Your Review</Label>
                    <Textarea
                      id="comment"
                      placeholder="Share your experience working with MLR Associates..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="border-[#DCD6C5] focus:border-[#C9A84C] text-xs min-h-[90px]"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#0A1628] text-[#F5F0E8] hover:bg-[#0A1628]/90 font-semibold text-xs py-2"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Verified Testimonial'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
      <FloatingWidgets />
    </div>
  );
}
```

---

### File: `src/app/(public)/upload/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { FloatingWidgets } from '@/components/floating-widgets';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/providers';
import { ShieldAlert, Upload, Lock, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function UploadPage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [docType, setDocType] = useState('ID Proof');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedDoc, setUploadedDoc] = useState<any>(null);

  // Link choices
  const [linkedId, setLinkedId] = useState('none');
  const [cases, setCases] = useState<{ id: string; caseNumber: string; title: string }[]>([]);
  const [appointments, setAppointments] = useState<{ id: string; date: string; timeSlot: string }[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(false);

  useEffect(() => {
    if (session) {
      const fetchLinkables = async () => {
        setLoadingLinks(true);
        try {
          // Fetch cases
          const casesRes = await fetch('/api/cases');
          if (casesRes.ok) {
            const casesData = await casesRes.json();
            setCases(casesData);
          }
          // Fetch appointments
          const apptsRes = await fetch('/api/appointments');
          if (apptsRes.ok) {
            const apptsData = await apptsRes.json();
            setAppointments(apptsData);
          }
        } catch (err) {
          console.error('Error fetching linkable items:', err);
        } finally {
          setLoadingLinks(false);
        }
      };
      fetchLinkables();
    }
  }, [session]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Max 10MB check
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast('File size exceeds 10MB limit.', 'error');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setUploadedDoc(null);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast('Please choose a file to upload.', 'error');
      return;
    }

    setUploading(true);
    setProgress(0);

    // Simulate direct-to-cloud upload progress bar
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          saveDocMetadata();
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const saveDocMetadata = async () => {
    if (!file) return;
    try {
      // Mock Cloudinary URL response
      const mockCloudinaryUrl = `https://res.cloudinary.com/demo/image/upload/v1570979139/law_chambers_${Date.now()}_${file.name}`;
      
      const payload: any = {
        name: file.name,
        url: mockCloudinaryUrl,
        type: docType,
      };

      // Handle linked ID properties
      if (linkedId !== 'none') {
        if (linkedId.startsWith('case_')) {
          payload.caseId = linkedId.replace('case_', '');
        } else if (linkedId.startsWith('appt_')) {
          payload.appointmentId = linkedId.replace('appt_', '');
        }
      }

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setUploadedDoc(data.document);
        toast('Document uploaded & encrypted!', 'success');
        setFile(null);
      } else {
        toast(data.error || 'Failed to save document details.', 'error');
      }
    } catch (err) {
      toast('Upload verification failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F5F0E8] text-[#0A1628]">
      <Navbar />

      <main className="flex-1 py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="space-y-3 mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-[#0A1628]">Secure Document Vault</h1>
          <div className="h-1 w-12 bg-[#C9A84C] mx-auto rounded" />
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Upload identity documents, contracts, or court summons drafts.
          </p>
        </div>

        {/* DPDP and Encryption Banner */}
        <div className="bg-[#0A1628]/5 border border-[#C9A84C]/20 rounded-lg p-4 mb-8 max-w-2xl mx-auto flex items-start gap-3.5">
          <Lock className="h-5 w-5 text-[#C9A84C] mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-[#0A1628] uppercase tracking-wider">AES-256 Storage safeguards</h4>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              We encrypt all court pleadings and file references using local AES-256 algorithms. Data transmission is secured using TLS 1.3 tunnels. Upload size is restricted to <strong>10MB (PDF, JPG, PNG)</strong>.
            </p>
          </div>
        </div>

        <div className="max-w-xl mx-auto">
          <Card className="border border-[#DCD6C5] bg-white shadow-md">
            <CardHeader className="border-b border-[#DCD6C5]/30">
              <CardTitle className="text-lg font-heading text-[#0A1628]">Upload Form</CardTitle>
            </CardHeader>
            
            <CardContent className="pt-6">
              {!session ? (
                <div className="text-center py-8">
                  <p className="text-xs text-gray-500 font-semibold mb-4">
                    Access is restricted. Please sign in to verify your identity.
                  </p>
                  <Button
                    onClick={() => window.location.href = '/login?callbackUrl=/upload'}
                    className="bg-[#0A1628] text-white hover:bg-[#0A1628]/95 text-xs font-semibold"
                  >
                    Client Sign In
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleUploadSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Document Type Selector */}
                    <div className="space-y-2">
                      <Label htmlFor="docType" className="text-xs font-semibold text-gray-600">Document Category</Label>
                      <Select value={docType} onValueChange={(val) => setDocType(val || '')}>
                        <SelectTrigger className="border-[#DCD6C5] text-xs">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="ID Proof" className="text-xs">ID Proof (Aadhaar/PAN)</SelectItem>
                          <SelectItem value="Contract" className="text-xs">Contract Agreement</SelectItem>
                          <SelectItem value="Court Notice" className="text-xs">Court Notice / Summons</SelectItem>
                          <SelectItem value="Other" className="text-xs">Other Litigation Files</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Linked Case or Appointment */}
                    <div className="space-y-2">
                      <Label htmlFor="linkage" className="text-xs font-semibold text-gray-600">Associate With</Label>
                      <Select value={linkedId} onValueChange={(val) => setLinkedId(val || '')}>
                        <SelectTrigger className="border-[#DCD6C5] text-xs">
                          <SelectValue placeholder="Associate With" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-xs">
                          <SelectItem value="none" className="text-xs">No Association (General)</SelectItem>
                          {cases.map((c) => (
                            <SelectItem key={c.id} value={`case_${c.id}`} className="text-xs">
                              Case: {c.caseNumber}
                            </SelectItem>
                          ))}
                          {appointments.map((a) => (
                            <SelectItem key={a.id} value={`appt_${a.id}`} className="text-xs">
                              Consultation: {new Date(a.date).toLocaleDateString()} ({a.timeSlot})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* File Upload Selector */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-600">Choose File</Label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#DCD6C5] hover:border-[#C9A84C]/50 rounded-lg cursor-pointer bg-gray-50/50 hover:bg-gray-50/80 transition duration-200">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-xs font-medium text-gray-500">
                            {file ? file.name : 'Select PDF, JPG, PNG (Max 10MB)'}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Drag and drop or click'}
                          </p>
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-gray-500">
                        <span>Uploading to secure vaults...</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded">
                        <div
                          className="h-full bg-emerald-600 rounded transition-all duration-200"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Success indicator */}
                  {uploadedDoc && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2 text-xs text-emerald-700 leading-relaxed">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold">File Encryption Complete</p>
                        <p className="text-[10px] text-emerald-600">Saved: {uploadedDoc.name}</p>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-[#0A1628] text-white hover:bg-[#0A1628]/90 font-semibold text-xs py-2"
                    disabled={uploading || !file}
                  >
                    {uploading ? 'Processing File...' : 'Upload & Encrypt'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
      <FloatingWidgets />
    </div>
  );
}
```

---

