"use client";

import { Form, Typography } from "antd";
import { PublishedField, SlugField } from "@/components/FormParts";
import { LocalizedInput, LocalizedLines, requiredLocalized } from "@/components/inputs";
import { ResourcePage } from "@/components/ResourcePage";
import { emptyList, emptyText, showText, type Position } from "@/lib/types";

export default function PositionsPage() {
  return (
    <ResourcePage<Position>
      resource="positions"
      title="Вакансии"
      itemName="вакансию"
      description="Открытые позиции на странице «Карьера». Отклики кандидатов приходят в раздел «Отклики» и на почту из настроек. Закрытую вакансию можно просто выключить."
      defaults={() => ({
        slug: "",
        title: emptyText(),
        description: emptyText(),
        requirements: emptyList(),
        employmentType: { en: "Full-time", ru: "Полная занятость", tk: "Doly iş güni" },
        location: { en: "Ashgabat, Turkmenistan", ru: "Ашхабад, Туркменистан", tk: "Aşgabat, Türkmenistan" },
        isPublished: true,
      })}
      columns={[
        {
          title: "Вакансия",
          key: "title",
          minWidth: 220,
          render: (_, row) => <Typography.Text strong>{showText(row.title)}</Typography.Text>,
        },
        { title: "Занятость", key: "type", render: (_, row) => showText(row.employmentType) },
        { title: "Место", key: "location", render: (_, row) => showText(row.location) },
      ]}
      renderForm={() => (
        <>
          <Form.Item name="title" label="Название" rules={[requiredLocalized()]}>
            <LocalizedInput />
          </Form.Item>
          <Form.Item name="description" label="Описание">
            <LocalizedInput multiline rows={5} />
          </Form.Item>
          <Form.Item name="requirements" label="Требования" extra="Каждое требование с новой строки">
            <LocalizedLines rows={6} />
          </Form.Item>
          <Form.Item name="employmentType" label="Тип занятости">
            <LocalizedInput />
          </Form.Item>
          <Form.Item name="location" label="Место работы">
            <LocalizedInput />
          </Form.Item>
          <PublishedField />
          <SlugField />
        </>
      )}
    />
  );
}
