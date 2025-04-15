// Atualizando o main.js com melhorias de UX, separação da busca e adição de filtros

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Keyboard,
  ScrollView
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Picker } from '@react-native-picker/picker';

const Main = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [lastSearchedCard, setLastSearchedCard] = useState(null);
  const [selectedAttribute, setSelectedAttribute] = useState("");

  useEffect(() => {
    const loadCards = async () => {
      try {
        const savedCards = await AsyncStorage.getItem("yugioh_cards");
        if (savedCards) setCards(JSON.parse(savedCards));
      } catch (error) {
        Alert.alert("Erro", "Falha ao carregar cartas salvas");
      } finally {
        setLoading(false);
      }
    };
    loadCards();
  }, []);

  const normalizeSearchTerm = (text) => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      Alert.alert("Aviso", "Digite o nome de uma carta");
      return;
    }
    try {
      setSearchLoading(true);
      Keyboard.dismiss();
      const normalizedTerm = normalizeSearchTerm(searchTerm);
      let url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(normalizedTerm)}`;
      if (selectedAttribute) url += `&attribute=${selectedAttribute}`;
      const response = await axios.get(url);

      if (!response.data.data || response.data.data.length === 0) {
        Alert.alert("Não encontrado", "Nenhuma carta encontrada com esse nome");
        return;
      }

      const cardData = response.data.data[0];
      const newCard = {
        id: cardData.id,
        name: cardData.name,
        type: cardData.type,
        race: cardData.race,
        image: cardData.card_images[0].image_url,
        desc: cardData.desc,
        atk: cardData.atk,
        def: cardData.def,
        level: cardData.level,
        attribute: cardData.attribute
      };

      setLastSearchedCard(newCard);
      setSearchTerm("");
    } catch (error) {
      Alert.alert("Erro", "Falha ao buscar carta");
    } finally {
      setSearchLoading(false);
    }
  };

  const addCardToCollection = async (card) => {
    if (cards.some(c => c.id === card.id)) {
      Alert.alert("Info", "Esta carta já está na sua coleção");
      return;
    }
    const updated = [...cards, card];
    setCards(updated);
    await AsyncStorage.setItem("yugioh_cards", JSON.stringify(updated));
    Alert.alert("Sucesso", "Carta adicionada à coleção");
    setLastSearchedCard(null);
  };

  const handleRemoveCard = async (cardId) => {
    try {
      const updatedCards = cards.filter(card => card.id !== cardId);
      setCards(updatedCards);
      await AsyncStorage.setItem("yugioh_cards", JSON.stringify(updatedCards));
    } catch (error) {
      Alert.alert("Erro", "Falha ao remover carta");
    }
  };

  const renderCard = ({ item }) => (
    <View style={styles.cardContainer}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <Text style={styles.cardName}>{item.name}</Text>
      <Text style={styles.cardType}>{item.type} • {item.race}</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.detailsButton]}
          onPress={() => navigation.navigate("CardDetail", { card: item })}
        >
          <Text style={styles.buttonText}>Detalhes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.removeButton]}
          onPress={() => handleRemoveCard(item.id)}
        >
          <Text style={styles.buttonText}>Remover</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7159c1" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.searchArea}>
        <Picker
          selectedValue={selectedAttribute}
          onValueChange={(value) => setSelectedAttribute(value)}
          style={styles.picker}
        >
          <Picker.Item label="Todos Atributos" value="" />
          <Picker.Item label="DARK" value="DARK" />
          <Picker.Item label="LIGHT" value="LIGHT" />
          <Picker.Item label="EARTH" value="EARTH" />
          <Picker.Item label="WATER" value="WATER" />
          <Picker.Item label="FIRE" value="FIRE" />
          <Picker.Item label="WIND" value="WIND" />
          <Picker.Item label="DIVINE" value="DIVINE" />
        </Picker>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar carta..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={searchLoading}
          >
            {searchLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <MaterialIcons name="search" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {lastSearchedCard && (
        <View style={styles.cardContainer}>
          <Image source={{ uri: lastSearchedCard.image }} style={styles.cardImage} />
          <Text style={styles.cardName}>{lastSearchedCard.name}</Text>
          <Text style={styles.cardType}>{lastSearchedCard.type} • {lastSearchedCard.race}</Text>
          <Text style={styles.cardDescription}>{lastSearchedCard.desc}</Text>
          <TouchableOpacity
            style={[styles.button, styles.detailsButton]}
            onPress={() => addCardToCollection(lastSearchedCard)}
          >
            <Text style={styles.buttonText}>Adicionar à coleção</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionTitle}>Minha Coleção ({cards.length})</Text>

      <FlatList
        data={cards}
        renderItem={renderCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma carta adicionada</Text>}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchArea: { marginBottom: 20 },
  picker: { backgroundColor: '#fff', marginBottom: 10 },
  searchContainer: { flexDirection: 'row', marginBottom: 20 },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchButton: {
    width: 50,
    height: 50,
    backgroundColor: '#7159c1',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginVertical: 16 },
  listContent: { paddingBottom: 20 },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: { width: '100%', height: 200, resizeMode: 'contain', marginBottom: 12 },
  cardName: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  cardType: { fontSize: 14, color: '#666', marginBottom: 8 },
  cardDescription: { fontSize: 13, color: '#333', marginBottom: 10 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  button: {
    flex: 1,
    height: 40,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  detailsButton: { backgroundColor: '#7159c1' },
  removeButton: { backgroundColor: '#e74c3c' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#999', fontSize: 16, marginTop: 40 },
});

export default Main;
