import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  ScrollView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import FilterBar from "../components/FilterBar";

const Main = ({ navigation }) => {
  // Estados para filtros
  const [selectedAttribute, setSelectedAttribute] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedRace, setSelectedRace] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");

  // Estados principais
  const [searchTerm, setSearchTerm] = useState("");
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [lastSearchedCard, setLastSearchedCard] = useState(null);

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
      const normalizedTerm = normalizeSearchTerm(searchTerm);
      let url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(normalizedTerm)}`;
      
      // Adicionar filtros à URL
      if (selectedAttribute) url += `&attribute=${selectedAttribute}`;
      if (selectedType) url += `&type=${encodeURIComponent(selectedType)}`;
      if (selectedRace) url += `&race=${encodeURIComponent(selectedRace)}`;
      if (selectedLevel) url += `&level=${selectedLevel}`;

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
    <View style={styles.container}>
      <FilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedAttribute={selectedAttribute}
        setSelectedAttribute={setSelectedAttribute}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedRace={selectedRace}
        setSelectedRace={setSelectedRace}
        selectedLevel={selectedLevel}
        setSelectedLevel={setSelectedLevel}
        onSearch={handleSearch}
        loading={searchLoading}
      />

      <FlatList
        data={cards}
        renderItem={renderCard}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <>
            {lastSearchedCard && (
              <View style={styles.searchedCardContainer}>
                <Image source={{ uri: lastSearchedCard.image }} style={styles.cardImage} />
                <Text style={styles.cardName}>{lastSearchedCard.name}</Text>
                <Text style={styles.cardType}>{lastSearchedCard.type} • {lastSearchedCard.race}</Text>
                <ScrollView style={styles.descriptionScroll}>
                  <Text style={styles.cardDescription}>{lastSearchedCard.desc}</Text>
                </ScrollView>
                <TouchableOpacity
                  style={[styles.button, styles.addButton]}
                  onPress={() => addCardToCollection(lastSearchedCard)}
                >
                  <Text style={styles.buttonText}>Adicionar à coleção</Text>
                </TouchableOpacity>
              </View>
            )}
            <Text style={styles.sectionTitle}>Minha Coleção ({cards.length})</Text>
          </>
        }
        contentContainerStyle={styles.listContent}
        style={styles.cardsList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma carta adicionada</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchedCardContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    margin: 16,
    marginBottom: 8,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    elevation: 3,
  },
  descriptionScroll: {
    maxHeight: 100,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  listContent: {
    paddingBottom: 40,
  },
  cardsList: {
    flex: 1,
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 13,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    height: 40,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  detailsButton: {
    backgroundColor: '#7159c1',
  },
  addButton: {
    backgroundColor: '#10b981',
    marginTop: 8,
  },
  removeButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 40,
    paddingHorizontal: 16,
  },
});

export default Main;