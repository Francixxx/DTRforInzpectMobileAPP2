import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ScrollView, TextInput } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import UserDashboard from "../screens/UserDashboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions, CameraType } from "expo-camera";
import PhotoPreviewSection from "../components/PhotoPreviewSection";
import axios from 'axios';
import { ActivityIndicator } from "react-native";
import OvertimeScreen from "../screens/OvertimeScreen"; 
import TollRequestScreen from "../screens/TollRequestScreen";
import LottieView from "lottie-react-native";






const Tab = createBottomTabNavigator();

const DTRScreen = ({ route }) => {
  const username = route?.params?.employee?.name || "User"; 
  const position = route?.params?.employee?.position || "Unknown Position"; 
  const [permission, requestPermission] = useCameraPermissions() || [null, null]; 
  const [facing, setFacing] = useState("back");
  const [photo, setPhoto] = useState(null);
  const [isTimedIn, setIsTimedIn] = useState(false);
  const cameraRef = useRef(null);
  const TELEGRAM_BOT_TOKEN = "7690092485:AAGpm9D3WFG_SYcUkfHJFWns97Bd0W8yXqc";
  const TELEGRAM_CHAT_ID = "7588078217";
  const [loading, setLoading] = useState(false);
  const [loadingScreen, setLoadingScreen] = useState(false);
  const [attachedPhoto, setAttachedPhoto] = useState(null);
  const [secondPhoto, setSecondPhoto] = useState(null); // Second required image for timeout
  const [isTakingSecondPhoto, setIsTakingSecondPhoto] = useState(false); // Track se
  const [location, setLocation] = useState(""); 


useEffect(() => {
    (async () => {
      if (!permission) {
        await requestPermission();
      }
    })();
  }, [permission]);



  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  

    
    if (!result.canceled) {
      setAttachedPhoto(result.assets[0].uri); // Store the attached photo
    }
  };
  
  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const sendToTelegram = async (photoUris, action) => {
    setLoadingScreen(true); // Show loading screen
  
    const timestamp = new Date().toLocaleString();
    const caption = `📸 *${action}*\n👤 *Name:* ${username}\n💼 *Department:* ${position}\n📅 *Date:* ${timestamp} \n📍*Location:* ${location || "Not provided"}`;
  
    // Determine the correct Telegram chat ID based on user position
    let chatId;
    if (position.toLowerCase().includes("direct")) {
      chatId = "-4630567321"; // Replace with actual Direct GC chat ID
    } else if (position.toLowerCase().includes("admin")) {
      chatId = "-4672436351"; // Replace with actual Admin GC chat ID
    } else {
      chatId = TELEGRAM_CHAT_ID; // Default chat
    }
  
    const formData = new FormData();
  
    formData.append("chat_id", chatId);
    formData.append("media", JSON.stringify(
      photoUris.map((uri, index) => ({
        type: "photo",
        media: `attach://photo${index}`,
        caption: index === 0 ? caption : "",
        parse_mode: "Markdown",
      }))
    ));
  
    photoUris.forEach((uri, index) => {
      formData.append(`photo${index}`, {
        uri: uri,
        type: "image/jpeg",
        name: `photo${index}.jpg`,
      });
    });
  
    try {
      await axios.post(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMediaGroup`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
  
      Alert.alert("Success", `${action} recorded and sent to Telegram!`);
      setPhoto(null);
      setSecondPhoto(null);
    } catch (error) {
      console.error("🚨 Error sending photos to Telegram:", error);
      Alert.alert("Error", "Failed to send photos to Telegram.");
    } finally {
      setLoadingScreen(false);
    }
  };
  
  
  

   const PhotoPreviewSection = ({ photo, handleRetakePhoto }) => (
    <View style={styles.previewContainer}>
      <Image source={{ uri: photo }} style={styles.previewImage} />
      <TouchableOpacity style={styles.retakeIcon} onPress={handleRetakePhoto}>
        <AntDesign name="retweet" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );


  const handleRetakePhoto = () => {
    setPhoto(null);
  };

const handleTimeIn = async () => {
    if (!photo) {
      Alert.alert("Error", "Please take a selfie first.");
      return;
    }
    if (!location) {
      Alert.alert("Error", "Please provide your location.");
      return;
    }
    
    setLoading(true); // Start loading

    try {
      const response = await axios.get(`http://10.100.1.113:5000/check-attendance`, {
        params: { id_number: route.params.employee.id_number },
      });
  
      if (response.data.alreadyTimedIn) {
        Alert.alert("Error", "You have already timed in today.");
        setLoading(false);
        return;
      }
  
      await axios.post("http://10.100.1.113:5000/time-in", {
        id_number: route.params.employee.id_number,
      });

      setIsTimedIn(true);
      
     
      await sendToTelegram([photo], "Time In");


     
    } catch (error) {
      console.error("Error during time-in:", error);
      Alert.alert("Error", "Failed to time in. Try again.");
    } finally {
      setLoading(false); 
    }
};


    if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView 
  source={require("../assets/loading.json")} 
  autoPlay 
  loop 
        style={{ width: 300, height: 300 }}
      />
      </View>
    );
  }
  const handleTimeOut = async () => {
    if (!photo) {
      Alert.alert("Error", "Please take a selfie first.");
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await axios.get(
        "http://10.100.1.113:5000/check-attendance",
        { params: { id_number: route.params.employee.id_number } }
      );
  
      if (response.data.alreadyTimedOut) {
        Alert.alert("Error", "You have already timed out today.");
        setLoading(false);
        return;
      }
  
      if (!response.data.alreadyTimedIn) {
        Alert.alert("Error", "You must Time In first before Time Out.");
        setLoading(false);
        return;
      }
  
      setIsTakingSecondPhoto(true);
      setLoading(false);
    } catch (error) {
      console.error("🚨 Error during Time Out:", error);
      Alert.alert("Error", "Failed to time out. Try again.");
      setLoading(false);
    }
  };
  
  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        const photoData = await cameraRef.current.takePictureAsync({
          quality: 1,
          base64: false,
          skipProcessing: true,
        });
  
        if (photoData.uri) {
          if (isTakingSecondPhoto) {
            setSecondPhoto(photoData.uri);
            setIsTakingSecondPhoto(false);
          } else {
            setPhoto(photoData.uri);
          }
        } else {
          Alert.alert("Error", "Photo capture failed.");
        }
      } catch (error) {
        console.error("Error capturing photo:", error);
        Alert.alert("Error", "Failed to capture photo.");
      }
    }
  };
  
  const finalizeTimeOut = async () => {
    if (!secondPhoto) {
      Alert.alert("Error", "Please take the second photo first.");
      return;
    }
  
    setLoading(true);
  
    try {
      await axios.post("http://10.100.1.113:5000/time-out", {
        id_number: route.params.employee.id_number,
      });
  
      await sendToTelegram([photo, secondPhoto], "Time Out");
  
      setIsTimedIn(false);
      setPhoto(null);
      setSecondPhoto(null);
    } catch (error) {
      console.error("🚨 Error during Time Out:", error);
      Alert.alert("Error", "Failed to time out. Try again.");
    } finally {
      setLoading(false);
    }
  };
  

  
  if (isTakingSecondPhoto) {
    return (
      
      <View style={styles.container}>
        <Text style={styles.greeting}>Snap your CSR form</Text>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.buttonContainer1}>
            <TouchableOpacity style={styles.cameraButton} onPress={handleCapture}>
              <AntDesign name="camera" size={30} color="white" />
              <Text style={styles.buttonText}>Capture</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.switchButton} onPress={toggleCameraFacing}>
              <AntDesign name="retweet" size={24} color="white" />
              <Text style={styles.buttonText}>Switch</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

