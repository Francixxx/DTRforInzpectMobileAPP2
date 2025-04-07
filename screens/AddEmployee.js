import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import Icon from "react-native-vector-icons/FontAwesome";
import axios from "axios";

const AddEmployeeScreen = () => {
  const [idNumber, setIdNumber] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [position, setPosition] = useState(null);
  const [status, setStatus] = useState(null);
  const [positionOpen, setPositionOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [loading, setLoading] = useState(false); // 🔄 Loading state

  const positionOptions = [
    { label: "Direct", value: "Direct" },
    { label: "Admin", value: "Admin" },
  ];

  const statusOptions = [
    { label: "Software", value: "Software" },
    { label: "Service", value: "Service" },
    { label: "Vision", value: "Vision" },
    { label: "Mechanical Design", value: "Mechanical Design" },
    { label: "Mechanical Fabrication", value: "Mechanical Fabrication" },
   

  ];

  const handleAddEmployee = async () => {
    if (!idNumber || !name || !email || !position || !status || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setLoading(true); // 🔄 Start loading

    try {
      await axios.post("http://10.100.1.113:5000/add-employee", {
        id_number: idNumber,
        name,
        email,
        position,
        status,
        password,
      });
      Alert.alert("Success", "Employee added successfully");
      setIdNumber("");
      setName("");
      setEmail("");
      setPosition(null);
      setStatus(null);
      setPassword("");
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to add employee");
    } finally {
      setLoading(false); // ✅ Stop loading
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <FlatList
        ListHeaderComponent={
          <>
        
            <View style={styles.header}>
              <Text style={styles.logo}></Text>
            </View>

       
            <View style={styles.formContainer}>
              <Text style={styles.title}>Create Employee Account</Text>
              <Text style={styles.subtitle}>
              
              </Text>

          
              <View style={styles.inputContainer}>
                <Icon name="id-badge" size={18} color="#555" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="ID Number"
                  value={idNumber}
                  onChangeText={setIdNumber}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Icon name="user" size={18} color="#555" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputContainer}>
                <Icon name="envelope" size={18} color="#555" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputContainer}>
                <Icon name="lock" size={18} color="#555" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              {/* Department Dropdown */}
              <View style={{ width: "100%", zIndex: positionOpen ? 3000 : 1 }}>
                <DropDownPicker
                  open={positionOpen}
                  value={position}
                  items={positionOptions}
                  setOpen={setPositionOpen}
                  setValue={setPosition}
                  placeholder="Select Department"
                  style={styles.dropdown}
                  dropDownContainerStyle={{
                    borderColor: "#ddd",
                    backgroundColor: "#fff",
                  }}
                />
              </View>

              {/* Position Dropdown */}
              <View style={{ width: "100%", zIndex: statusOpen ? 2000 : 1, marginTop: 10 }}>
                <DropDownPicker
                  open={statusOpen}
                  value={status}
                  items={statusOptions}
                  setOpen={setStatusOpen}
                  setValue={setStatus}
                  placeholder="Position"
                  style={styles.dropdown}
                  dropDownContainerStyle={{
                    borderColor: "#ddd",
                    backgroundColor: "#fff",
                  }}
                />
              </View>

              {/* Submit Button with Loading */}
              <TouchableOpacity 
                style={[styles.addButton, loading && styles.disabledButton]} 
                onPress={handleAddEmployee} 
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.addButtonText}>Register Employee</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        }
        data={[]} // Empty data to prevent rendering unnecessary rows
        keyExtractor={() => "dummy"} // Prevents FlatList warning
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  header: {
    height: 110,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
  logo: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  formContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: -30,
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center" },
  subtitle: { fontSize: 14, color: "#666", textAlign: "center", marginBottom: 15 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#F8F9FB",
  },
  input: { flex: 1, height: 50, paddingLeft: 10, fontSize: 16 },
  inputIcon: { marginRight: 10 },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#F8F9FB",
    paddingHorizontal: 10,
  },
  addButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  disabledButton: { backgroundColor: "#A0A0A0" }, // Gray out button when loading
});

export default AddEmployeeScreen;
