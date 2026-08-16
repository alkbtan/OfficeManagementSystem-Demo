import { useState } from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import LanguageIcon from "@mui/icons-material/Language";

function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const languages = [
    { code: "en", label: t("common.english"), flag: "🇬🇧" },
    { code: "pt", label: t("common.portuguese"), flag: "🇧🇷" },
  ];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
    setAnchorEl(null);
  };

  const currentLang = languages.find((l) => l.code === i18n.language);

  return (
    <>
      <Tooltip title={t("common.language")}>
        <IconButton
          onClick={handleClick}
          color="inherit"
          size="small"
          sx={{ ml: 1 }}
        >
          <LanguageIcon />
          <span style={{ fontSize: "0.75rem", marginLeft: 4 }}>
            {currentLang?.flag}
          </span>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            selected={i18n.language === lang.code}
          >
            <ListItemIcon>
              <span>{lang.flag}</span>
            </ListItemIcon>
            <ListItemText primary={lang.label} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default LanguageSwitcher;