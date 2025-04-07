import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";


const LoginScreen = ({ navigation }) => {
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Loading state for button

  const handleLogin = async () => {
    console.log("🛠 Login button clicked!");
    setLoading(true);
  
    try {
      const response = await fetch("http://10.100.1.113:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_number: idNumber, password }),
      });
  
      const data = await response.json();
      console.log("✅ API Response:", data);
  
      if (data.message === "Login successful") {
        console.log("🚀 Navigating to UserDashboard with:", data.user);
  
        // ✅ Ensure AsyncStorage is available before using it
        if (AsyncStorage) {
          await AsyncStorage.setItem("employeeId", data.user.id_number.toString());
          console.log("✅ Employee ID stored in AsyncStorage");
        } else {
          console.warn("⚠️ AsyncStorage is not available");
        }
  
        navigation.navigate("UserDashboard", { employee: data.user });
      } else {
        Alert.alert("Login Failed", data.message);
      }
    } catch (error) {
      console.error("❌ Login Error:", error);
      Alert.alert("Error", "Network request failed. Check your connection.");
    }
  
    setLoading(false);
  };
  
  
  return (
    <View style={styles.container}>
      {/* Logo Image */}
      <Image source={require("../assets/Logo.png")} style={styles.logo} />

      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Login to your employee account</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="id-card-outline" size={24} color="#666" style={styles.icon} />
        <TextInput
          placeholder="Enter ID Number"
          style={styles.input}
          value={idNumber}
          onChangeText={setIdNumber}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={24} color="#666" style={styles.icon} />
        <TextInput
          placeholder="Enter Password"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {/* Animated Login Button */}
      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      {/* Admin Login Link */}
      <TouchableOpacity onPress={() => navigation.navigate("AdminLoginScreen")}>
        <Text style={styles.adminText}>Admin Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f4f6f9",
  },
  logo: {
    width: 90,
    height: 80,
    borderRadius: 50,
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 15,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  adminText: {
    fontSize: 16,
    color: "#007bff",
    marginTop: 15,
    fontWeight: "bold",
  },
});

export default LoginScreen;
