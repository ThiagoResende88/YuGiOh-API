import React, { Component } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  Alert
} from "react-native";

export default class CadastrarUsuario extends Component {
  state = {
    nome: "",
    telefone: "",
    cpf: "",
    email: "",
    curso: "",
    password: "",
  };

  handleCadastro = async () => {
    const { nome, telefone, cpf, email, curso, password } = this.state;
    
    // Validação de campos obrigatórios
    if (!nome || !telefone || !cpf || !email || !curso || !password) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }
    
    // Validação de CPF
    if (cpf.replace(/\D/g, "").length !== 11) {
      Alert.alert("Erro", "CPF inválido! Deve conter 11 dígitos.");
      return;
    }
    
    // Validação de e-mail
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Erro", "E-mail inválido!");
      return;
    }

    const newUser = {
      nome,
      telefone,
      cpf,
      email,
      curso,
      password,
    };
    
    try {
      // Obter lista atual de usuários
      const storedUsers = await AsyncStorage.getItem("users");
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      
      // Verificar se e-mail já existe
      if (users.some(user => user.email === email)) {
        Alert.alert("Erro", "Este e-mail já está cadastrado!");
        return;
      }
      
      // Adicionar novo usuário
      users.push(newUser);
      await AsyncStorage.setItem("users", JSON.stringify(users));
      
      Alert.alert("Sucesso", "Cadastro realizado com sucesso!");
      this.props.navigation.navigate("Login");
    } catch (error) {
      Alert.alert("Erro", "Falha ao cadastrar: " + error.message);
    }
  };

  render() {
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            value={this.state.nome}
            onChangeText={(nome) => this.setState({ nome })}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Telefone"
            keyboardType="phone-pad"
            value={this.state.telefone}
            onChangeText={(telefone) => this.setState({ telefone })}
          />
          
          <TextInput
            style={styles.input}
            placeholder="CPF"
            keyboardType="numeric"
            value={this.state.cpf}
            onChangeText={(cpf) => this.setState({ cpf })}
            maxLength={11}
          />
          
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            keyboardType="email-address"
            autoCapitalize="none"
            value={this.state.email}
            onChangeText={(email) => this.setState({ email })}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Curso"
            value={this.state.curso}
            onChangeText={(curso) => this.setState({ curso })}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Senha"
            secureTextEntry={true}
            value={this.state.password}
            onChangeText={(password) => this.setState({ password })}
          />
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={this.handleCadastro}
          >
            <Text style={styles.buttonText}>Cadastrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    height: 50,
    backgroundColor: '#7159c1',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});