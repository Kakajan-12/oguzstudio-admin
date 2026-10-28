"use client";

import { Avatar, Form, Input } from "antd";
import { PublishedField } from "@/components/FormParts";
import { ImageInput, LocalizedInput, requiredLocalized } from "@/components/inputs";
import { ResourcePage } from "@/components/ResourcePage";
import { mediaUrl } from "@/lib/api";
import { emptyText, showText, type TeamMember } from "@/lib/types";

export default function TeamPage() {
  return (
    <ResourcePage<TeamMember>
      resource="team"
      title="Команда"
      itemName="сотрудника"
      description="Блок «Команда» на странице «О нас»."
      drawerWidth={640}
      defaults={() => ({ name: "", role: emptyText(), photo: "", isPublished: true })}
      columns={[
        {
          title: "Фото",
          key: "photo",
          width: 72,
          render: (_, row) => <Avatar src={mediaUrl(row.photo)} size={44} />,
        },
        { title: "Имя", dataIndex: "name" },
        { title: "Должность", key: "role", render: (_, row) => showText(row.role) },
      ]}
      renderForm={() => (
        <>
          <Form.Item name="photo" label="Фото" rules={[{ required: true, message: "Загрузите фото" }]}>
            <ImageInput />
          </Form.Item>
          <Form.Item name="name" label="Имя" rules={[{ required: true, message: "Укажите имя" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Должность" rules={[requiredLocalized()]}>
            <LocalizedInput />
          </Form.Item>
          <PublishedField />
        </>
      )}
    />
  );
}
