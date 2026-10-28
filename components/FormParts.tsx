"use client";

import { Collapse, Form, Input, Switch } from "antd";

/** "Show on site" switch used by every content form */
export function PublishedField() {
  return (
    <Form.Item
      name="isPublished"
      label="Показывать на сайте"
      valuePropName="checked"
      tooltip="Если выключить, запись останется в админке, но пропадёт с сайта"
    >
      <Switch />
    </Form.Item>
  );
}

/** URL slug, hidden under "Дополнительно": most editors never need it */
export function SlugField({ urlPrefix }: { urlPrefix?: string }) {
  return (
    <Collapse
      ghost
      size="small"
      style={{ marginBottom: 16 }}
      items={[
        {
          key: "advanced",
          label: "Дополнительно",
          forceRender: true,
          children: (
            <Form.Item
              name="slug"
              label="Адрес (slug)"
              extra={`Латиницей, через дефис. Оставьте пустым — заполнится автоматически из названия.${
                urlPrefix ? ` Используется в ссылке: ${urlPrefix}/<адрес>` : ""
              }`}
              style={{ marginBottom: 0 }}
            >
              <Input placeholder="например: huawei-ashgabat" />
            </Form.Item>
          ),
        },
      ]}
    />
  );
}
