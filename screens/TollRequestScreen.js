import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TELEGRAM_BOT_TOKEN = "7690092485:AAGpm9D3WFG_SYcUkfHJFWns97Bd0W8yXqc";
const DEFAULT_CHAT_ID = "-4630567321"; // Default to Direct GC if position not found

const TollRequestScreen = () => {
  const [employeeName, setEmployeeName] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [exactAmount, setExactAmount] = useState("");
  const [destination, setDestination] = useState("");
  const [wayTollGateEntry, setWayTollGateEntry] = useState("");
  const [autoSweepEasyTrip, setAutoSweepEasyTrip] = useState("");
  const [carType, setCarType] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [otherProject, setOtherProject] = useState("");
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const storedId = await AsyncStorage.getItem("employeeId");
  
        if (!storedId) {
          Alert.alert("Error", "Employee ID not found. Please log in again.");
          return;
        }
  
        const response = await axios.get(
          `http://10.100.1.113:5000/get-user?id_number=${storedId}`
        );
  
        if (response.data.error) {
          Alert.alert("Error", "Employee not found.");
          return;
        }
  
        setEmployeeName(response.data.name);
      } catch (error) {
        console.error(
          "Fetch Error:",
          error.response ? error.response.data : error.message
        );
        Alert.alert("Error", "Failed to fetch employee details.");
      }
    };
  
    const fetchProjects = async () => {
      try {
        const response = await axios.get("http://10.100.1.113:5000/get-projects");
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        Alert.alert("Error", "Failed to fetch projects.");
      }
    };
  
    fetchEmployeeData();
    fetchProjects();
  }, []);

  const sendToTelegram = async () => {
    console.log("Starting sendToTelegram for Toll Request...");

    if (
      !employeeName ||
      !date ||
      !exactAmount ||
      !selectedProject ||
      !destination ||
      !wayTollGateEntry ||
      !autoSweepEasyTrip ||
      !carType
    ) {
      Alert.alert("Error", "Please fill in all required fields.");
      console.log("Missing fields:", {
        employeeName,
        date,
        exactAmount,
        selectedProject,
        destination,
        wayTollGateEntry,
        autoSweepEasyTrip,
        carType,
      });
      return;
    }

    setLoading(true); // Show loading indicator

    try {
      console.log(`Fetching user position for: ${employeeName}`);

      const response = await axios.get(
        `http://10.100.1.113:5000/get-user-position?name=${employeeName}`
      );
      console.log("User Position API Response:", response.data);

      const userPosition = response.data.position;
      let chatId;
      let department;

      if (userPosition.toLowerCase().includes("direct")) {
        chatId = "-4630567321";
        department = "Direct Department";
      } else if (userPosition.toLowerCase().includes("admin")) {
        chatId = "-4672436351";
        department = "Admin Department";
      } else {
        chatId = DEFAULT_CHAT_ID;
        department = "Unknown Department";
      }

      console.log(`Using chat ID: ${chatId}`);

      const finalProject = selectedProject === "Other" ? otherProject : selectedProject;

      const message = `
📌 *Toll Request for ${employeeName}* 🚗

📅 *Date of Service:* ${date.toDateString()}
👤 *Employee Name:* ${employeeName}
💰 *Exact Amount:* ${exactAmount}
🏗 *Project Name:* ${finalProject}
📍 *Destination:* ${destination}
🛣 *Way/Toll Gate Entry:* ${wayTollGateEntry}
🚦 *AutoSweep/EasyTrip:* ${autoSweepEasyTrip}
🚘 *Car Type:* ${carType}
🏢 *Department:* ${department}
📩 *Sent to:* ${department} GC`;

      console.log("Sending message to Telegram...");
      console.log("Message Content:", message);

      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

      const responseTelegram = await axios.post(url, {
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      });

      console.log("Message sent successfully!", responseTelegram.data);
      Alert.alert("Success", "Toll request sent to Telegram!");
      
      // Reset form after successful submission
      setExactAmount("");
      setDestination("");
      setWayTollGateEntry("");
      setAutoSweepEasyTrip("");
      setCarType("");
      setSelectedProject("");
      setOtherProject("");
    } catch (error) {
      console.error(
        "🚨 Error:",
        error.response ? error.response.data : error.message
      );
      Alert.alert("Error", "Failed to process the request.");
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#f4f4f4" }}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={{ backgroundColor: "#fff", padding: 20, elevation: 3, alignItems: "center" }}>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: "#333" }}>Request for RFID Toll</Text>
        </View>

        <View style={{ padding: 20 }}>
          <Text style={styles.label}>Employee Name:</Text>
          <TextInput 
            style={styles.input} 
            value={employeeName} 
            editable={false} 
          />

          <Text style={styles.label}>Date of Service:</Text>
          <TouchableOpacity 
            onPress={() => setShowDatePicker(true)} 
            style={styles.input}
          >
            <Text>{date.toDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker 
              value={date} 
              mode="date" 
              display="default" 
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }} 
            />
          )}

          <Text style={styles.label}>Exact Amount:</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Enter Amount" 
            value={exactAmount} 
            onChangeText={setExactAmount} 
            keyboardType="numeric" 
          />

          <Text style={styles.label}>Select a Project:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedProject}
              onValueChange={(value) => setSelectedProject(value)}
              style={styles.picker}
            >
              <Picker.Item label="--Select a Project--" value="" />
              {projects.map((project) => (
                <Picker.Item
                  key={project.id}
                  label={project.name}
                  value={project.name}
                />
              ))}
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>
          {selectedProject === "Other" && (
            <TextInput
              style={styles.input}
              placeholder="Specify Project"
              value={otherProject}
              onChangeText={setOtherProject}
            />
          )}

          <Text style={styles.label}>Destination:</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Enter Destination" 
            value={destination} 
            onChangeText={setDestination} 
          />

          <Text style={styles.label}>Way/Toll Gate Entry:</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Enter Way/Toll Gate Entry" 
            value={wayTollGateEntry} 
            onChangeText={setWayTollGateEntry} 
          />

          <Text style={styles.label}>AutoSweep/EasyTrip:</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Enter AutoSweep/EasyTrip" 
            value={autoSweepEasyTrip} 
            onChangeText={setAutoSweepEasyTrip} 
          />

          <Text style={styles.label}>Type of Car:</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Enter Car Type" 
            value={carType} 
            onChangeText={setCarType} 
          />

          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={sendToTelegram} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Request</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = {
  label: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#555",
  },
  input: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 30,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
    width: '100%',
  },
  submitButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
};

export default TollRequestScreen;