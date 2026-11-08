"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Button, Card, Form, Skeleton } from "antd";
import { ImagesInput } from "@/components/inputs";
import { PageHeader } from "@/components/PageHeader";
import { api, errorMessage } from "@/lib/api";

const SECTION = "about.gallery";

type Values = { images: string[] };
type SitePage = { sections: { key: string; data: Values }[] };

export default function GalleryPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<Values>();

  const { data: values } = useQuery({
    queryKey: ["pages"],
    queryFn: () => api.get<SitePage[]>("/pages"),
    select: (pages) => pages.flatMap((page) => page.sections).find((section) => section.key === SECTION)?.data,
  });

  useEffect(() => {
    if (values) form.setFieldsValue(values);
  }, [form, values]);

  const save = useMutation({
    mutationFn: (body: Values) => api.put(`/pages/${SECTION}`, body),
    onSuccess: () => {
      message.success("Галерея сохранена");
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
    onError: (error) => message.error(errorMessage(error)),
  });

  return (
    <>
      <PageHeader
        title="Галерея"
        description="Лента фотографий на странице «О нас». Порядок меняется стрелками, каждое второе фото показывается широким. Для красивой ленты лучше загрузить хотя бы 4 фото."
      />
      {!values ? (
        <Skeleton active />
      ) : (
        <Card>
          <Form form={form} layout="vertical" initialValues={values} onFinish={(body) => save.mutate(body)}>
            <Form.Item name="images">
              <ImagesInput />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={save.isPending}>
              Сохранить
            </Button>
          </Form>
        </Card>
      )}
    </>
  );
}
