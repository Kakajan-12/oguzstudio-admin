"use client";

import { DownloadOutlined } from "@ant-design/icons";
import { App, Button, Descriptions, Typography } from "antd";
import { InboxPage, type StatusOption } from "@/components/InboxPage";
import { downloadFile, errorMessage } from "@/lib/api";
import type { Application } from "@/lib/types";

const STATUSES: StatusOption[] = [
  { value: "new", label: "Новый", color: "blue" },
  { value: "reviewed", label: "Просмотрен", color: "default" },
  { value: "interview", label: "Собеседование", color: "orange" },
  { value: "rejected", label: "Отказ", color: "red" },
  { value: "hired", label: "Принят", color: "green" },
];

const fileSize = (bytes: number) =>
  bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} МБ` : `${Math.ceil(bytes / 1024)} КБ`;

function ResumeButton({ application }: { application: Application }) {
  const { message } = App.useApp();
  return (
    <Button
      icon={<DownloadOutlined />}
      onClick={() =>
        downloadFile(`/applications/${application.id}/resume`, application.resumeOriginalName).catch((error) =>
          message.error(errorMessage(error)),
        )
      }
    >
      {application.resumeOriginalName} ({fileSize(application.resumeSize)})
    </Button>
  );
}

export default function ApplicationsPage() {
  return (
    <InboxPage<Application>
      resource="applications"
      title="Отклики на вакансии"
      description="Отклики с резюме со страницы «Карьера». Копия каждого отклика с резюме во вложении приходит на почту из настроек."
      statuses={STATUSES}
      drawerTitle={(a) => `Отклик №${a.id}`}
      columns={[
        { title: "Кандидат", dataIndex: "fullName" },
        { title: "Вакансия", dataIndex: "positionTitle", render: (value: string) => value || "—" },
        { title: "Email", dataIndex: "email" },
        { title: "Телефон", dataIndex: "phone" },
      ]}
      renderDetails={(a) => (
        <>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Вакансия">{a.positionTitle || "Без вакансии"}</Descriptions.Item>
            <Descriptions.Item label="Кандидат">{a.fullName}</Descriptions.Item>
            <Descriptions.Item label="Email">
              <Typography.Link href={`mailto:${a.email}`} copyable>
                {a.email}
              </Typography.Link>
            </Descriptions.Item>
            <Descriptions.Item label="Телефон">
              {a.phone && <Typography.Link href={`tel:${a.phone}`}>{a.phone}</Typography.Link>}
            </Descriptions.Item>
            <Descriptions.Item label="Сопроводительное письмо">
              <div style={{ whiteSpace: "pre-wrap" }}>{a.message}</div>
            </Descriptions.Item>
            <Descriptions.Item label="Язык сайта">{a.locale.toUpperCase()}</Descriptions.Item>
          </Descriptions>
          <div>
            <Typography.Text strong style={{ display: "block", marginBottom: 8 }}>
              Резюме
            </Typography.Text>
            <ResumeButton application={a} />
          </div>
        </>
      )}
    />
  );
}
