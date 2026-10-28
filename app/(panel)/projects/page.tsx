"use client";

import { useQuery } from "@tanstack/react-query";
import { Col, Divider, Form, Image, Input, InputNumber, Row, Select, Space, Switch, Tag, Typography } from "antd";
import { PublishedField, SlugField } from "@/components/FormParts";
import { ImageInput, ImagesInput, LocalizedInput, requiredLocalized } from "@/components/inputs";
import { ResourcePage } from "@/components/ResourcePage";
import { api, mediaUrl } from "@/lib/api";
import { emptyText, showText, type Country, type Project, type Service } from "@/lib/types";

function ProjectForm() {
  const form = Form.useFormInstance();
  const isFeatured = Form.useWatch("isFeatured", form);
  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: () => api.get<Service[]>("/services") });
  const { data: countries = [] } = useQuery({ queryKey: ["countries"], queryFn: () => api.get<Country[]>("/countries") });

  return (
    <>
      <Form.Item name="coverImage" label="Обложка" rules={[{ required: true, message: "Загрузите обложку" }]}>
        <ImageInput />
      </Form.Item>
      <Form.Item name="title" label="Название проекта" rules={[requiredLocalized()]}>
        <LocalizedInput />
      </Form.Item>
      <Form.Item name="description" label="Краткое описание" extra="Показывается в карточке проекта и первым абзацем на его странице">
        <LocalizedInput multiline rows={3} />
      </Form.Item>
      <Form.Item
        name="content"
        label="Подробный текст"
        extra="Продолжение текста на странице проекта. Абзацы разделяйте пустой строкой."
      >
        <LocalizedInput multiline rows={8} />
      </Form.Item>
      <Form.Item name="gallery" label="Галерея" extra="Обложка автоматически идёт первой. Порядок меняется стрелками.">
        <ImagesInput />
      </Form.Item>

      <Divider titlePlacement="start">Информация о проекте</Divider>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="serviceId"
            label="Категория (услуга)"
            rules={[{ required: true, message: "Выберите категорию" }]}
          >
            <Select
              showSearch={{ optionFilterProp: "label" }}
              options={services.map((s) => ({ value: s.id, label: showText(s.title) }))}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="client" label="Клиент">
            <Input placeholder="Например: Huawei" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="countryId"
            label="Страна"
            rules={[{ required: true, message: "Выберите страну" }]}
            extra="Нет нужной? Добавьте в разделе «Страны»"
          >
            <Select
              showSearch={{ optionFilterProp: "label" }}
              options={countries.map((c) => ({ value: c.id, label: showText(c.name) }))}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="year" label="Год" rules={[{ required: true, message: "Укажите год" }]}>
            <InputNumber min={1990} max={new Date().getFullYear() + 1} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="city" label="Город">
        <LocalizedInput />
      </Form.Item>

      <Divider titlePlacement="start">Главная страница</Divider>
      <Form.Item
        name="isFeatured"
        label="Показывать в блоке «Клиенты и проекты» на главной"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>
      <Form.Item name="featuredOrder" label="Порядковый номер в блоке" hidden={!isFeatured}>
        <InputNumber min={0} />
      </Form.Item>
      <Form.Item
        name="featuredDescription"
        label="Текст для главной"
        extra="Если оставить пустым, будет использовано краткое описание"
        hidden={!isFeatured}
      >
        <LocalizedInput multiline rows={3} />
      </Form.Item>

      <Divider />
      <PublishedField />
      <SlugField urlPrefix="/portfolio" />
    </>
  );
}

export default function ProjectsPage() {
  return (
    <ResourcePage<Project>
      resource="projects"
      title="Проекты"
      itemName="проект"
      description="Портфолио. Порядок в таблице = порядок на странице «Портфолио». Отмеченные «На главной» попадают в блок «Клиенты и проекты»."
      drawerWidth={860}
      defaults={() => ({
        slug: "",
        title: emptyText(),
        description: emptyText(),
        content: emptyText(),
        coverImage: "",
        gallery: [],
        city: emptyText(),
        client: "",
        year: new Date().getFullYear(),
        isPublished: true,
        isFeatured: false,
        featuredOrder: 0,
        featuredDescription: emptyText(),
      })}
      columns={[
        {
          title: "Обложка",
          key: "cover",
          width: 96,
          render: (_, row) => (
            <Image src={mediaUrl(row.coverImage)} width={72} height={48} style={{ objectFit: "cover" }} alt="" />
          ),
        },
        {
          title: "Проект",
          key: "title",
          minWidth: 240,
          render: (_, row) => (
            <Space orientation="vertical" size={0}>
              <Typography.Text strong>{showText(row.title)}</Typography.Text>
              <Typography.Text type="secondary">{row.client}</Typography.Text>
            </Space>
          ),
        },
        { title: "Категория", key: "service", render: (_, row) => showText(row.serviceTitle) },
        { title: "Страна", key: "country", render: (_, row) => showText(row.countryName) },
        { title: "Год", dataIndex: "year", width: 80 },
        {
          title: "На главной",
          key: "featured",
          width: 110,
          render: (_, row) => (row.isFeatured ? <Tag color="gold">На главной</Tag> : null),
        },
      ]}
      renderForm={() => <ProjectForm />}
    />
  );
}
