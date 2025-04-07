import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Sidebar = ({ isOpen, toggleSidebar, navigation }) => {
  const slideAnim = useRef(new Animated.Value(-220)).current; // Sidebar starts off-screen

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? 0 : -220, // Slide in when open, slide out when closed
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  return (
    <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
      {/* Close Button */}
      <TouchableOpacity onPress={toggleSidebar} style={styles.closeIcon}>
        <Ionicons name="close" size={26} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.logoText}>Inzpect DTR</Text>

      {/* Sidebar Navigation */}
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("AddProject")}>
        <Ionicons name="business" size={22} color="#fff" />
        <Text style={styles.menuText}>Add Project</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("AddActivity")}>
        <Ionicons name="clipboard" size={22} color="#fff" />
        <Text style={styles.menuText}>Add Activity</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 220,
    height: "100%",
    backgroundColor: "#1E1E1E",
    paddingTop: 50,
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  closeIcon: {
    position: "absolute",
    top: 15,
    right: 15,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  menuText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
  },
  logoText: {
    color: "#fff",
    paddingBottom: 30,
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default Sidebar;
