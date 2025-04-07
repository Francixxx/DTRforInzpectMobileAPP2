import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from "react-native";
import LottieView from "lottie-react-native";
import axios from "axios";

const AdminLoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleAdminLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }

    setLoggingIn(true); 

    try {
      const response = await axios.post("http://10.100.1.113:5000/admin-login", { username, password });

      setLoggingIn(false);
      Alert.alert("Success", "Admin login successful");
      navigation.replace("AdminDashboard", { admin: response.data.admin });
    } catch (error) {
      setLoggingIn(false);
      Alert.alert("Error", error.response?.data?.message || "Login failed");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
       <LottieView 
  source={require("../assets/buttonloading.json")}
  autoPlay 
  loop 
  style={{ width: 150, height: 150,  }}
/>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={require("../assets/Logo.png")} style={styles.logo} />

      <Text style={styles.title}>Admin Login</Text>

      <TextInput
        placeholder="Enter Username"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        placeholder="Enter Password"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

     
      <TouchableOpacity style={styles.button} onPress={handleAdminLogin} disabled={loggingIn}>
        {loggingIn ? (
          <LottieView source={require("../assets/loginloading.json")} autoPlay loop style={styles.buttonLoader} />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

   
      <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
        <Text style={styles.employeeText}>Employee Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  lottie: {
    width: 150,
    height: 150,
  },
  loadingText: {
    fontSize: 18,
    marginTop: 10,
    color: "#007bff",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  logo: {
    width: 90,
    height: 80,
    borderRadius: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonLoader: {
    width: 50,
    height: 50,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  employeeText: {
    fontSize: 16,
    color: "#007bff",
    marginTop: 15,
    fontWeight: "bold",
  },
});

export default AdminLoginScreen;