if (secondPhoto) {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 20 }} stickyHeaderIndices={[0]}>
      <View style={{ backgroundColor: "#fff", padding: 20, elevation: 3, alignItems: "center" }}>
        <Text style={{ fontSize: 22, fontWeight: "bold", color: "#333" }}>Time out confirmation</Text>
      </View>

      <View style={{ padding: 20, alignItems: "center" }}>
        <View style={styles.previewContainer}>

          <Text style={styles.photoLabel}>Your Selfie</Text>
          <Image source={{ uri: photo }} style={styles.previewImage} />

          <Text style={styles.photoLabel}>CSR Image</Text>
          <View style={{ position: "relative" }}>
            <Image source={{ uri: secondPhoto }} style={styles.previewImage} />
            {/* Retake Icon for CSR Image */}
            <TouchableOpacity 
              style={styles.retakeIcon} 
              onPress={() => {
                setSecondPhoto(null);
                setIsTakingSecondPhoto(true); // Reopen Camera for second photo
              }}
            >
              <AntDesign name="retweet" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.confirmButton} onPress={finalizeTimeOut}>
         
          <Text style={styles.buttonText}>Confirm & Time Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

  
  
  


  if (photo) {
    return (
      
      <View style={styles.container}>
   <Text style={styles.title}>
   <AntDesign name="enviroment" size={40} color="#27548A" style={styles.locationIcon} />
  Where you at? 
  
</Text>
        <TextInput
          style={styles.locationInput}
          placeholder="Enter Location"
          value={location}
          onChangeText={setLocation}
        />
        <PhotoPreviewSection photo={photo} handleRetakePhoto={handleRetakePhoto} />
        <TouchableOpacity
          style={[styles.timeButton, styles.timeInButton, loading && styles.disabledButton]}
          onPress={handleTimeIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <AntDesign name="checkcircleo" size={24} color="white" />
              <Text style={styles.buttonText}>Time In</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timeButton, styles.timeOutButton, loading && styles.disabledButton]}
          onPress={handleTimeOut}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <AntDesign name="closecircleo" size={24} color="white" />
              <Text style={styles.buttonText}>Time Out</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
    );

  }
 
  return (
    <View style={styles.container}>
      <AntDesign name="smileo" size={30} color="gold" style={styles.smileIcon} />
      
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.switchButton} onPress={toggleCameraFacing}>
          <AntDesign name="retweet" size={24} color="white" />
          <Text style={styles.buttonText}>Switch</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.switchButton} onPress={handleCapture}>
          <AntDesign name="camera" size={24} color="white" />
          <Text style={styles.buttonText}>Capture</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
    
  );
}; 




