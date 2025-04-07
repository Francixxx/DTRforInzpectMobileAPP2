import React, { useContext, useState } from "react";
import { 
  View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity, Modal, Alert 
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import { EmployeeContext } from "../context/EmployeeContext";

const EmployeeList = () => {
  const { employees, setEmployees } = useContext(EmployeeContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deleteEmployee = async (id) => {
    try {
        const response = await axios.delete(`http://10.100.1.113:5000/delete-employee/${id}`);

        console.log("Delete Response:", response.data); // Debugging log

        if (response.data.success) {
            setEmployees((prevEmployees) => prevEmployees.filter((emp) => emp.id !== id));
            Alert.alert("Success", "Employee deleted successfully!");
        } else {
            Alert.alert("Error", response.data.message || "Failed to delete employee.");
        }
    } catch (error) {
        console.error("Error:", error.response?.data || error);
        Alert.alert("Error", error.response?.data?.message || "An error occurred while deleting.");
    }
};


  // 🔑 Change Password Request
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in both password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      const response = await axios.put(
        `http://10.100.1.113:5000/change-password/${selectedEmployee.id}`,
        { password: newPassword }
      );

      if (response.data.success) {
        Alert.alert("Success", "Password updated successfully!");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        Alert.alert("Error", "Failed to update password.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while changing the password.");
    }
  };

  return (
    <View style={styles.container}>


     
      <TextInput
        style={styles.searchInput}
        placeholder="Search by name or position..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#888"
      />

      {/* Employee List */}
      <FlatList
        data={filteredEmployees}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => { setSelectedEmployee(item); setModalVisible(true); }}>
            <View style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.details}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.position}>{item.position}</Text>
                </View>
                <View style={styles.iconContainer}>
                  <TouchableOpacity onPress={() => deleteEmployee(item.id)}>
                    <Icon name="delete" size={22} color="red" style={styles.icon} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No employees found</Text>}
      />

      {/* Employee Details Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedEmployee && (
              <>
                <Text style={styles.modalTitle}>Employee Details</Text>

                {/* Name & Position */}
                <View style={styles.profileContainer}>
                  <Icon name="person" size={50} color="#007bff" />
                  <Text style={styles.profileName}>{selectedEmployee.name}</Text>
                  <Text style={styles.profilePosition}>{selectedEmployee.status}</Text>
                </View>

                {/* Employee Info */}
                <View style={styles.infoContainer}>
                  <View style={styles.infoRow}>
                    <Icon name="badge" size={20} color="#555" />
                    <Text style={styles.infoText}>ID: {selectedEmployee.id_number}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Icon name="email" size={20} color="#555" />
                    <Text style={styles.infoText}>Email: {selectedEmployee.email}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Icon name="business" size={20} color="#555" />
                    <Text style={styles.infoText}>Department: {selectedEmployee.position}</Text>
                  </View>
                </View>

                {/* 🔐 Change Password Section */}
                <Text style={styles.passwordLabel}>Change Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="New Password"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity style={styles.changePasswordButton} onPress={handleChangePassword}>
                  <Text style={styles.buttonText}>Update Password</Text>
                </TouchableOpacity>

                {/* Close Button */}
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f4f4f4" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 15, textAlign: "center", color: "#333" },
  searchInput: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    fontSize: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  profileName: { fontSize: 22, fontWeight: "bold", color: "#333" },
  profilePosition: { fontSize: 16, color: "#666" },

  // 🔐 Password Section
  passwordLabel: { fontSize: 16, fontWeight: "bold", marginTop: 15, color: "#333" },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderColor: "#ccc",
    fontSize: 16,
    width: "100%",
  },
  changePasswordButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  closeButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  container: { flex: 1, padding: 20, backgroundColor: "#f4f4f4" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 15, textAlign: "center", color: "#333" },
  searchInput: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    fontSize: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  details: { flex: 1 },
  name: { fontSize: 18, fontWeight: "bold", color: "#333" },
  position: { fontSize: 14, color: "#666", marginTop: 2 },
  iconContainer: { flexDirection: "row" },
  icon: { marginLeft: 15 },
  emptyText: { textAlign: "center", marginTop: 20, fontSize: 16, color: "gray" },

  // 🔹 Modal Styling
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "85%",
    alignItems: "center",
    elevation: 5,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10, color: "#007bff" },
  
  // 🔹 Profile Section
  profileContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  profileName: { fontSize: 22, fontWeight: "bold", marginTop: 5, color: "#333" },
  profilePosition: { fontSize: 16, color: "#666" },

  // 🔹 Employee Info Section
  infoContainer: { width: "100%", marginTop: 10 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#f4f4f4",
    padding: 10,
    borderRadius: 5,
  },
  infoText: { fontSize: 16, marginLeft: 10, color: "#333" },

  // 🔹 Close Button
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  closeButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  header: {
    height: 110,
    backgroundColor: "#007BFF",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
});



export default EmployeeList;
