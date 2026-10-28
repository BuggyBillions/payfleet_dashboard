import { useTheme } from "../hooks/useTheme";
import { FiSun } from "react-icons/fi";
import { PiMoonLight } from "react-icons/pi";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={`${theme === "light" ? "Switch to dark mode" : theme === "dark" ? "Switch to light mode" : "Switch mode"}`}
      className="rounded-lg p-2 text-textBlack hover:bg-secondary cursor-pointer"
    >
      {theme === "dark" ? <FiSun size={20} /> : <PiMoonLight size={20} />}
    </button>
  );
}
