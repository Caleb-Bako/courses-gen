"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const universities = [
  "Bingham University",
  "Veritas University",
  "Covenant University",
  "Redeemer's University",
  "Bowen University",
];

export function UniversityCombobox({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white text-grey-100 opacity-50 border border-black-100"
        >
          {value ? value : "Select a university..."}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search universities..." />
          <CommandEmpty>No university found.</CommandEmpty>
          <CommandGroup>
            {universities.map((university) => (
              <CommandItem
                key={university}
                onSelect={() => {
                  onChange(university);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    university === value ? "opacity-100" : "opacity-0"
                  )}
                />
                {university}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
