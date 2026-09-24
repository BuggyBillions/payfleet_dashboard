import { useTheme } from "../hooks/useTheme";
import { CiSun } from "react-icons/ci";
import { PiMoonLight } from "react-icons/pi";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={`${theme === "light" ? "Switch to dark mode" : theme === "dark" ? "Switch to light mode" : "Switch mode"}`}
      className="rounded-lg p-2 text-textBlack hover:bg-secondary cursor-pointer"
    >
      {theme === "dark" ? <CiSun size={20} /> : <PiMoonLight size={20} />}
    </button>
  );
}