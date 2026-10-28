"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { DeleteOutlined, EditOutlined, HolderOutlined, PlusOutlined } from "@ant-design/icons";
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Button, Card, Drawer, Form, Popconfirm, Space, Switch, Table, Tooltip, type FormInstance } from "antd";
import type { ColumnsType } from "antd/es/table";
import { api, errorMessage } from "@/lib/api";
import { FormLangSwitch } from "./EditLang";
import { PageHeader } from "./PageHeader";

type Row = { id: number; sortOrder?: number; isPublished?: boolean };

type ResourcePageProps<T extends Row> = {
  /** API path under /api/admin, e.g. "services" */
  resource: string;
  title: string;
  /** Explains where this content appears on the site */
  description: ReactNode;
  /** Accusative, for buttons: "Добавить услугу" */
  itemName: string;
  columns: ColumnsType<T>;
  renderForm: (form: FormInstance) => ReactNode;
  /** Initial values for a new item */
  defaults: () => Record<string, unknown>;
  /** Show a drag handle to change the order on the site */
  sortable?: boolean;
  drawerWidth?: number;
};

// Drag handle props travel from the row to the handle cell
type Handle = Pick<ReturnType<typeof useSortable>, "setActivatorNodeRef" | "listeners">;
const HandleContext = createContext<Handle | null>(null);

function DragHandle() {
  const sortable = useContext(HandleContext);
  return (
    <Tooltip title="Перетащите, чтобы изменить порядок на сайте">
      <Button
        type="text"
        size="small"
        icon={<HolderOutlined />}
        style={{ cursor: "grab" }}
        ref={sortable?.setActivatorNodeRef}
        {...sortable?.listeners}
      />
    </Tooltip>
  );
}

function SortableRow(props: React.HTMLAttributes<HTMLTableRowElement> & { "data-row-key": string }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: props["data-row-key"] });
  const handle = useMemo(() => ({ setActivatorNodeRef, listeners }), [setActivatorNodeRef, listeners]);
  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { position: "relative", zIndex: 10, background: "#fafafa" } : {}),
  };
  return (
    <HandleContext.Provider value={handle}>
      <tr {...props} ref={setNodeRef} style={style} {...attributes} />
    </HandleContext.Provider>
  );
}

export function ResourcePage<T extends Row>({
  resource,
  title,
  description,
  itemName,
  columns,
  renderForm,
  defaults,
  sortable = true,
  drawerWidth = 720,
}: ResourcePageProps<T>) {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [editing, setEditing] = useState<T | "new" | null>(null);

  const listKey = [resource];
  const { data = [], isLoading } = useQuery({ queryKey: listKey, queryFn: () => api.get<T[]>(`/${resource}`) });
  const refresh = () => queryClient.invalidateQueries({ queryKey: listKey });

  const save = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      editing && editing !== "new"
        ? api.put<T>(`/${resource}/${editing.id}`, { ...values, sortOrder: editing.sortOrder })
        : api.post<T>(`/${resource}`, values),
    onSuccess: () => {
      message.success("Сохранено");
      setEditing(null);
      refresh();
    },
    onError: (error) => message.error(errorMessage(error)),
  });

  const patch = useMutation({
    mutationFn: ({ id, ...values }: { id: number } & Record<string, unknown>) =>
      api.patch(`/${resource}/${id}`, values),
    onSuccess: refresh,
    onError: (error) => message.error(errorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/${resource}/${id}`),
    onSuccess: () => {
      message.success("Удалено");
      refresh();
    },
    onError: (error) => message.error(errorMessage(error)),
  });

  const reorder = useMutation({
    mutationFn: (ids: number[]) => api.post(`/${resource}/reorder`, { ids }),
    onError: (error) => {
      message.error(errorMessage(error));
      refresh();
    },
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = data.findIndex((row) => String(row.id) === active.id);
    const to = data.findIndex((row) => String(row.id) === over.id);
    const next = arrayMove(data, from, to);
    queryClient.setQueryData(listKey, next);
    reorder.mutate(next.map((row) => row.id));
  };

  const open = (record: T | "new") => {
    form.resetFields();
    form.setFieldsValue(record === "new" ? defaults() : record);
    setEditing(record);
  };

  const allColumns = useMemo<ColumnsType<T>>(
    () => [
      ...(sortable ? [{ key: "sort", width: 48, render: () => <DragHandle /> }] : []),
      ...columns,
      ...(data.some((row) => "isPublished" in row)
        ? [
            {
              key: "isPublished",
              title: "На сайте",
              width: 100,
              render: (_: unknown, record: T) => (
                <Switch
                  size="small"
                  checked={record.isPublished}
                  onChange={(isPublished) => patch.mutate({ id: record.id, isPublished })}
                />
              ),
            },
          ]
        : []),
      {
        key: "actions",
        width: 110,
        align: "right" as const,
        // Stays visible when a narrow screen scrolls the table sideways
        fixed: "right" as const,
        render: (_: unknown, record: T) => (
          <Space size={0}>
            <Tooltip title="Редактировать">
              <Button type="text" icon={<EditOutlined />} onClick={() => open(record)} />
            </Tooltip>
            <Popconfirm
              title="Удалить без возможности восстановления?"
              okText="Удалить"
              okButtonProps={{ danger: true }}
              cancelText="Отмена"
              onConfirm={() => remove.mutate(record.id)}
            >
              <Tooltip title="Удалить">
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columns, data, sortable],
  );

  const table = (
    <Table<T>
      rowKey={(row) => String(row.id)}
      columns={allColumns}
      scroll={{ x: 960 }}
      dataSource={data}
      loading={isLoading}
      pagination={false}
      components={sortable ? { body: { row: SortableRow } } : undefined}
      onRow={(record) => ({ onDoubleClick: () => open(record) })}
    />
  );

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => open("new")}>
            Добавить {itemName}
          </Button>
        }
      />

      <Card styles={{ body: { padding: 0 } }} style={{ overflow: "hidden" }}>
        {sortable ? (
          <DndContext sensors={sensors} onDragEnd={onDragEnd}>
            <SortableContext items={data.map((row) => String(row.id))} strategy={verticalListSortingStrategy}>
              {table}
            </SortableContext>
          </DndContext>
        ) : (
          table
        )}
      </Card>

      <Drawer
        open={editing !== null}
        title={editing === "new" ? `Новая запись` : "Редактирование"}
        size={drawerWidth}
        styles={{ wrapper: { maxWidth: "100vw" } }}
        onClose={() => setEditing(null)}
        destroyOnHidden={false}
        extra={
          <Space size="middle">
            <FormLangSwitch form={form} size="small" />
            <Button onClick={() => setEditing(null)}>Отмена</Button>
            <Button type="primary" loading={save.isPending} onClick={() => form.submit()}>
              Сохранить
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => save.mutate(values)}
          onFinishFailed={() => message.warning("Проверьте выделенные поля")}
          scrollToFirstError
        >
          {renderForm(form)}
        </Form>
      </Drawer>
    </>
  );
}
