import React from 'react';

const TextNumberInput = ({ label, name, value, onChange, placeholder }) => {
  return (
    <div className="grid gap-2 mt-2.5">
      <label htmlFor={name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>
      <input
        type="number"
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        autoComplete="new-password"
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}

export default TextNumberInput;