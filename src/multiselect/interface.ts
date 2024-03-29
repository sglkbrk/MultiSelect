import React from "react";

export interface IMultiselectProps {
  id?: string;
  items: any;
  selectedItems?: any;
  variableName?: string;
  selectionMaxLimit?: any;
  placeholder?: string;
  loading?: boolean;
  nodatamsg?: string;
  onSelect?: (selectedList: any, selectedItem: any) => void;
  onRemove?: (selectedList: any, selectedItem: any) => void;
  onSearch?: (value: string) => void;
  onKeyPressFn?: (event: any, value: string) => void;
}
