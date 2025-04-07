import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

const UserDashboard = ({ route, navigation }) => {
  const { employee } = route.params || {}; // Get employee details
  const [user, setUser] = useState(employee || {});
  const [coverPhoto, setCoverPhoto] = useState(require("../assets/defcover.png")); 
  const [profilePhoto, setProfilePhoto] = useState(require("../assets/Logo.png")); 

  useEffect(() => {
    if (!employee) {
      Alert.alert("Error", "User data not available.");
      navigation.navigate("LoginScreen");
    }

    // Load saved images for the specific user
    loadUserImages();
  }, []);

  // Load stored images based on user ID
  const loadUserImages = async () => {
    try {
      const userId = user.id_number;
      if (!userId) return;

      const savedProfilePhoto = await AsyncStorage.getItem(`profilePhoto_${userId}`);
      const savedCoverPhoto = await AsyncStorage.getItem(`coverPhoto_${userId}`);

      if (savedProfilePhoto) setProfilePhoto({ uri: savedProfilePhoto });
      if (savedCoverPhoto) setCoverPhoto({ uri: savedCoverPhoto });
    } catch (error) {
      console.error("Failed to load user images:", error);
    }
  };

  // Function to pick an image and save it for the specific user
  const pickImage = async (setImage, storageKey) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setImage({ uri: imageUri });

      // Save the selected image for the specific user
      await AsyncStorage.setItem(`${storageKey}_${user.id_number}`, imageUri);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
      {/* Cover Photo Section */}
      <View style={styles.coverContainer}>
        <Image source={coverPhoto} style={styles.coverPhoto} />
        <TouchableOpacity style={styles.coverCameraIcon} onPress={() => pickImage(setCoverPhoto, "coverPhoto")}>
          <Ionicons name="camera-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={() => pickImage(setProfilePhoto, "profilePhoto")} style={styles.profileImageContainer}>
          <Image source={profilePhoto} style={styles.profileImage} />
          <View style={styles.profileCameraIcon}>
            <Ionicons name="camera-outline" size={18} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.position}>Position: {user.status}</Text>
      </View>

      {/* User Details */}
      <View style={styles.infoContainer}>
        <View style={styles.infoBox}>
          <Ionicons name="id-card-outline" size={22} color="#007bff" />
          <Text style={styles.infoText}>ID: {user.id_number}</Text>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="mail-outline" size={22} color="#007bff" />
          <Text style={styles.infoText}>Email: {user.email}</Text>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="briefcase-outline" size={22} color="#007bff" />
          <Text style={styles.infoText}>Department: {user.position}</Text>
        </View>
      </View>

   
      <TouchableOpacity style={styles.logoutButton} onPress={async () => {
        await AsyncStorage.removeItem("userToken");
        navigation.replace("LoginScreen");
      }}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  coverContainer: {
    width: "100%",
    height: 180,
    backgroundColor: "#ccc",
    position: "relative",
  },
  coverPhoto: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  coverCameraIcon: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 8,
    borderRadius: 20,
  },
  profileContainer: {
    alignItems: "center",
    marginTop: -50,
  },
  profileImageContainer: {
    position: "relative",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#fff",
    overflow: "hidden",
    backgroundColor: "#f4f4f4",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  profileCameraIcon: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 5,
    borderRadius: 15,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  position: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
  },
  infoContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 2,
  },
  infoText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
    width: "90%",
    alignSelf: "center",
    marginTop: 100,
  },
  buttonText: {
    
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default UserDashboard;
