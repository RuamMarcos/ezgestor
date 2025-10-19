// mobile/components/stock/EditProductModal.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Colors from '../../constants/Colors';
import type { Product } from '../../services/StockService';
import { styles } from '../../styles/stock/AddProductModalStyles'; // Reutilizando os estilos

interface ModalProps {
  visible: boolean;
  product: Product | null; // Produto para editar
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

export default function EditProductModal({ visible, product, onClose, onSave }: ModalProps) {
  const [formData, setFormData] = useState<FormDataState>({
    nome: '',
    codigo_do_produto: '',
    preco_venda: '',
    preco_custo: '',
    quantidade_estoque: '',
    quantidade_minima_estoque: '',
  });

  useEffect(() => {
    if (product) {
      setFormData({
        nome: product.nome,
        codigo_do_produto: product.codigo_do_produto || '',
        preco_venda: String(product.preco_venda),
        preco_custo: product.preco_custo ? String(product.preco_custo) : '',
        quantidade_estoque: String(product.quantidade_estoque),
        quantidade_minima_estoque: String(product.quantidade_minima_estoque),
      });
    }
  }, [product]);

  const [pickedImage, setPickedImage] = useState<{ uri: string; name?: string; type?: string } | null>(null);

  const pickImage = async () => {
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

  const handleChange = (name: keyof FormDataState, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!product) return;

    const productData: Product = {
      id_produto: product.id_produto,
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
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView>
            <Text style={styles.title}>Editar Produto</Text>
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
            ) : product?.imagem_url ? (
              <Image source={{ uri: product.imagem_url }} style={styles.imagePreview} resizeMode="cover" />
            ) : (
              <Text style={styles.imageHint}>Sem imagem atual. Selecione para adicionar.</Text>
            )}
            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
              <Text>Selecionar Nova Imagem</Text>
            </TouchableOpacity>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSubmit}>
                <Text style={styles.saveButtonText}>Salvar Alterações</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}