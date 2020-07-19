export default function usePersonalSign() {
  const { library, account } = useWeb3React();

  return async (message) => library.send("personal_sign", [message, account]);
}
