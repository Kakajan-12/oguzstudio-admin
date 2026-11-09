"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Button, Card, Form, Skeleton, Tabs } from "antd";
import { countMissing, EditLangSwitch } from "@/components/EditLang";
import { LocalizedInput } from "@/components/inputs";
import { PageHeader } from "@/components/PageHeader";
import { api, errorMessage } from "@/lib/api";
import type { Localized } from "@/lib/types";

type Values = { content: Localized };
type Section = { key: string; title: string; data: Values };
type SitePage = { key: string; sections: Section[] };

function DocumentForm({ section }: { section: Section }) {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<Values>();

  useEffect(() => form.setFieldsValue(section.data), [form, section.data]);

  const save = useMutation({
    mutationFn: (body: Values) => api.put(`/pages/${section.key}`, body),
    onSuccess: () => {
      message.success(`«${section.title}»: сохранено`);
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
    onError: (error) => message.error(errorMessage(error)),
  });

  return (
    <Form form={form} layout="vertical" initialValues={section.data} onFinish={(body) => save.mutate(body)}>
      <Form.Item
        name="content"
        extra="Пустая строка начинает новый абзац. Абзац, который начинается с «# », станет подзаголовком."
      >
        <LocalizedInput multiline rows={20} />
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={save.isPending}>
        Сохранить
      </Button>
    </Form>
  );
}

export default function LegalPage() {
  const { data: sections } = useQuery({
    queryKey: ["pages"],
    queryFn: () => api.get<SitePage[]>("/pages"),
    select: (pages) => pages.find((page) => page.key === "legal")?.sections,
  });

  return (
    <>
      <PageHeader
        title="Документы"
        description="Страницы, ссылки на которые стоят внизу сайта. Пока текст документа пуст, ссылка на него на сайте не показывается."
        extra={sections && <EditLangSwitch missing={countMissing(sections.map((section) => section.data))} />}
      />
      {!sections ? (
        <Skeleton active />
      ) : (
        <Card>
          <Tabs
            items={sections.map((section) => ({
              key: section.key,
              label: section.title,
              children: <DocumentForm section={section} />,
            }))}
          />
        </Card>
      )}
    </>
  );
}
