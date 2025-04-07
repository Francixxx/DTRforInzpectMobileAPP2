import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, Animated, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";

const SettingsScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordField, setShowPasswordField] = useState(false);
  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    const fetchUserData = async () => {
      const storedName = await AsyncStorage.getItem("username");
      if (storedName) {
        setUsername(storedName);
      } else {
        setUsername("Admin");
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          await AsyncStorage.removeItem("userToken");
          navigation.replace("LoginScreen");
        },
      },
    ]);
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const handleChangePassword = async () => {
    if (!password) {
      Alert.alert("Error", "Please enter a new password.");
      return;
    }

    try {
      const adminId = await AsyncStorage.getItem("admin_id"); // Assuming admin ID is stored in AsyncStorage
      const response = await axios.post("http://10.100.1.113:5000/change-password", {
        admin_id: adminId,
        new_password: password,
      });

      if (response.data.success) {
        Alert.alert("Success", "Password changed successfully.");
        setPassword("");
        setShowPasswordField(false);
      } else {
        Alert.alert("Error", response.data.message);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to change password.");
      console.error("Error changing password:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileContainer}>
        <Image source={require("../assets/Logo.png")} style={styles.profileImage} />
        <Text style={styles.username}>{username}</Text>
      </View>


      {showPasswordField && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter new password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword}>
            <Text style={styles.saveButtonText}>Save Password</Text>
          </TouchableOpacity>
        </View>
      )}

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {!showPasswordField && (
          <TouchableOpacity
            style={styles.changePasswordButton}
            onPress={() => setShowPasswordField(true)}
          >
            <Icon name="lock" size={22} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Change Password</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Icon name="exit-to-app" size={22} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f4f4f4", padding: 20 },
  profileContainer: {
    alignItems: "center",
    marginBottom: 40,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    width: "90%",
  },
  profileImage: {
    width: 90,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  username: { fontSize: 22, fontWeight: "bold", color: "#333" },
  inputContainer: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    fontSize: 16,
    marginBottom: 10,
  },
  changePasswordButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007bff",
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 10,
    elevation: 3,
    marginBottom: 10,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d9534f",
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 10,
    elevation: 3,
  },
  saveButton: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: { fontSize: 16, color: "#fff", fontWeight: "bold" },
  icon: { marginRight: 10 },
  buttonText: { fontSize: 18, color: "#fff", fontWeight: "bold" },
});

export default SettingsScreen;
