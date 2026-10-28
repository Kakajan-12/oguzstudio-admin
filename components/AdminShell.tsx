"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import {
  AppstoreOutlined,
  ExportOutlined,
  FileTextOutlined,
  GlobalOutlined,
  HomeOutlined,
  LogoutOutlined,
  MailOutlined,
  PictureOutlined,
  SettingOutlined,
  SolutionOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Badge, Button, Dropdown, Flex, Layout, Menu, Spin, Typography } from "antd";
import type { MenuProps } from "antd";
import { api, clearToken, getToken } from "@/lib/api";
import type { AdminUser } from "@/lib/types";
import { EditLangProvider } from "./EditLang";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function useUnread(resource: string, enabled: boolean) {
  return useQuery({
    queryKey: [resource, "unread"],
    queryFn: () => api.get<{ count: number }>(`/${resource}/unread-count`),
    enabled,
    refetchInterval: 60_000,
  }).data?.count;
}

const noopSubscribe = () => () => {};

const link = (href: string, label: ReactNode) => <Link href={href}>{label}</Link>;

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  // null on the server: the token lives in localStorage
  const hasToken = useSyncExternalStore(
    noopSubscribe,
    () => Boolean(getToken()),
    () => null,
  );

  useEffect(() => {
    if (hasToken === false) router.replace("/login");
  }, [hasToken, router]);

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.get<AdminUser>("/auth/me"),
    enabled: hasToken === true,
  });
  const newRequests = useUnread("contact-requests", Boolean(user));
  const newApplications = useUnread("applications", Boolean(user));

  if (!user) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "100vh" }}>
        <Spin size="large" />
      </Flex>
    );
  }

  const items: MenuProps["items"] = [
    { key: "/", icon: <HomeOutlined />, label: link("/", "Главная") },
    {
      type: "group",
      label: "Контент сайта",
      children: [
        { key: "/pages", icon: <FileTextOutlined />, label: link("/pages", "Тексты страниц") },
        { key: "/services", icon: <AppstoreOutlined />, label: link("/services", "Услуги") },
        { key: "/projects", icon: <PictureOutlined />, label: link("/projects", "Проекты") },
        { key: "/team", icon: <TeamOutlined />, label: link("/team", "Команда") },
        { key: "/brands", icon: <TrophyOutlined />, label: link("/brands", "Бренды") },
        { key: "/positions", icon: <SolutionOutlined />, label: link("/positions", "Вакансии") },
        { key: "/countries", icon: <GlobalOutlined />, label: link("/countries", "Страны") },
      ],
    },
    {
      type: "group",
      label: "Входящие",
      children: [
        {
          key: "/requests",
          icon: <MailOutlined />,
          label: link("/requests", <Flex justify="space-between" align="center">Заявки <Badge count={newRequests} /></Flex>),
        },
        {
          key: "/applications",
          icon: <UserOutlined />,
          label: link(
            "/applications",
            <Flex justify="space-between" align="center">Отклики <Badge count={newApplications} /></Flex>,
          ),
        },
      ],
    },
    {
      type: "group",
      label: "Настройки",
      children: [
        { key: "/settings", icon: <SettingOutlined />, label: link("/settings", "Контакты и почта") },
      ],
    },
  ];

  const selected = pathname === "/" ? "/" : `/${pathname.split("/")[1]}`;

  const logout = () => {
    clearToken();
    router.replace("/login");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Sider
        width={248}
        theme="dark"
        breakpoint="lg"
        collapsedWidth={0}
        style={{ background: "#0f0f0f", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}
      >
        <Link href="/" style={{ display: "block", padding: "26px 24px 18px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- static SVG logo */}
          <img src="/logo.svg" alt="Oguz Studio" width={180} height={19} style={{ display: "block" }} />
          <Typography.Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
            Панель управления
          </Typography.Text>
        </Link>
        <Menu theme="dark" mode="inline" selectedKeys={[selected]} items={items} style={{ borderInlineEnd: 0 }} />
      </Layout.Sider>
      <Layout>
        <Layout.Header
          style={{
            background: "#fff",
            height: 56,
            lineHeight: "56px",
            padding: "0 24px",
            borderBottom: "1px solid #ececec",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 8,
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Button href={SITE_URL} target="_blank" type="text" icon={<ExportOutlined />}>
            Открыть сайт
          </Button>
          <Dropdown
            menu={{
              items: [
                { key: "account", icon: <UserOutlined />, label: link("/account", "Сменить пароль") },
                { key: "logout", icon: <LogoutOutlined />, label: "Выйти", onClick: logout },
              ],
            }}
          >
            <Button type="text" icon={<UserOutlined />}>
              {user.name || user.email}
            </Button>
          </Dropdown>
        </Layout.Header>
        <Layout.Content style={{ padding: "28px 32px 48px" }}>
          <div style={{ maxWidth: 1240, margin: "0 auto" }}>
            <EditLangProvider>{children}</EditLangProvider>
          </div>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
