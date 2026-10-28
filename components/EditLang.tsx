"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Badge, Flex, Form, Segmented, Tooltip, Typography, type FormInstance } from "antd";
import { LANGS, type Lang } from "@/lib/types";

/**
 * The language being edited, shared by every translated field in the admin:
 * switch once and the whole form shows that language.
 */
const EditLangContext = createContext<{ lang: Lang; setLang: (lang: Lang) => void }>({
  lang: "ru",
  setLang: () => {},
});

const STORAGE_KEY = "oguz-admin-edit-lang";

export function EditLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ru");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring a saved preference after hydration
      if (LANGS.some((l) => l.key === saved)) setLangState(saved as Lang);
    } catch {}
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  };

  return <EditLangContext.Provider value={{ lang, setLang }}>{children}</EditLangContext.Provider>;
}

export const useEditLang = () => useContext(EditLangContext);

const isFilled = (value: unknown) =>
  Array.isArray(value) ? value.length > 0 : typeof value === "string" && value.trim() !== "";

const isLocalized = (value: object): value is Record<Lang, unknown> =>
  LANGS.every((l) => l.key in value) && Object.keys(value).length === LANGS.length;

/** Missing translations per language, counting only fields filled in at least one language */
export function countMissing(values: unknown): Record<Lang, number> {
  const missing: Record<Lang, number> = { ru: 0, en: 0, tk: 0 };
  const walk = (value: unknown) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) return value.forEach(walk);
    if (isLocalized(value)) {
      if (LANGS.some((l) => isFilled(value[l.key]))) {
        LANGS.forEach((l) => {
          if (!isFilled(value[l.key])) missing[l.key]++;
        });
      }
      return;
    }
    Object.values(value).forEach(walk);
  };
  walk(values);
  return missing;
}

/** Field-level hint: which languages are still empty */
export function MissingLangs({ value }: { value?: Partial<Record<Lang, unknown>> }) {
  const { lang, setLang } = useEditLang();
  if (!value || !LANGS.some((l) => isFilled(value[l.key]))) return null;
  const missing = LANGS.filter((l) => l.key !== lang && !isFilled(value[l.key]));
  if (missing.length === 0) return null;
  return (
    <Typography.Text type="warning" style={{ fontSize: 12 }}>
      Нет перевода:{" "}
      {missing.map((l, i) => (
        <span key={l.key}>
          {i > 0 && ", "}
          <Typography.Link style={{ fontSize: 12 }} onClick={() => setLang(l.key)}>
            {l.label}
          </Typography.Link>
        </span>
      ))}
    </Typography.Text>
  );
}

type SwitchProps = { size?: "small" | "middle" };

/** "Язык заполнения" switch for a form: counts the form's missing translations as you type */
export function FormLangSwitch({ form, ...props }: SwitchProps & { form: FormInstance }) {
  const values = Form.useWatch((all) => all, { form, preserve: true });
  return <EditLangSwitch missing={countMissing(values)} {...props} />;
}

/** "Язык заполнения" switch; `missing` adds a counter of untranslated fields to each language */
export function EditLangSwitch({ missing, size = "middle" }: SwitchProps & { missing?: Record<Lang, number> }) {
  const { lang, setLang } = useEditLang();

  return (
    <Flex align="center" gap={8}>
      <Typography.Text type="secondary" style={{ whiteSpace: "nowrap" }}>
        Язык заполнения:
      </Typography.Text>
      <Segmented<Lang>
        size={size}
        value={lang}
        onChange={setLang}
        options={LANGS.map((l) => ({
          value: l.key,
          label: (
            <Tooltip title={missing?.[l.key] ? `${l.name}: не переведено полей — ${missing[l.key]}` : l.name}>
              <Badge count={missing?.[l.key] ?? 0} size="small" color="orange" offset={[6, -2]}>
                <span style={{ padding: "0 4px" }}>{l.label}</span>
              </Badge>
            </Tooltip>
          ),
        }))}
      />
    </Flex>
  );
}
