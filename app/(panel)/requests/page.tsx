"use client";

import { Descriptions, Typography } from "antd";
import { InboxPage, type StatusOption } from "@/components/InboxPage";
import type { ContactRequest } from "@/lib/types";

const STATUSES: StatusOption[] = [
  { value: "new", label: "Новая", color: "blue" },
  { value: "in_progress", label: "В работе", color: "orange" },
  { value: "done", label: "Завершена", color: "green" },
  { value: "spam", label: "Спам", color: "default" },
];

const fullName = (r: ContactRequest) => [r.firstName, r.lastName].filter(Boolean).join(" ");

export default function RequestsPage() {
  return (
    <InboxPage<ContactRequest>
      resource="contact-requests"
      title="Заявки"
      description="Сообщения из формы «Давайте обсудим ваш проект» на странице «Контакты». Копия каждой заявки приходит на почту из настроек."
      statuses={STATUSES}
      drawerTitle={(r) => `Заявка №${r.id}`}
      columns={[
        { title: "Имя", key: "name", render: (_, r) => fullName(r) },
        { title: "Компания", dataIndex: "company" },
        { title: "Категория", dataIndex: "categoryLabel" },
        { title: "Email", dataIndex: "email" },
      ]}
      renderDetails={(r) => (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Имя">{fullName(r)}</Descriptions.Item>
          <Descriptions.Item label="Email">
            <Typography.Link href={`mailto:${r.email}`} copyable>
              {r.email}
            </Typography.Link>
          </Descriptions.Item>
          <Descriptions.Item label="Телефон">
            {r.phone && <Typography.Link href={`tel:${r.phone}`}>{r.phone}</Typography.Link>}
          </Descriptions.Item>
          <Descriptions.Item label="Компания">{r.company}</Descriptions.Item>
          <Descriptions.Item label="Категория">{r.categoryLabel}</Descriptions.Item>
          <Descriptions.Item label="Описание">
            <div style={{ whiteSpace: "pre-wrap" }}>{r.description}</div>
          </Descriptions.Item>
          <Descriptions.Item label="Язык сайта">{r.locale.toUpperCase()}</Descriptions.Item>
        </Descriptions>
      )}
    />
  );
}
