import React, { useState } from "react";
import { Input } from "@heroui/input";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

type PasswordInputProps = {
  autoComplete?: string;
  className?: string;
  isRequired?: boolean;
  label?: string;
  name?: string;
  placeholder?: string;
  radius?: "none" | "sm" | "md" | "lg" | "full";
  variant?: "bordered" | "flat" | "faded" | "underlined";
};

const PasswordInput: React.FC<PasswordInputProps> = ({
  autoComplete = "current-password",
  className = "",
  isRequired = false,
  label = "Password",
  name,
  placeholder = "Masukkan password",
  radius = "lg",
  variant = "bordered",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full">
      <Input
        autoComplete={autoComplete}
        className={className}
        endContent={
          <button
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="flex items-center justify-center p-2 text-sm bg-white dark:bg-gray-900 shadow-md hover:shadow-lg rounded-full transition-all duration-300 ease-in-out"
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <IconEyeOff
                className="text-gray-600 dark:text-gray-300"
                size={20}
              />
            ) : (
              <IconEye className="text-gray-600 dark:text-gray-300" size={20} />
            )}
          </button>
        }
        isRequired={isRequired}
        label={label}
        name={name}
        placeholder={placeholder}
        radius={radius}
        type={showPassword ? "text" : "password"}
        variant={variant}
      />
    </div>
  );
};

export default PasswordInput;
