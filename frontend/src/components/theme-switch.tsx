import { FC, useState, useEffect } from "react";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { SwitchProps, useSwitch } from "@heroui/switch";
import clsx from "clsx";
import { useTheme } from "@heroui/use-theme";
import { IconSun, IconMoon } from "@tabler/icons-react";

export interface ThemeSwitchProps {
  className?: string;
  classNames?: SwitchProps["classNames"];
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({
  className,
  classNames,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  const { theme, setTheme } = useTheme();

  const {
    Component,
    slots,
    isSelected,
    getBaseProps,
    getInputProps,
    getWrapperProps,
  } = useSwitch({
    isSelected: theme === "dark",
    onChange: () => setTheme(theme === "light" ? "dark" : "light"),
  });

  useEffect(() => {
    setIsMounted(true);
  }, [isMounted]);

  // Prevent Hydration Mismatch
  if (!isMounted) return <div className="w-10 h-6" />;

  return (
    <Component
      aria-label={isSelected ? "Switch to light mode" : "Switch to dark mode"}
      {...getBaseProps({
        className: clsx(
          "group inline-flex items-center justify-center",
          "w-10 h-6 p-1",
          "bg-violet-100 dark:bg-violet-900/50",
          "hover:bg-violet-200 dark:hover:bg-violet-800/50",
          "border-2 border-violet-200 dark:border-violet-700",
          "rounded-full cursor-pointer transition-all duration-300",
          "focus:outline-none focus:ring-2 focus:ring-violet-500/50",
          className,
          classNames?.base,
        ),
      })}
    >
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>
      <div
        {...getWrapperProps()}
        className={slots.wrapper({
          class: clsx(
            [
              "relative flex items-center justify-center",
              "w-4 h-4 rounded-full",
              "bg-white dark:bg-zinc-700",
              "shadow-lg border border-violet-300 dark:border-violet-600",
              "transition-all duration-300 ease-in-out",
              "transform",
              isSelected
                ? "translate-x-2 bg-zinc-700 dark:bg-white"
                : "-translate-x-2",
            ],
            classNames?.wrapper,
          ),
        })}
      >
        {isSelected ? (
          <IconMoon
            className="text-violet-300 dark:text-violet-600"
            size={12}
          />
        ) : (
          <IconSun className="text-violet-600 dark:text-violet-400" size={12} />
        )}
      </div>
    </Component>
  );
};
