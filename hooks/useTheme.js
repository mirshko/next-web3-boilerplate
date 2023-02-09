import { theme } from 'antd'
const { useToken } = theme;

export default function useTheme() {
  const { token } = useToken()
  return token;
}