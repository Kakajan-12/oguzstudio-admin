import type { ReactNode } from "react";
import { Flex, Typography } from "antd";

export function PageHeader({
  title,
  description,
  extra,
}: {
  title: ReactNode;
  description?: ReactNode;
  extra?: ReactNode;
}) {
  return (
    <Flex justify="space-between" align="flex-start" gap={16} style={{ marginBottom: 20 }}>
      <div>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {title}
        </Typography.Title>
        {description && (
          <Typography.Paragraph type="secondary" style={{ margin: "6px 0 0", maxWidth: 760 }}>
            {description}
          </Typography.Paragraph>
        )}
      </div>
      {extra}
    </Flex>
  );
}
