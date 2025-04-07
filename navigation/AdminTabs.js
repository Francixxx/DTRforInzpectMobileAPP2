import React, { useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AdminDashboard from "../screens/AdminDashboard";
import EmployeeList from "../screens/EmployeeList";
import AddEmployee from "../screens/AddEmployee";
import SettingsScreen from "../screens/SettingsScreen";
import AttendanceHistory from "../screens/AttendanceHistory"; // ✅ Import Attendance History
import Sidebar from "../screens/Sidebar";

const Tab = createBottomTabNavigator();

const AdminTabs = ({ navigation }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {/* Sidebar Component */}
      {isSidebarOpen && <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} navigation={navigation} />}

      {/* Main Tab Navigation */}
      <Tab.Navigator
        screenOptions={{
          headerRight: () => (
            <TouchableOpacity onPress={toggleSidebar} style={{ marginRight: 15 }}>
              <Ionicons name="menu" size={26} color="#333" />
            </TouchableOpacity>
          ),
          headerShown: true,
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={AdminDashboard}
          options={{
            tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Employees"
          component={EmployeeList}
          options={{
            tabBarIcon: ({ color, size }) => <Ionicons name="people" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Add Employee"
          component={AddEmployee}
          options={{
            tabBarIcon: ({ color, size }) => <Ionicons name="person-add" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="AttendanceHistory" // ✅ Add Attendance History tab
          component={AttendanceHistory}
          options={{
            tabBarIcon: ({ color, size }) => <Ionicons name="time" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Ionicons name="settings" color={color} size={size} />,
          }}
        />
      </Tab.Navigator>
    </>
  );
};

export default AdminTabs;
