"use client";

import { Form, Image, Space, Tag, Typography } from "antd";
import { PublishedField, SlugField } from "@/components/FormParts";
import { ImagesInput, LocalizedInput, LocalizedLines, requiredLocalized } from "@/components/inputs";
import { ResourcePage } from "@/components/ResourcePage";
import { mediaUrl } from "@/lib/api";
import { emptyList, emptyText, showText, type Service } from "@/lib/types";

export default function ServicesPage() {
  return (
    <ResourcePage<Service>
      resource="services"
      title="Услуги"
      itemName="услугу"
      description={
        <>
          Список услуг на главной странице. Эти же услуги служат <b>категориями проектов</b> (фильтр в
          портфолио) и вариантами в поле «Категория» формы заявки. Порядок в таблице = порядок на сайте.
        </>
      }
      defaults={() => ({ slug: "", title: emptyText(), tags: emptyList(), description: emptyText(), images: [], isPublished: true })}
      columns={[
        {
          title: "Фото",
          key: "image",
          width: 80,
          render: (_, row) =>
            row.images[0] ? (
              <Image src={mediaUrl(row.images[0])} width={56} height={40} style={{ objectFit: "cover" }} alt="" />
            ) : null,
        },
        {
          title: "Название",
          key: "title",
          minWidth: 260,
          render: (_, row) => (
            <Space orientation="vertical" size={2}>
              <Typography.Text strong>{showText(row.title)}</Typography.Text>
              <Space size={[4, 4]} wrap>
                {(row.tags.ru.length ? row.tags.ru : row.tags.en).map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Space>
            </Space>
          ),
        },
      ]}
      renderForm={() => (
        <>
          <Form.Item name="title" label="Название" rules={[requiredLocalized()]}>
            <LocalizedInput />
          </Form.Item>
          <Form.Item name="tags" label="Теги" extra="Короткие подписи под названием, каждая с новой строки">
            <LocalizedLines rows={3} />
          </Form.Item>
          <Form.Item name="description" label="Описание">
            <LocalizedInput multiline />
          </Form.Item>
          <Form.Item name="images" label="Фотографии" extra="Показываются при раскрытии услуги на главной">
            <ImagesInput />
          </Form.Item>
          <PublishedField />
          <SlugField />
        </>
      )}
    />
  );
}
