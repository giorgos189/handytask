
"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/auth/auth";

interface HandymanMultiSelectProps {
  availableHandymen: User[];
  selectedHandymenEmails: string[];
  onChange: (selectedEmails: string[]) => void;
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
}

export function HandymanMultiSelect({
  availableHandymen,
  selectedHandymenEmails,
  onChange,
  placeholder = "Select handymen...",
  className,
  isLoading = false,
}: HandymanMultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelectToggle = (handymanEmail: string) => {
    if (selectedHandymenEmails.includes(handymanEmail)) {
      onChange(selectedHandymenEmails.filter((email) => email !== handymanEmail));
    } else {
      onChange([...selectedHandymenEmails, handymanEmail]);
    }
  };

  const getHandymanNameByEmail = (email: string) => {
    const handyman = availableHandymen.find(h => h.email === email);
    return handyman ? `${handyman.name} ${handyman.surname}` : email.split('@')[0]; // Fallback to email prefix
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-auto min-h-10 py-2 text-left font-normal", className)}
        >
          {selectedHandymenEmails.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedHandymenEmails.map((email) => (
                <Badge
                  variant="secondary"
                  key={email}
                  className="mr-1 cursor-pointer"
                  onClick={(e) => {
                     e.stopPropagation(); // Prevent popover from closing/opening
                     handleSelectToggle(email); // Remove handyman on badge click
                  }}
                >
                  {getHandymanNameByEmail(email)}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search handyman..." />
          <CommandList>
            {isLoading ? (
              <div className="p-4 text-sm text-center text-muted-foreground">Loading...</div>
            ) : (
              <>
                <CommandEmpty>No handyman found.</CommandEmpty>
                <CommandGroup>
                  {availableHandymen.map((handyman) => (
                    <CommandItem
                      key={handyman.id}
                      value={`${handyman.name} ${handyman.surname} ${handyman.email}`} // Ensure value is unique and searchable
                      onSelect={() => {
                        handleSelectToggle(handyman.email);
                        // Do not close popover to allow multiple selections
                      }}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedHandymenEmails.includes(handyman.email)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {handyman.name} {handyman.surname} 
                      <span className="text-xs text-muted-foreground ml-2">({handyman.email})</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
