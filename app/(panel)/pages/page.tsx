"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Button, Card, Collapse, Flex, Form, Skeleton, Tabs, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { countMissing, EditLangSwitch } from "@/components/EditLang";
import { ImageInput, LocalizedInput } from "@/components/inputs";
import { PageHeader } from "@/components/PageHeader";
import { api, errorMessage } from "@/lib/api";
import { LANGS, type PageSection, type SitePage } from "@/lib/types";

/** "EN: 2, TK: 1" — untranslated fields of a section */
function MissingTag({ data }: { data: unknown }) {
  const missing = countMissing(data);
  const parts = LANGS.filter((l) => missing[l.key] > 0).map((l) => `${l.label}: ${missing[l.key]}`);
  if (parts.length === 0) return null;
  return <Tag color="orange">Нет перевода — {parts.join(", ")}</Tag>;
}

function SectionForm({ section }: { section: PageSection }) {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [dirty, setDirty] = useState(false);

  const save = useMutation({
    mutationFn: (values: Record<string, unknown>) => api.put(`/pages/${section.key}`, values),
    onSuccess: () => {
      message.success(`«${section.title}» сохранено`);
      setDirty(false);
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
    onError: (error) => message.error(errorMessage(error)),
  });

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={section.data}
      onValuesChange={() => setDirty(true)}
      onFinish={(values) => save.mutate(values)}
    >
      {section.fields.map((field) => (
        <Form.Item key={field.name} name={field.name} label={field.label}>
          {field.type === "image" ? (
            <ImageInput />
          ) : (
            <LocalizedInput multiline={field.type === "textarea"} rows={field.type === "textarea" ? 4 : undefined} />
          )}
        </Form.Item>
      ))}
      <Flex justify="space-between" align="center">
        <Typography.Text type="secondary">
          {section.updatedAt ? `Изменено ${dayjs(section.updatedAt).format("D MMMM YYYY, HH:mm")}` : ""}
        </Typography.Text>
        <Button type="primary" htmlType="submit" loading={save.isPending} disabled={!dirty}>
          Сохранить блок
        </Button>
      </Flex>
    </Form>
  );
}

export default function PagesPage() {
  const { data: pages, isLoading } = useQuery({
    queryKey: ["pages"],
    queryFn: () => api.get<SitePage[]>("/pages"),
  });

  return (
    <>
      <PageHeader
        title="Тексты страниц"
        description="Заголовки, абзацы и картинки страниц сайта. Каждый блок сохраняется отдельно. Если перевода нет, на сайте в этом месте будет показан текст на другом языке."
        extra={pages && <EditLangSwitch missing={countMissing(pages.map((page) => page.sections.map((s) => s.data)))} />}
      />
      {isLoading || !pages ? (
        <Skeleton active />
      ) : (
        <Card>
          <Tabs
            items={pages.map((page) => ({
              key: page.key,
              label: page.title,
              children: (
                <Collapse
                  defaultActiveKey={page.sections.length === 1 ? [page.sections[0].key] : []}
                  items={page.sections.map((section) => ({
                    key: section.key,
                    label: <Typography.Text strong>{section.title}</Typography.Text>,
                    extra: <MissingTag data={section.data} />,
                    children: <SectionForm section={section} />,
                  }))}
                />
              ),
            }))}
          />
        </Card>
      )}
    </>
  );
}
