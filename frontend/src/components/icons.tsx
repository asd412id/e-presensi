import React from "react";
import { IconSun, IconMoon } from "@tabler/icons-react";

export const SunFilledIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = "",
}) => {
  return <IconSun className={className} size={size} />;
};

export const MoonFilledIcon: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 24, className = "" }) => {
  return <IconMoon className={className} size={size} />;
};
