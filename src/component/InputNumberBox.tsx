import React, { useState, ChangeEvent } from 'react';
import styles from '../app/page.module.css'

// Define a type for the component's props
type InputNumberBoxProps = {
  label: string;
  defaultValue: number;
  onChange: (number: number | undefined) => void;
};

const InputNumberBox: React.FC<InputNumberBoxProps> = ({ label, defaultValue, onChange }) => {
  const [value, setValue] = useState<number | undefined>(defaultValue);

  // Update the state and call the onChange prop function
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === '' ? undefined : Number(e.target.value);
    setValue(newValue);
    onChange(newValue);
  };

  return (
    <div className={styles["input-number__box"]}>
      <label>
        {label}
      </label>
      <input value={value} type='number' onChange={handleChange} />
    </div>
  );
};

export default InputNumberBox;
