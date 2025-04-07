import React, { useEffect, useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, 
  StyleSheet, Alert 
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons"; // Import icons

const AddActivityScreen = () => {
  const [activities, setActivities] = useState([]);
  const [newActivityName, setNewActivityName] = useState("");
  const [newActivityDescription, setNewActivityDescription] = useState("");

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch("http://10.100.1.113:5000/activities");
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const addActivity = async () => {
    if (!newActivityName || !newActivityDescription) {
      Alert.alert("Error", "Please enter all fields.");
      return;
    }

    try {
      const response = await fetch("http://10.100.1.113:5000/activities/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newActivityName, description: newActivityDescription }),
      });

      const data = await response.json();
      if (data.success) {
        fetchActivities(); // Refresh list
        setNewActivityName("");
        setNewActivityDescription("");
      } else {
        Alert.alert("Error", "Failed to add activity.");
      }
    } catch (error) {
      console.error("Error adding activity:", error);
    }
  };

  const deleteActivity = async (id) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this activity?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: async () => {
          try {
            const response = await fetch(`http://10.100.1.113:5000/activities/delete/${id}`, {
              method: "DELETE",
            });

            const data = await response.json();
            if (data.success) {
              fetchActivities();
            } else {
              Alert.alert("Error", "Failed to delete activity.");
            }
          } catch (error) {
            console.error("Error deleting activity:", error);
          }
        }},
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Add Activity Section */}
      <Text style={styles.title}>Add New Activity</Text>

      <TextInput
        style={styles.input}
        placeholder="Activity Name"
        value={newActivityName}
        onChangeText={setNewActivityName}
      />
      <TextInput
        style={styles.input}
        placeholder="Activity Description"
        value={newActivityDescription}
        onChangeText={setNewActivityDescription}
      />

      <TouchableOpacity style={styles.addButton} onPress={addActivity}>
        <Icon name="add-circle-outline" size={24} color="white" />
        <Text style={styles.addButtonText}>Add Activity</Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Existing Activities List */}
      <Text style={styles.title}>Existing Activities</Text>
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.activityCard}>
            <View style={styles.activityText}>
              <Text style={styles.activityName}>{item.name}</Text>
              <Text style={styles.activityDesc}>{item.description}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteActivity(item.id)}>
              <Icon name="delete" size={24} color="#FF4D4D" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F5F7FA" },

  title: { fontSize: 22, fontWeight: "bold", color: "#333", marginBottom: 10 },

  input: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderColor: "#ccc",
    backgroundColor: "#FFF",
    fontSize: 16,
  },

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

  divider: { height: 2, backgroundColor: "#ddd", marginVertical: 20 },

  activityCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },

  activityText: { flex: 1 },

  activityName: { fontSize: 18, fontWeight: "bold", color: "#333" },

  activityDesc: { fontSize: 14, color: "#666", marginTop: 5 },
});

export default AddActivityScreen;
