import { Button, notification } from "antd";
import { SelectOutlined } from "@ant-design/icons";
import { useCallback } from "react";

export const useTxNotification = () => {
  const [api, contextHolder] = notification.useNotification();

  const showSuccessNotification = useCallback(
    (message: string, description: string, txHash: string) => {
      const DescriptionComponent = (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {description}
          <Button
            target="_blank"
            href={`https://arbiscan.io/tx/${txHash}`}
            icon={<SelectOutlined rotate={90} />}
          >
            Transaction
          </Button>
        </div>
      );

      api.success({ message, description: DescriptionComponent });
    },
    [api]
  );

  const showErrorNotification = useCallback(
    (message: string, description: string) => {
      api.error({ message, description });
    },
    [api]
  );

  return [
    showSuccessNotification,
    showErrorNotification,
    contextHolder,
  ] as const;
};
