import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const SearchSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  disabled = false,
  className = "",
  multiple = false,
  returnObject = false,
  getLabel = (opt) => opt?.label || opt?.name || opt?.branch_name || opt?.pipeline_name || opt?.pipeline_sub_name || opt,
  getValue = (opt) => opt?.value || opt?.id || opt,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = options.filter((opt) => {
    const label = String(getLabel(opt) || "");
    return label.toLowerCase().includes(search.toLowerCase());
  });

  const normalizeValue = (item) => {
    if (item && typeof item === "object") {
      return getValue(item);
    }
    return item;
  };

  const isSameOption = (candidate, option) => {
    if (candidate === option) return true;

    if (candidate && typeof candidate === "object" && option && typeof option === "object") {
      return (
        getValue(candidate) === getValue(option) &&
        getLabel(candidate) === getLabel(option)
      );
    }

    return normalizeValue(candidate) === normalizeValue(option);
  };

  const isSelected = (option) => {
    if (multiple) {
      return Array.isArray(value) && value.some((item) => isSameOption(item, option));
    }

    if (value === null || value === undefined) return false;
    return isSameOption(value, option);
  };

  const handleSelect = (option) => {
    const optionValue = getValue(option);

    if (multiple) {
      const current = Array.isArray(value) ? value : [];
      const alreadySelected = current.some((item) => isSameOption(item, option));

      if (alreadySelected) {
        onChange(current.filter((item) => !isSameOption(item, option)));
      } else {
        onChange(returnObject ? [...current, option] : [...current, optionValue]);
      }
    } else {
      onChange(returnObject ? option : optionValue);
      setOpen(false);
    }
  };

  const getDisplayText = () => {
    if (multiple) {
      if (!value || !value.length) return placeholder;
      const selectedLabels = options
        .filter((opt) => value.some((item) => isSameOption(item, opt)))
        .map((opt) => getLabel(opt));
      return selectedLabels.length ? selectedLabels.join(", ") : `${value.length} selected`;
    }

    if (value === null || value === undefined) return placeholder;

    const found = options.find((opt) => isSameOption(value, opt));
    return found ? getLabel(found) : placeholder;
  };

  return (
  <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        disabled={disabled}
        className={cn(
          "w-full justify-between mt-1 font-normal bg-white border border-gray-200 text-left text-sm",
          !value || (multiple && (!value || !value.length))
            ? "text-gray-400"
            : "text-gray-900",
          className
        )}
      >
        <span className="truncate">{getDisplayText()}</span>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
      </Button>
    </PopoverTrigger>

    <PopoverContent
      className="w-[var(--radix-popover-trigger-width)] p-2"
      align="start"
      side="bottom"
    >
      <Input
        placeholder={searchPlaceholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-2 h-8 text-xs"
      />

      <div className="max-h-60 overflow-y-auto">
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option, index) => {
            const val = getValue(option);
            const label = getLabel(option);
            const selected = isSelected(option);

            return (
              <div
                key={`${label}-${index}`}
                onClick={() => handleSelect(option)}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded px-2 py-2 hover:bg-yellow-50",
                  selected && "bg-yellow-100"
                )}
              >
                <span>{label}</span>
                {selected && <Check className="h-4 w-4" />}
              </div>
            );
          })
        ) : (
          <div className="py-2 text-center text-sm text-gray-500">
            No results found.
          </div>
        )}
      </div>
    </PopoverContent>
  </Popover>
);
};
