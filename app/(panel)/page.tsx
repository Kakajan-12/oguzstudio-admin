"use client";

import {
  AppstoreOutlined,
  FileTextOutlined,
  MailOutlined,
  PictureOutlined,
  SolutionOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, Col, Row, Statistic, Typography } from "antd";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";

const useCount = (resource: string) =>
  useQuery({
    queryKey: [resource, "unread"],
    queryFn: () => api.get<{ count: number }>(`/${resource}/unread-count`),
  }).data?.count;

const SHORTCUTS = [
  { href: "/pages", icon: <FileTextOutlined />, title: "Тексты страниц", text: "Заголовки, абзацы и картинки на всех страницах" },
  { href: "/projects", icon: <PictureOutlined />, title: "Проекты", text: "Добавить работу в портфолио или на главную" },
  { href: "/services", icon: <AppstoreOutlined />, title: "Услуги", text: "Услуги и категории проектов" },
  { href: "/positions", icon: <SolutionOutlined />, title: "Вакансии", text: "Открыть или закрыть вакансию" },
];

export default function DashboardPage() {
  const requests = useCount("contact-requests");
  const applications = useCount("applications");

  return (
    <>
      <PageHeader title="Добро пожаловать" description="Здесь вы управляете содержимым сайта Oguz Studio. Изменения появляются на сайте сразу после сохранения." />

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Link href="/requests">
            <Card hoverable>
              <Statistic title="Новые заявки" value={requests ?? 0} prefix={<MailOutlined />} />
            </Card>
          </Link>
        </Col>
        <Col xs={24} md={12}>
          <Link href="/applications">
            <Card hoverable>
              <Statistic title="Новые отклики на вакансии" value={applications ?? 0} prefix={<UserOutlined />} />
            </Card>
          </Link>
        </Col>
      </Row>

      <Typography.Title level={5} style={{ marginTop: 32 }}>
        Быстрый переход
      </Typography.Title>
      <Row gutter={[16, 16]}>
        {SHORTCUTS.map((item) => (
          <Col xs={24} sm={12} xl={6} key={item.href}>
            <Link href={item.href}>
              <Card hoverable style={{ height: "100%" }}>
                <Typography.Title level={5} style={{ marginTop: 0 }}>
                  {item.icon} {item.title}
                </Typography.Title>
                <Typography.Text type="secondary">{item.text}</Typography.Text>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </>
  );
}
