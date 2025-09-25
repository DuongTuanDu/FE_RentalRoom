import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface LanguageSelectorProps {
  isScrolled?: boolean;
}

const LanguageSelector = ({ isScrolled }: LanguageSelectorProps) => {
  const { i18n } = useTranslation();

  const VnFlag = () => (
    <svg
      className="h-5 w-5"
      viewBox="0 0 900 600"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Vietnam"
    >
      <rect width="900" height="600" fill="#DA251D" />
      <polygon
        fill="#FFFF00"
        points="450,150 518,437 282,262 618,262 382,437"
      />
    </svg>
  );

  const UsFlag = () => (
    <svg
      className="h-5 w-5"
      viewBox="0 0 7410 3900"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="United States"
    >
      <rect width="7410" height="3900" fill="#b22234" />
      <g fill="#fff">
        {[...Array(13)].map((_, i) => (
          <rect key={i} y={i * 300} width="7410" height="150" />
        ))}
      </g>
      <rect width="2964" height="2100" fill="#3c3b6e" />
      <g fill="#fff" transform="translate(247 210) scale(1.6)">
        {/* 50 stars in 9 rows */}
        {[...Array(9)].map((_, row) => (
          <g
            key={row}
            transform={`translate(0, ${row * 200})`}
            fill="#fff"
            stroke="none"
          >
            {[...Array(row % 2 === 0 ? 6 : 5)].map((_, col) => {
              const x = col * 333 + (row % 2 === 0 ? 0 : 166);
              return (
                <polygon
                  key={col}
                  points="0,-30 9,-9 30,-9 13,5 19,26 0,13 -19,26 -13,5 -30,-9 -9,-9"
                  transform={`translate(${x},0) scale(1.5)`}
                />
              );
            })}
          </g>
        ))}
      </g>
    </svg>
  );

  const languages = [
    { code: "en", name: "English", flag: <UsFlag /> },
    { code: "vi", name: "Tiếng Việt", flag: <VnFlag /> },
  ];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    // Optionally save to localStorage
    localStorage.setItem("preferredLanguage", languageCode);
  };

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  return (
    <div className="flex items-center gap-2">
      <Select value={i18n.language} onValueChange={handleLanguageChange}>
        <SelectTrigger
          className={`h-9 border-0 focus:ring-0 transition-all duration-300 ${
            isScrolled
              ? "bg-blue-50 hover:bg-blue-100 text-blue-700"
              : "bg-white/20 hover:bg-white/30 text-white border-white/30"
          }`}
        >
          <SelectValue>
            <div className="flex items-center gap-2">
              <span>{currentLanguage.flag}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white border-blue-200 shadow-xl">
          {languages.map((language) => (
            <SelectItem
              key={language.code}
              value={language.code}
              className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span>{language.flag}</span>
                <span>{language.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
