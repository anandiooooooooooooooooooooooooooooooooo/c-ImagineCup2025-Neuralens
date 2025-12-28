import en from './locales/en.json';
import id from './locales/id.json';
import zh from './locales/zh.json';
import es from './locales/es.json';
import hi from './locales/hi.json';
import ar from './locales/ar.json';
import pt from './locales/pt.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import bn from './locales/bn.json';
import ru from './locales/ru.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import vi from './locales/vi.json';
import th from './locales/th.json';
import tl from './locales/tl.json';

export const translations = {
  en,
  id,
  zh,
  es,
  hi,
  ar,
  pt,
  ja,
  ko,
  bn,
  ru,
  de,
  fr,
  vi,
  th,
  tl,
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof en;
