import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';

const FilterBar = ({
  searchTerm,
  setSearchTerm,
  selectedAttribute,
  setSelectedAttribute,
  selectedType,
  setSelectedType,
  selectedRace,
  setSelectedRace,
  selectedLevel,
  setSelectedLevel,
  onSearch,
  loading
}) => {
  return (
    <View style={styles.container}>
      <Picker
        selectedValue={selectedAttribute}
        onValueChange={setSelectedAttribute}
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
          style={styles.input}
          placeholder="Buscar carta..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={onSearch}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={onSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <MaterialIcons name="search" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  picker: {
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    width: 50,
    height: 50,
    backgroundColor: '#7159c1',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});

export default FilterBar;