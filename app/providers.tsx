"use client";

import { useState, type ReactNode } from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App, ConfigProvider, type ThemeConfig } from "antd";
import ruRU from "antd/locale/ru_RU";
import dayjs from "dayjs";
import "dayjs/locale/ru";

dayjs.locale("ru");

const BRAND_DARK = "#0f0f0f";

const theme: ThemeConfig = {
  token: {
    colorPrimary: BRAND_DARK,
    colorLink: "#1f5fbf",
    borderRadius: 6,
    colorBgLayout: "#f4f4f2",
  },
  components: {
    Layout: { siderBg: BRAND_DARK, headerBg: "#fff", bodyBg: "#f4f4f2" },
    Menu: {
      darkItemBg: BRAND_DARK,
      darkSubMenuItemBg: BRAND_DARK,
      darkItemColor: "rgba(255,255,255,0.72)",
      darkItemHoverColor: "#fff",
      darkItemSelectedBg: "rgba(255,255,255,0.12)",
      darkItemSelectedColor: "#fff",
      darkGroupTitleColor: "rgba(255,255,255,0.38)",
      itemBorderRadius: 6,
    },
    Table: { headerBg: "#fafaf9", rowHoverBg: "#f7f7f5" },
    Card: { headerFontSize: 15 },
  },
};

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
      }),
  );

  return (
    <AntdRegistry>
      <ConfigProvider theme={theme} locale={ruRU}>
        <App>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
