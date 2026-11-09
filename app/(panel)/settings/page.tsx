"use client";

import { useEffect } from "react";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Button, Card, Col, Flex, Form, Input, Row, Select, Skeleton, Space } from "antd";
import { countMissing, EditLangSwitch } from "@/components/EditLang";
import { LocalizedInput } from "@/components/inputs";
import { PageHeader } from "@/components/PageHeader";
import { api, errorMessage } from "@/lib/api";
import type { Settings } from "@/lib/types";

function SettingCard<K extends keyof Settings>({
  settingKey,
  title,
  value,
  children,
}: {
  settingKey: K;
  title: string;
  value: Settings[K];
  children: React.ReactNode;
}) {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  useEffect(() => form.setFieldsValue(value), [form, value]);

  const save = useMutation({
    mutationFn: (values: Settings[K]) => api.put(`/settings/${settingKey}`, values),
    onSuccess: () => {
      message.success("Сохранено");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (error) => message.error(errorMessage(error)),
  });

  return (
    <Card title={title}>
      <Form form={form} layout="vertical" initialValues={value} onFinish={(values) => save.mutate(values)}>
        {children}
        <Button type="primary" htmlType="submit" loading={save.isPending}>
          Сохранить
        </Button>
      </Form>
    </Card>
  );
}

const urlRule = { type: "url" as const, message: "Введите ссылку целиком, начиная с https://" };

const emailsRule = {
  validator: (_: unknown, emails: string[] = []) =>
    emails.every((email) => /^\S+@\S+\.\S+$/.test(email))
      ? Promise.resolve()
      : Promise.reject(new Error("Один из адресов указан неверно")),
};

const SOCIAL_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "telegram", label: "Telegram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "x", label: "X (Twitter)" },
];

export default function SettingsPage() {
  const { data } = useQuery({ queryKey: ["settings"], queryFn: () => api.get<Settings>("/settings") });

  return (
    <>
      <PageHeader
        title="Контакты и почта"
        description="Контактные данные компании на сайте и адреса для уведомлений."
        extra={data && <EditLangSwitch missing={countMissing(data)} />}
      />
      {!data ? (
        <Skeleton active />
      ) : (
        <Space orientation="vertical" size="large" style={{ width: "100%" }}>
          <SettingCard settingKey="contacts" title="Контакты на сайте (шапка, подвал, страница «Контакты»)" value={data.contacts}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="phones" label="Телефоны" extra="Введите номер и нажмите Enter. Можно указать несколько.">
                  <Select mode="tags" open={false} suffixIcon={null} tokenSeparators={[",", ";"]} placeholder="+993 71 40 20 30" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="emails" label="Email" extra="Введите адрес и нажмите Enter. Можно указать несколько." rules={[emailsRule]}>
                  <Select mode="tags" open={false} suffixIcon={null} tokenSeparators={[",", " ", ";"]} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="address" label="Адрес">
              <LocalizedInput />
            </Form.Item>
            <Form.Item
              name="googleMapsUrl"
              label="Ссылка на Google Maps"
              extra="Открывается по кнопке «Открыть в Google Maps» на странице «Контакты»"
              rules={[urlRule]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="mapCoordinates"
              label="Координаты точки на карте"
              extra="Карта в подвале сайта. В Google Maps нажмите правой кнопкой на нужное место и кликните по координатам — они скопируются. Вставьте сюда. Пустое поле — карта не показывается."
              rules={[
                {
                  pattern: /^\s*-?\d{1,2}(\.\d+)?\s*,\s*-?\d{1,3}(\.\d+)?\s*$/,
                  message: "Формат: 37.90081, 58.33477",
                },
              ]}
            >
              <Input placeholder="37.90081, 58.33477" style={{ maxWidth: 320 }} />
            </Form.Item>
            <Form.Item label="Социальные сети">
              <Form.List name="socials">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name }) => (
                      <Flex key={key} gap={8} align="start">
                        <Form.Item name={[name, "network"]} style={{ width: 180, marginBottom: 12 }}>
                          <Select options={SOCIAL_OPTIONS} />
                        </Form.Item>
                        <Form.Item
                          name={[name, "url"]}
                          style={{ flex: 1, marginBottom: 12 }}
                          rules={[{ required: true, message: "Укажите ссылку" }, urlRule]}
                        >
                          <Input placeholder="https://..." />
                        </Form.Item>
                        <Button type="text" danger icon={<DeleteOutlined />} aria-label="Удалить" onClick={() => remove(name)} />
                      </Flex>
                    ))}
                    <Button icon={<PlusOutlined />} onClick={() => add({ network: "instagram", url: "" })}>
                      Добавить соцсеть
                    </Button>
                  </>
                )}
              </Form.List>
            </Form.Item>
          </SettingCard>

          <SettingCard settingKey="notifications" title="Уведомления о заявках и откликах" value={data.notifications}>
            <Form.Item
              name="emails"
              label="Отправлять на адреса"
              extra="Введите адрес и нажмите Enter. Можно указать несколько."
              rules={[emailsRule]}
            >
              <Select mode="tags" open={false} suffixIcon={null} tokenSeparators={[",", " ", ";"]} />
            </Form.Item>
          </SettingCard>
        </Space>
      )}
    </>
  );
}