const UserTabs = ({ route }) => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { height: 60 },
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tab.Screen
        name="DTR"
        component={DTRScreen}
        initialParams={route.params}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" color={color} size={size - 5} />
          ),
        }}
      />
      <Tab.Screen
        name="Overtime"
        component={OvertimeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="alarm" color={color} size={size - 5} />
          ),
        }}
      />
      <Tab.Screen
        name="Toll Request"
        component={TollRequestScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car" color={color} size={size - 5} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={UserDashboard}
        initialParams={route.params}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" color={color} size={size - 5} />
          ),
        }}
      />
    </Tab.Navigator>
     
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "gold",
    textAlign: "center",
  },
  previewContainer: {
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
    
  },
  photoLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#007bff",
  },
  previewImage: {
    width: 250,
    height: 250,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "gold",
    
  },
  cameraButton: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },

  confirmButton: {
    backgroundColor: "#dc3545",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    width: "70%",
    marginTop: "20",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginLeft: 10,
    justifyContent: "center",
  },
  buttonContainer1: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  switchButton:{
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },

  retakeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 20,
    padding: 5,
  },
  


  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  greeting: {
    position: "absolute",
    top: 20,
    left: 20,
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#343a40",
    marginBottom: 20,
    textAlign: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    borderRadius: 40,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
   
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  button: {
    padding: 15,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 50,
  
  },
  actionButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 5,
    width: "90%",
  
  },
  previewImage: {
    width: 300,
    height: 400,
    borderRadius: 20,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  
  previewContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  retakeButton: {
    backgroundColor: "#dc3545",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 5,
    width: "90%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  preview: {
    width: "10%",
    height: 20,
    borderRadius: 10,
    marginVertical: 10,
    resizeMode: "cover",
  },
  timeButton: {
    marginTop: 10,
    width: "80%",
    borderRadius: 25,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: "gray",
  },
  timeInButton: {
    backgroundColor: "#007bff",
  },
  timeOutButton: {
    backgroundColor: "#dc3545",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  smileIcon: {
    alignSelf: "center",
    marginBottom: 10,
  },

    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "white", 
    },
    loadingText: {
      marginTop: 10,
      color: "white",
      fontSize: 18,
      fontWeight: "bold",
    },
      locationInput: {
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 20,
        paddingHorizontal: 10,
        width: "80%",
        alignSelf: "center",
      },
      title: {
        fontSize: 24, 
        fontWeight: "bold",
        color: "#333",
        flexDirection: "row",  
        alignItems: "center",  
      },
      locationIcon: {
        marginLeft: 5,  
      },
});

export default UserTabs;