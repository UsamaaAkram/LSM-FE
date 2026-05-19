import React from "react";
import type { SingleValue } from "react-select";
import Select from "react-select";

export interface OptionType {
  label: string;
  value: string | number;
}

interface CustomDropdownProps {
  options: OptionType[];
  value?: OptionType | null;
  defaultValue?: OptionType | null;
  className?: string;
  placeholder?: string;
  modal?: boolean;
  onChange?: (selected: OptionType) => void;
  isDisabled?: boolean;
  isLoading?: boolean;
}

const customStyles = {
  menuPortal: (base: any) => ({
    ...base,
    zIndex: 1056, // Bootstrap modal z-index
  }),
  menu: (base: any) => ({
    ...base,
    zIndex: 1056,
  }),
};

const CustomSelect: React.FC<CustomDropdownProps> = ({
  options,
  value,
  defaultValue,
  className,
  placeholder,
  modal,
  onChange,
  isDisabled,
  isLoading,
}) => {
  // For modals, display dropdown above modal
  const menuPortalTarget = modal ? document.body : undefined;

  return (
    <Select
      options={options}
      value={value || null}
      defaultValue={defaultValue || null}
      className={className}
      placeholder={placeholder || "Select"}
      isDisabled={isDisabled}
      isLoading={isLoading}
      styles={customStyles}
      
      menuPortalTarget={menuPortalTarget}
      onChange={(selectedOption: SingleValue<OptionType>) => {
        if (selectedOption && onChange) {
          onChange(selectedOption);
        }
      }}
    />
  );
};

export default CustomSelect;
