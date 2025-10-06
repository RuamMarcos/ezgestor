// mobile/components/stock/AddProductModal.tsx
import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Colors from '../../constants/Colors';
import type { Product } from '../../services/StockService';
import { styles } from '../../styles/stock/AddProductModalStyles';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
}

interface FormDataState {
  nome: string;
  codigo_do_produto: string;
  preco_venda: string;
  preco_custo: string;
  quantidade_estoque: string;
  quantidade_minima_estoque: string;
}

export default function AddProductModal({ visible, onClose, onSave }: ModalProps) {
  const [formData, setFormData] = useState<FormDataState>({
    nome: '',
    codigo_do_produto: '',
    preco_venda: '',
    preco_custo: '',
    quantidade_estoque: '',
    quantidade_minima_estoque: '',
  });
  const [pickedImage, setPickedImage] = useState<{ uri: string; name?: string; type?: string } | null>(null);

  // Função genérica para atualizar o estado do formulário
  const handleChange = (name: keyof FormDataState, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // 2. Converte os valores de string para número ANTES de enviar
    const productData: Product = {
      ...formData,
      preco_venda: parseFloat(formData.preco_venda.replace(',', '.')) || 0,
      preco_custo: formData.preco_custo ? parseFloat(formData.preco_custo.replace(',', '.')) : undefined,
      quantidade_estoque: parseInt(formData.quantidade_estoque, 10) || 0,
      quantidade_minima_estoque: parseInt(formData.quantidade_minima_estoque, 10) || 0,
      imagem: pickedImage || undefined,
    };
    if (!productData.nome || !productData.preco_venda) {
        Alert.alert("Erro", "Nome e Preço de Venda são obrigatórios.");
        return;
    }
    onSave(productData);
    // Limpa o formulário após salvar
    setFormData({ nome: '', codigo_do_produto: '', preco_venda: '', preco_custo: '', quantidade_estoque: '', quantidade_minima_estoque: '' });
    setPickedImage(null);
  };

  const pickImage = async () => {
    // Solicita permissão
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para selecionar a imagem.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const name = (asset as any).fileName || asset.uri.split('/').pop() || `imagem_${Date.now()}.jpg`;
      const type = (asset as any).mimeType || 'image/jpeg';
      setPickedImage({ uri: asset.uri, name, type });
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView>
            <Text style={styles.title}>Adicionar Novo Produto</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do Produto *"
              placeholderTextColor={Colors.placeholder}
              value={formData.nome}
              onChangeText={(text) => handleChange('nome', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Código/SKU"
              placeholderTextColor={Colors.placeholder}
              value={formData.codigo_do_produto}
              onChangeText={(text) => handleChange('codigo_do_produto', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Preço de Venda *"
              placeholderTextColor={Colors.placeholder}
              keyboardType="numeric"
              value={formData.preco_venda}
              onChangeText={(text) => handleChange('preco_venda', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Preço de Custo"
              placeholderTextColor={Colors.placeholder}
              keyboardType="numeric"
              value={formData.preco_custo}
              onChangeText={(text) => handleChange('preco_custo', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Qtd. em Estoque"
              placeholderTextColor={Colors.placeholder}
              keyboardType="numeric"
              value={formData.quantidade_estoque}
              onChangeText={(text) => handleChange('quantidade_estoque', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Qtd. Mínima"
              placeholderTextColor={Colors.placeholder}
              keyboardType="numeric"
              value={formData.quantidade_minima_estoque}
              onChangeText={(text) => handleChange('quantidade_minima_estoque', text)}
            />
            {pickedImage ? (
              <Image source={{ uri: pickedImage.uri }} style={styles.imagePreview} resizeMode="cover" />
            ) : (
              <Text style={styles.imageHint}>Opcional: selecione uma imagem para o produto</Text>
            )}
            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
              <Text>Selecionar Imagem</Text>
            </TouchableOpacity>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSubmit}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

