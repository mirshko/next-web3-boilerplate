import { Button, notification } from "antd";
import { ExclamationCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useCallback } from "react";

export const useTxNotification = () => {
  const [api, contextHolder] = notification.useNotification();

  const showSuccessNotification = useCallback(
    (message: string, description: string, txHash: string) => {
      const DescriptionComponent = (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {description}
          <Button target="_blank" href={`https://arbiscan.io/tx/${txHash}`}>
            Transaction &rarr;
          </Button>
        </div>
      );

      api.success({ message, description: DescriptionComponent });
    },
    [api]
  );

  const showErrorNotification = useCallback(
    (message: string, description: string) => {
      if (description == "execution reverted: 6") description = "Health factor would become lower than liquidation threshold";
      if ( message == "UNPREDICTABLE_GAS_LIMIT") message = "Error";
      api.error({ message, description,
        icon: <ExclamationCircleOutlined style={{ color: 'white', marginTop: 4, marginRight: 8 }}/>,
        style: {
          backgroundColor: '#B53D3D',
          color: 'white'
        }
      });
    },
    [api]
  );

  return [
    showSuccessNotification,
    showErrorNotification,
    contextHolder,
  ] as const;
};
