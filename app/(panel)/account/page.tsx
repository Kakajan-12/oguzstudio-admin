"use client";

import { useMutation } from "@tanstack/react-query";
import { App, Button, Card, Form, Input } from "antd";
import { PageHeader } from "@/components/PageHeader";
import { api, errorMessage, setToken } from "@/lib/api";

export default function AccountPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const change = useMutation({
    mutationFn: (values: { currentPassword: string; newPassword: string }) =>
      api.post<{ token: string }>("/auth/change-password", values),
    onSuccess: ({ token }) => {
      // Other sessions are signed out; this one continues with the new token
      setToken(token);
      message.success("Пароль изменён. На других устройствах нужно войти заново.");
      form.resetFields();
    },
    onError: (error) => message.error(errorMessage(error)),
  });

  return (
    <>
      <PageHeader title="Смена пароля" />
      <Card style={{ maxWidth: 440 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={({ currentPassword, newPassword }) => change.mutate({ currentPassword, newPassword })}
        >
          <Form.Item name="currentPassword" label="Текущий пароль" rules={[{ required: true, message: "Введите пароль" }]}>
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="Новый пароль"
            rules={[{ required: true, min: 8, message: "Не короче 8 символов" }]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="Повторите новый пароль"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Повторите пароль" },
              ({ getFieldValue }) => ({
                validator: (_, value) =>
                  value === getFieldValue("newPassword")
                    ? Promise.resolve()
                    : Promise.reject(new Error("Пароли не совпадают")),
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={change.isPending}>
            Сменить пароль
          </Button>
        </Form>
      </Card>
    </>
  );
}
