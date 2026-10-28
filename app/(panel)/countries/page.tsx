"use client";

import { Form } from "antd";
import { SlugField } from "@/components/FormParts";
import { LocalizedInput, requiredLocalized } from "@/components/inputs";
import { ResourcePage } from "@/components/ResourcePage";
import { emptyText, showText, type Country } from "@/lib/types";

export default function CountriesPage() {
  return (
    <ResourcePage<Country>
      resource="countries"
      title="Страны"
      itemName="страну"
      description="Страны, где выполнялись проекты. Используются в фильтре портфолио и в поле «Локация» на странице проекта. Страну, к которой привязаны проекты, удалить нельзя."
      drawerWidth={640}
      defaults={() => ({ slug: "", name: emptyText() })}
      columns={[
        { title: "Название", key: "name", render: (_, row) => showText(row.name) },
        { title: "EN", key: "en", render: (_, row) => row.name.en },
        { title: "TK", key: "tk", render: (_, row) => row.name.tk },
      ]}
      renderForm={() => (
        <>
          <Form.Item name="name" label="Название" rules={[requiredLocalized()]}>
            <LocalizedInput />
          </Form.Item>
          <SlugField />
        </>
      )}
    />
  );
}
