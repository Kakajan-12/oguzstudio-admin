"use client";

import { Form, Image, Input } from "antd";
import { PublishedField } from "@/components/FormParts";
import { ImageInput } from "@/components/inputs";
import { ResourcePage } from "@/components/ResourcePage";
import { mediaUrl } from "@/lib/api";
import type { Brand } from "@/lib/types";

export default function BrandsPage() {
  return (
    <ResourcePage<Brand>
      resource="brands"
      title="Бренды"
      itemName="бренд"
      description="Логотипы в блоке «Бренды, с которыми мы работаем» на странице «О нас». Лучше загружать PNG или SVG с прозрачным фоном."
      drawerWidth={640}
      defaults={() => ({ name: "", logo: "", isPublished: true })}
      columns={[
        {
          title: "Логотип",
          key: "logo",
          width: 120,
          render: (_, row) => (
            <Image src={mediaUrl(row.logo)} width={88} height={40} style={{ objectFit: "contain" }} alt="" />
          ),
        },
        { title: "Название", dataIndex: "name" },
      ]}
      renderForm={() => (
        <>
          <Form.Item name="logo" label="Логотип" rules={[{ required: true, message: "Загрузите логотип" }]}>
            <ImageInput />
          </Form.Item>
          <Form.Item
            name="name"
            label="Название"
            extra="Не показывается на сайте, используется как подпись к картинке"
            rules={[{ required: true, message: "Укажите название" }]}
          >
            <Input />
          </Form.Item>
          <PublishedField />
        </>
      )}
    />
  );
}
