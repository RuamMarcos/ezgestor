import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { createStyles } from '@/styles/settings/UpdatePaymentModalStyles';
import { updatePaymentMethod } from '@/services/SubscriptionService';
import {
  aplicarMascaraCartao,
  aplicarMascaraValidade,
  aplicarMascaraCvv,
} from '@/utils/masks'; // Reutilizando as máscaras que você já tem

interface UpdatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const UpdatePaymentModal: React.FC<UpdatePaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const [dadosCartao, setDadosCartao] = useState({
    numero: '',
    validade: '',
    cvv: '',
    nome: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (name: string, value: string) => {
    let valorFormatado = value;
    if (name === 'numero') valorFormatado = aplicarMascaraCartao(value);
    else if (name === 'validade') valorFormatado = aplicarMascaraValidade(value);
    else if (name === 'cvv') valorFormatado = aplicarMascaraCvv(value);
    setDadosCartao((prev) => ({ ...prev, [name]: valorFormatado }));
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    setError('');
    if (
      !dadosCartao.numero ||
      !dadosCartao.validade ||
      !dadosCartao.cvv ||
      !dadosCartao.nome
    ) {
      setError('Todos os campos do cartão são obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      await updatePaymentMethod(dadosCartao);
      // toast.success('Forma de pagamento atualizada com sucesso!');
      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.detail ||
        'Falha ao atualizar o método de pagamento.';
      setError(errorMsg);
      // toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Resetar estado ao fechar
    setDadosCartao({ numero: '', validade: '', cvv: '', nome: '' });
    setError('');
    setLoading(false);
    onClose();
  };

  return (
    <Modal visible={isOpen} transparent={true} animationType="fade">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                Atualizar Forma de Pagamento
              </Text>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Número do Cartão</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor={colors.grayText}
                  keyboardType="numeric"
                  value={dadosCartao.numero}
                  onChangeText={(v) => handleChange('numero', v)}
                />
              </View>

              <View style={styles.row}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Validade</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/AA"
                    placeholderTextColor={colors.grayText}
                    keyboardType="numeric"
                    value={dadosCartao.validade}
                    onChangeText={(v) => handleChange('validade', v)}
                  />
                </View>
                <View style={styles.gap} />
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    placeholderTextColor={colors.grayText}
                    keyboardType="numeric"
                    value={dadosCartao.cvv}
                    onChangeText={(v) => handleChange('cvv', v)}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome no Cartão</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Como está no cartão"
                  placeholderTextColor={colors.grayText}
                  value={dadosCartao.nome}
                  onChangeText={(v) => handleChange('nome', v)}
                />
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleClose}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.saveButton,
                    loading && styles.saveButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator
                      color={isDark ? colors.text : '#FFFFFF'}
                    />
                  ) : (
                    <Text style={styles.buttonText}>Salvar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default UpdatePaymentModal;