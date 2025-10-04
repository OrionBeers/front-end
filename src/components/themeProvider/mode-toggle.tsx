import { Moon, Sun } from "lucide-react";
import { Button } from "../ui/button";
import { useTheme } from "./theme-provider";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className='rotate-0 scale-100 transition-all hover:text-yellow-500 dark:-rotate-90 dark:scale-0 dark:text-gray-400' />
      <Moon className='absolute rotate-90 scale-0 transition-all hover:text-yellow-500 dark:rotate-0 dark:scale-100 dark:text-gray-400' />
      <span className='sr-only'>Toggle theme</span>
    </Button>
  );
}
