import React, { useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AdminDashboard from "../screens/AdminDashboard";
import EmployeeList from "../screens/EmployeeList";
import AddEmployee from "../screens/AddEmployee";
import AddProject from "../screens/AddProject";
import AddActivity from "../screens/AddActivity";
import AddCar from "../screens/AddCar";
import SettingsScreen from "../screens/SettingsScreen";
import Sidebar from "../screens/Sidebar";
import AttendanceHistory from "../screens/AttendanceHistory";

const Stack = createStackNavigator();

const AdminStack = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {isSidebarOpen && <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />}

      <Stack.Navigator>
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboard}
          options={({ navigation }) => ({
            headerRight: () => (
              <TouchableOpacity onPress={toggleSidebar} style={{ marginRight: 15 }}>
                <Ionicons name="menu" size={26} color="#333" />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen name="EmployeeList" component={EmployeeList} />
        <Stack.Screen name="AddEmployee" component={AddEmployee} />
        <Stack.Screen name="AddProject" component={AddProject} />
        <Stack.Screen name="AddActivity" component={AddActivity} />
        <Stack.Screen name="AddCar" component={AddCar} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="AttendanceHistory" component={AttendanceHistory} />
      </Stack.Navigator>
    </>
  );
};

export default AdminStack;
