"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onChange: (value: string) => void
  onCreate?: (value: string) => void
  placeholder?: string
  width?: string
}

export function Combobox({ options, value, onChange, onCreate, placeholder = "Select...", width = "w-full" }: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const selectedLabel = options.find((option) => option.value === value)?.label || value

  const exactMatch = options.some(opt => 
    opt.label.toLowerCase() === inputValue.toLowerCase() || 
    opt.value.toLowerCase() === inputValue.toLowerCase()
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(width, "justify-between font-normal", !value && "text-muted-foreground")}
        >
          {value ? selectedLabel : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn(width, "p-0")} align="start">
        <Command>
          <CommandInput placeholder={`Search or create...`} onValueChange={setInputValue} />
          <CommandList>
            <CommandEmpty>
               {onCreate && inputValue ? (
                   <div className="p-2">
                       <p className="text-sm text-muted-foreground mb-2">No matching attributes found.</p>
                       <Button 
                          variant="secondary" 
                          size="sm" 
                          className="w-full justify-start"
                          onClick={() => {
                              onCreate(inputValue);
                              setOpen(false);
                          }}
                       >
                          <Plus className="mr-2 h-4 w-4" />
                          Create "{inputValue}"
                       </Button>
                   </div>
               ) : (
                  "No attributes found."
               )}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onChange(option.value === value ? "" : option.value)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
            {onCreate && inputValue && !exactMatch && (
              <CommandGroup heading="Custom">
                <CommandItem
                  onSelect={() => {
                    onCreate(inputValue);
                    setOpen(false);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create "{inputValue}"
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
