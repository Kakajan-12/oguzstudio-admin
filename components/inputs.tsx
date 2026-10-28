"use client";

import { useState } from "react";
import { DeleteOutlined, LeftOutlined, LoadingOutlined, PlusOutlined, RightOutlined } from "@ant-design/icons";
import { App, Button, Image, Input, Space, Tag, Upload } from "antd";
import type { Rule } from "antd/es/form";
import { errorMessage, mediaUrl, uploadImage } from "@/lib/api";
import { LANGS, type Lang, type Localized } from "@/lib/types";
import { MissingLangs, useEditLang } from "./EditLang";

type ControlProps<T> = { value?: T; onChange?: (value: T) => void };

/** Shows the input for the language picked in "Язык заполнения" and which translations are still missing */
function LangField<T>({ value, render }: { value: Localized<T>; render: (lang: Lang) => React.ReactNode }) {
  const { lang } = useEditLang();
  const current = LANGS.find((l) => l.key === lang)!;
  return (
    <div>
      <div style={{ position: "relative" }}>
        {render(lang)}
        <Tag
          variant="filled"
          style={{ position: "absolute", top: 5, right: 0, marginInlineEnd: 6, pointerEvents: "none", fontSize: 11 }}
        >
          {current.label}
        </Tag>
      </div>
      <MissingLangs value={value} />
    </div>
  );
}

/** Text in three languages. Value: { en, ru, tk } */
export function LocalizedInput({
  value = { en: "", ru: "", tk: "" },
  onChange,
  multiline = false,
  rows = 4,
  placeholder,
}: ControlProps<Localized> & { multiline?: boolean; rows?: number; placeholder?: string }) {
  const set = (lang: Lang, text: string) => onChange?.({ ...value, [lang]: text });
  return (
    <LangField
      value={value}
      render={(lang) =>
        multiline ? (
          <Input.TextArea
            rows={rows}
            style={{ paddingRight: 44 }}
            value={value[lang]}
            placeholder={placeholder}
            onChange={(e) => set(lang, e.target.value)}
          />
        ) : (
          <Input
            value={value[lang]}
            placeholder={placeholder}
            onChange={(e) => set(lang, e.target.value)}
            style={{ paddingRight: 44 }}
          />
        )
      }
    />
  );
}

/** List in three languages, edited as "one item per line". Value: { en: [], ru: [], tk: [] } */
export function LocalizedLines({
  value = { en: [], ru: [], tk: [] },
  onChange,
  rows = 5,
}: ControlProps<Localized<string[]>> & { rows?: number }) {
  // Keep raw text while typing so empty lines don't disappear under the cursor
  const [drafts, setDrafts] = useState<Partial<Record<Lang, string>>>({});
  return (
    <LangField
      value={value}
      render={(lang) => (
        <Input.TextArea
          rows={rows}
          style={{ paddingRight: 44 }}
          placeholder="Каждый пункт с новой строки"
          value={drafts[lang] ?? value[lang].join("\n")}
          onChange={(e) => {
            setDrafts({ ...drafts, [lang]: e.target.value });
            onChange?.({
              ...value,
              [lang]: e.target.value
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean),
            });
          }}
          onBlur={() => setDrafts({ ...drafts, [lang]: undefined })}
        />
      )}
    />
  );
}

/** Form rule: at least one language filled */
export const requiredLocalized = (message = "Заполните хотя бы один язык"): Rule => ({
  validator: (_, value?: Localized) =>
    value && Object.values(value).some((text) => text?.trim())
      ? Promise.resolve()
      : Promise.reject(new Error(message)),
});

function useUpload() {
  const { message } = App.useApp();
  const [uploading, setUploading] = useState(false);
  const upload = async (file: File) => {
    setUploading(true);
    try {
      return (await uploadImage(file)).path;
    } catch (error) {
      message.error(errorMessage(error));
      return null;
    } finally {
      setUploading(false);
    }
  };
  return { uploading, upload };
}

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif";
const TILE = 120;

const tileStyle: React.CSSProperties = {
  width: TILE,
  height: TILE,
  border: "1px dashed #d9d9d9",
  borderRadius: 4,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  background: "#fafafa",
  cursor: "pointer",
};

function UploadTile({ uploading, onFiles, multiple }: {
  uploading: boolean;
  onFiles: (files: File[]) => void;
  multiple?: boolean;
}) {
  return (
    <Upload
      accept={ACCEPT}
      multiple={multiple}
      showUploadList={false}
      beforeUpload={(file, fileList) => {
        // Called per file; handle the whole batch once
        if (file === fileList[0]) onFiles(fileList as unknown as File[]);
        return false;
      }}
    >
      <div style={tileStyle}>
        <Space orientation="vertical" align="center" size={4}>
          {uploading ? <LoadingOutlined /> : <PlusOutlined />}
          <span style={{ fontSize: 12, color: "#888" }}>{uploading ? "Загрузка…" : "Загрузить"}</span>
        </Space>
      </div>
    </Upload>
  );
}

function Preview({ src }: { src: string }) {
  return (
    <Image
      src={mediaUrl(src)}
      alt=""
      width={TILE}
      height={TILE}
      style={{ objectFit: "cover", borderRadius: 4, border: "1px solid #f0f0f0" }}
    />
  );
}

/** One image. Value: stored path ("/uploads/...") */
export function ImageInput({ value, onChange }: ControlProps<string>) {
  const { uploading, upload } = useUpload();
  const replace = async ([file]: File[]) => {
    const path = await upload(file);
    if (path) onChange?.(path);
  };
  return (
    <Space align="start">
      {value && <Preview src={value} />}
      <UploadTile uploading={uploading} onFiles={replace} />
      {value && (
        <Button icon={<DeleteOutlined />} onClick={() => onChange?.("")} danger type="text">
          Убрать
        </Button>
      )}
    </Space>
  );
}

/** Several images in order. Value: stored paths */
export function ImagesInput({ value = [], onChange }: ControlProps<string[]>) {
  const { uploading, upload } = useUpload();
  const add = async (files: File[]) => {
    const paths: string[] = [];
    for (const file of files) {
      const path = await upload(file);
      if (path) paths.push(path);
    }
    onChange?.([...value, ...paths]);
  };
  const move = (index: number, delta: number) => {
    const next = [...value];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    onChange?.(next);
  };
  return (
    <Space wrap align="start" size={12}>
      {value.map((src, index) => (
        <Space key={`${src}-${index}`} orientation="vertical" size={4} align="center">
          <Preview src={src} />
          <Space.Compact size="small">
            <Button icon={<LeftOutlined />} disabled={index === 0} onClick={() => move(index, -1)} />
            <Button icon={<DeleteOutlined />} danger onClick={() => onChange?.(value.filter((_, i) => i !== index))} />
            <Button icon={<RightOutlined />} disabled={index === value.length - 1} onClick={() => move(index, 1)} />
          </Space.Compact>
        </Space>
      ))}
      <UploadTile uploading={uploading} onFiles={add} multiple />
    </Space>
  );
}
