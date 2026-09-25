import React, { useState } from "react";
import { formatNumberWithCommas, unformatNumber } from "../../helpers/formatterUtility";
import type { FormattedInputProps } from "../../lib/interfaces";

const FormattedInput: React.FC<FormattedInputProps> = ({
  value,
  onChange,
  name,
  className,
  ...props
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const externalDisplayValue =
    value === "" || value === undefined || value === null
      ? ""
      : formatNumberWithCommas(value);

  const displayValue = isFocused ? inputValue : externalDisplayValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;

    if (!/^[0-9,.]*$/.test(nextValue)) return;

    const rawValue = unformatNumber(nextValue);
    const formattedValue =
      nextValue.trim() === "" ? "" : formatNumberWithCommas(nextValue);

    onChange({ target: { name, value: rawValue } });
    setInputValue(formattedValue);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    setInputValue(e.target.value);

    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);

    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  return (
    <input
      {...props}
      type="text"
      name={name}
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={className}
    />
  );
};

export default FormattedInput;
