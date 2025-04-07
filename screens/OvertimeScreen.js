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

const OvertimeRequestScreen = () => {
  const [employeeName, setEmployeeName] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [effectiveHours, setEffectiveHours] = useState("");
  const [cpoNumber, setCpoNumber] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [otherProject, setOtherProject] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("");
  const [otherActivity, setOtherActivity] = useState("");
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]); // Projects list from database

  const [showTimeInPicker, setShowTimeInPicker] = useState(false);
  const [showTimeOutPicker, setShowTimeOutPicker] = useState(false);

  const [activities, setActivities] = useState([]); // Store activities from DB



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
        console.log("Fetching projects from API...");
        const response = await axios.get("http://10.100.1.113:5000/get-projects");
        console.log("Projects response:", response.data);
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        Alert.alert("Error", "Failed to fetch projects.");
      }
    };
  
    const fetchActivities = async () => {
      try {
        console.log("Fetching activities from API...");
        const response = await axios.get("http://10.100.1.113:5000/activities");
        console.log("Activities response:", response.data);
        setActivities(response.data);
      } catch (error) {
        console.error("Error fetching activities:", error);
        Alert.alert("Error", "Failed to fetch activities.");
      }
    };
  
    
    fetchEmployeeData();
    fetchProjects();
    fetchActivities();
  }, []);
  
  const handleTimeChange = (event, selectedTime, type) => {
    if (selectedTime) {
      const formattedTime = selectedTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      if (type === "timeIn") {
        setTimeIn(formattedTime);
        setShowTimeInPicker(false);
      } else {
        setTimeOut(formattedTime);
        setShowTimeOutPicker(false);
      }
    } else {
      if (type === "timeIn") setShowTimeInPicker(false);
      else setShowTimeOutPicker(false);
    }
  };

  const sendToTelegram = async () => {
    console.log("Starting sendToTelegram...");

    if (
      !employeeName ||
      !date ||
      !timeIn ||
      !timeOut ||
      !effectiveHours ||
      !cpoNumber ||
      !selectedProject ||
      !selectedActivity
    ) {
      Alert.alert("Error", "Please fill in all fields.");
      console.log("Missing fields:", {
        employeeName,
        date,
        timeIn,
        timeOut,
        effectiveHours,
        cpoNumber,
        selectedProject,
        selectedActivity,
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

      if (userPosition.toLowerCase().includes("direct")) {
        chatId = "-4630567321";
      } else if (userPosition.toLowerCase().includes("admin")) {
        chatId = "-4672436351";
      } else {
        chatId = TELEGRAM_CHAT_ID;
      }

      console.log(`Using chat ID: ${chatId}`);

      const finalProject =
        selectedProject === "Other" ? otherProject : selectedProject;
      const finalActivity =
        selectedActivity === "Other" ? otherActivity : selectedActivity;

      const message = `
  📌 *Overtime Request*
  
  👤 *Employee Name:* ${employeeName}
  📅 *Date of Overtime:* ${date.toDateString()}
  ⏰ *Time In:* ${timeIn}
  ⏳ *Time Out:* ${timeOut}
  ⏱ *Effective Hours:* ${effectiveHours}
  🏗 *Project:* ${finalProject}
  🔧 *Activity:* ${finalActivity}
  📄 *CPO No./Account:* ${cpoNumber}
      `;

      console.log("Sending message to Telegram...");
      console.log("Message Content:", message);

      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

      const responseTelegram = await axios.post(url, {
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      });

      console.log("Message sent successfully!", responseTelegram.data);
      Alert.alert("Success", "Overtime request sent to Telegram!");
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
        <View
          style={{
            backgroundColor: "#fff",
            padding: 20,
            elevation: 3,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "bold", color: "#333" }}>
            Overtime Request
          </Text>
        </View>

        <View style={{ padding: 20 }}>
          <Text style={styles.label}>Employee Name:</Text>
          <TextInput
            style={styles.input}
            value={employeeName}
            editable={false}
          />

          <Text style={styles.label}>Date of Overtime:</Text>
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


      <Text style={styles.label}>Time In:</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowTimeInPicker(true)}
      >
        <Text>{timeIn || "Select Time"}</Text>
      </TouchableOpacity>
      {showTimeInPicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(event, selectedTime) => handleTimeChange(event, selectedTime, "timeIn")}
        />
      )}

      {/* Time Out Picker */}
      <Text style={styles.label}>Time Out:</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowTimeOutPicker(true)}
      >
        <Text>{timeOut || "Select Time"}</Text>
      </TouchableOpacity>
      {showTimeOutPicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(event, selectedTime) => handleTimeChange(event, selectedTime, "timeOut")}
        />
      )}


          <Text style={styles.label}>No. of Effective Hours:</Text>
          <TextInput
            style={styles.input}
            placeholder="Effective Hours"
            keyboardType="numeric"
            value={effectiveHours}
            onChangeText={setEffectiveHours}
          />

          <Text style={styles.label}>CPO No./Account:</Text>
          <TextInput
            style={styles.input}
            placeholder="CPO No./Account"
            value={cpoNumber}
            onChangeText={setCpoNumber}
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

<Text style={styles.label}>Select an Activity:</Text>
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={selectedActivity}
        onValueChange={(value) => setSelectedActivity(value)}
        style={styles.picker}
      >
        <Picker.Item label="--Select an Activity--" value="" />
        {activities.map((activity) => (
          <Picker.Item key={activity.id} label={activity.name} value={activity.name} />
        ))}
        <Picker.Item label="Other" value="Other" />
      </Picker>
    </View>

    {selectedActivity === "Other" && (
      <TextInput
        style={styles.input}
        placeholder="Specify Activity"
        value={otherActivity}
        onChangeText={setOtherActivity}
      
            />
          )}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={sendToTelegram}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                Submit Overtime Request
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = {
  label: { fontSize: 15, fontWeight: "bold", marginBottom: 5, color: "#555" },
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
  submitButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
  },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
};

export default OvertimeRequestScreen;
