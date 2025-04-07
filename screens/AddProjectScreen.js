import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";

const AddProjectScreen = () => {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("http://10.100.1.113:5000/projects");
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const addProject = async () => {
    if (!newProjectName || !newProjectDescription) {
      alert("Please enter all fields.");
      return;
    }

    try {
      const response = await fetch("http://10.100.1.113:5000/projects/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName, description: newProjectDescription }),
      });

      const data = await response.json();
      if (data.success) {
        fetchProjects(); // Refresh the list
        setNewProjectName("");
        setNewProjectDescription("");
      } else {
        alert("Error adding project.");
      }
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Project</Text>

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
      <TouchableOpacity style={styles.addButton} onPress={addProject}>
        <Text style={styles.addButtonText}>Add Project</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Existing Projects</Text>
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.projectItem}>
            <Text style={styles.projectName}>{item.name}</Text>
            <Text style={styles.projectDesc}>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  addButton: { backgroundColor: "#007BFF", padding: 10, borderRadius: 5, alignItems: "center" },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  projectItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  projectName: { fontSize: 18, fontWeight: "bold" },
  projectDesc: { fontSize: 14, color: "#666" },
});

export default AddProjectScreen;
