import { Alert, Platform } from 'react-native';

type ConfirmOptions = {
  title?: string;
  message?: string;
  okText?: string;
  cancelText?: string;
  destructive?: boolean;
};

export function confirm(options: ConfirmOptions = {}): Promise<boolean> {
  const {
    title = 'Confirmar',
    message = 'Tem certeza?',
    okText = 'OK',
    cancelText = 'Cancelar',
    destructive = true,
  } = options;

  if (Platform.OS === 'web') {
    // Use o diálogo nativo do navegador no web
    // Botões customizados não são suportados no window.confirm
    const text = title ? `${title}\n\n${message}` : message;
    return Promise.resolve(window.confirm(text));
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: cancelText, style: 'cancel', onPress: () => resolve(false) },
      { text: okText, style: destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
    ]);
  });
}
