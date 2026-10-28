"use client";

import { useState, type ReactNode } from "react";
import { DeleteOutlined } from "@ant-design/icons";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Button, Card, Drawer, Flex, Input, Popconfirm, Segmented, Select, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { api, errorMessage } from "@/lib/api";
import type { Paginated } from "@/lib/types";
import { PageHeader } from "./PageHeader";

type Item = { id: number; status: string; adminNote: string; createdAt: string };

export type StatusOption = { value: string; label: string; color: string };

type InboxPageProps<T extends Item> = {
  resource: string;
  title: string;
  description: ReactNode;
  statuses: StatusOption[];
  columns: ColumnsType<T>;
  renderDetails: (item: T) => ReactNode;
  drawerTitle: (item: T) => ReactNode;
};

export function StatusTag({ value, statuses }: { value: string; statuses: StatusOption[] }) {
  const status = statuses.find((s) => s.value === value);
  return <Tag color={status?.color}>{status?.label ?? value}</Tag>;
}

export function InboxPage<T extends Item>({
  resource,
  title,
  description,
  statuses,
  columns,
  renderDetails,
  drawerTitle,
}: InboxPageProps<T>) {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [opened, setOpened] = useState<T | null>(null);
  const [note, setNote] = useState("");

  const params = new URLSearchParams({ page: String(page), pageSize: "20" });
  if (status) params.set("status", status);
  if (search) params.set("search", search);

  const { data, isFetching } = useQuery({
    queryKey: [resource, "list", status, search, page],
    queryFn: () => api.get<Paginated<T>>(`/${resource}?${params}`),
    placeholderData: keepPreviousData,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: [resource] });

  const update = useMutation({
    mutationFn: ({ id, ...body }: { id: number; status?: string; adminNote?: string }) =>
      api.patch<T>(`/${resource}/${id}`, body),
    onSuccess: (item) => {
      setOpened(item);
      refresh();
    },
    onError: (error) => message.error(errorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/${resource}/${id}`),
    onSuccess: () => {
      message.success("Удалено");
      setOpened(null);
      refresh();
    },
    onError: (error) => message.error(errorMessage(error)),
  });

  const open = (item: T) => {
    setOpened(item);
    setNote(item.adminNote);
    // Opening a new item marks it as seen
    if (item.status === "new") update.mutate({ id: item.id, status: statuses[1].value });
  };

  return (
    <>
      <PageHeader title={title} description={description} />

      <Card styles={{ body: { padding: 0 } }} style={{ overflow: "hidden" }}>
        <Flex gap={12} wrap style={{ padding: 16, borderBottom: "1px solid #f0f0f0" }}>
          <Segmented
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            options={[{ value: "", label: "Все" }, ...statuses.map(({ value, label }) => ({ value, label }))]}
          />
          <Input.Search
            allowClear
            placeholder="Поиск по имени, email, телефону…"
            style={{ maxWidth: 320 }}
            onSearch={(value) => {
              setSearch(value.trim());
              setPage(1);
            }}
          />
        </Flex>

        <Table<T>
          rowKey="id"
          scroll={{ x: 900 }}
          loading={isFetching}
          dataSource={data?.items}
          onRow={(item) => ({
            onClick: () => open(item),
            style: { cursor: "pointer", fontWeight: item.status === "new" ? 600 : undefined },
          })}
          columns={[
            {
              title: "Дата",
              dataIndex: "createdAt",
              width: 150,
              render: (value: string) => dayjs(value).format("DD.MM.YYYY HH:mm"),
            },
            ...columns,
            {
              title: "Статус",
              dataIndex: "status",
              width: 140,
              render: (value: string) => <StatusTag value={value} statuses={statuses} />,
            },
          ]}
          pagination={{
            current: page,
            pageSize: 20,
            total: data?.total,
            onChange: setPage,
            showTotal: (total) => `Всего: ${total}`,
            style: { padding: "0 16px" },
          }}
        />
      </Card>

      <Drawer
        open={opened !== null}
        size={640}
        title={opened && drawerTitle(opened)}
        onClose={() => setOpened(null)}
        extra={
          opened && (
            <Popconfirm
              title="Удалить без возможности восстановления?"
              okText="Удалить"
              okButtonProps={{ danger: true }}
              cancelText="Отмена"
              onConfirm={() => remove.mutate(opened.id)}
            >
              <Button danger icon={<DeleteOutlined />}>
                Удалить
              </Button>
            </Popconfirm>
          )
        }
      >
        {opened && (
          <Space orientation="vertical" size="large" style={{ width: "100%" }}>
            <Typography.Text type="secondary">
              Получено {dayjs(opened.createdAt).format("D MMMM YYYY, HH:mm")}
            </Typography.Text>
            {renderDetails(opened)}
            <div>
              <Typography.Text strong>Статус</Typography.Text>
              <Select
                style={{ width: "100%", marginTop: 8 }}
                value={opened.status}
                options={statuses}
                onChange={(value) => update.mutate({ id: opened.id, status: value })}
              />
            </div>
            <div>
              <Typography.Text strong>Заметка (видна только в админке)</Typography.Text>
              <Input.TextArea
                rows={3}
                style={{ marginTop: 8 }}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <Button
                style={{ marginTop: 8 }}
                disabled={note === opened.adminNote}
                loading={update.isPending}
                onClick={() =>
                  update.mutate(
                    { id: opened.id, adminNote: note },
                    { onSuccess: () => message.success("Заметка сохранена") },
                  )
                }
              >
                Сохранить заметку
              </Button>
            </div>
          </Space>
        )}
      </Drawer>
    </>
  );
}
