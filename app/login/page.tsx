"use client";

import { useState } from "react";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Flex, Form, Input, Typography } from "antd";
import { api, errorMessage, setToken } from "@/lib/api";
import type { AdminUser } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const { token } = await api.post<{ token: string; user: AdminUser }>("/auth/login", values);
      setToken(token);
      router.replace("/");
    } catch (e) {
      setError(errorMessage(e));
      setLoading(false);
    }
  };

  return (
    <Flex vertical align="center" justify="center" gap={28} style={{ minHeight: "100vh", padding: 16, background: "#0f0f0f" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG logo */}
      <img src="/logo.svg" alt="Oguz Studio" width={232} height={24} />
      <Card style={{ width: 380, maxWidth: "100%" }}>
        <Typography.Title level={4} style={{ marginTop: 0 }}>
          Вход в панель управления
        </Typography.Title>
        <Typography.Paragraph type="secondary">Тексты, проекты, вакансии и заявки сайта</Typography.Paragraph>
        {error && <Alert type="error" title={error} style={{ marginBottom: 16 }} showIcon />}
        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: "Введите email" }]}>
            <Input prefix={<MailOutlined />} autoComplete="username" autoFocus />
          </Form.Item>
          <Form.Item name="password" label="Пароль" rules={[{ required: true, message: "Введите пароль" }]}>
            <Input.Password prefix={<LockOutlined />} autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Войти
          </Button>
        </Form>
      </Card>
    </Flex>
  );
}
