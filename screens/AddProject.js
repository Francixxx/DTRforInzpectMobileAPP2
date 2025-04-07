import React, { useEffect, useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, 
  StyleSheet, Alert, ActivityIndicator, Modal 
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const AddProjectScreen = () => {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // Controls modal visibility

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://10.100.1.113:5000/projects");
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch projects.");
      console.error(error);
    }
    setLoading(false);
  };

  const addProject = async () => {
    if (!newProjectName.trim() || !newProjectDescription.trim()) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch("http://10.100.1.113:5000/projects/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName.trim(), description: newProjectDescription.trim() }),
      });

      const data = await response.json();
      if (data.success) {
        fetchProjects();
        setNewProjectName("");
        setNewProjectDescription("");
        setModalVisible(false); // Close modal after adding
      } else {
        Alert.alert("Error", "Failed to add project.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong.");
      console.error(error);
    }
  };

  const deleteProject = async (id) => {
    Alert.alert(
      "Delete Project",
      "Are you sure you want to remove this project?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          onPress: async () => {
            try {
              const response = await fetch(`http://10.100.1.113:5000/projects/delete/${id}`, { method: "DELETE" });
              const data = await response.json();
              if (data.success) fetchProjects();
              else Alert.alert("Error", "Failed to delete project.");
            } catch (error) {
              Alert.alert("Error", "Something went wrong.");
              console.error(error);
            }
          }, 
          style: "destructive"
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Button to Open Modal */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Icon name="add-circle" size={24} color="white" />
        <Text style={styles.addButtonText}>Add Project</Text>
      </TouchableOpacity>

      {/* Modal for Adding New Project */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add New Project</Text>

            <TextInput
              style={styles.input}
              placeholder="Project Name"
              value={newProjectName}
              onChangeText={setNewProjectName}
            />
            <TextInput
              style={styles.input}
              placeholder="Project Description"
              value={newProjectDescription}
              onChangeText={setNewProjectDescription}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalAddButton} onPress={addProject}>
                <Text style={styles.modalAddButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Existing Projects List */}
      <Text style={styles.title}>Existing Projects</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.projectCard}>
              <View style={styles.projectText}>
                <Text style={styles.projectName}>{item.name}</Text>
                <Text style={styles.projectDesc}>{item.description}</Text>
              </View>
              <TouchableOpacity onPress={() => deleteProject(item.id)}>
                <Icon name="delete" size={24} color="#FF4D4D" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F5F7FA" },

  title: { fontSize: 22, fontWeight: "bold", color: "#333", marginBottom: 10 },

  addButton: {
    flexDirection: "row",
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  addButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    width: "85%",
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },

  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 15 },

  input: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderColor: "#ccc",
    backgroundColor: "#FFF",
    fontSize: 16,
  },

  modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 15 },

  cancelButton: {
    backgroundColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginRight: 10,
  },

  cancelButtonText: { color: "#333", fontSize: 16, fontWeight: "bold" },

  modalAddButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },

  modalAddButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },

  divider: { height: 2, backgroundColor: "#ddd", marginVertical: 20 },

  projectCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },

  projectText: { flex: 1 },

  projectName: { fontSize: 18, fontWeight: "bold", color: "#333" },

  projectDesc: { fontSize: 14, color: "#666", marginTop: 5 },
});

export default AddProjectScreen;
