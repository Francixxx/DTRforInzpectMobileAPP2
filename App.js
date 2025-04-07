import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./screens/LoginScreen";
import AdminLoginScreen from "./screens/AdminLoginScreen"; 
import AdminTabs from "./navigation/AdminTabs";
import UserTabs from "./navigation/UserTabs";
import { EmployeeProvider } from "./context/EmployeeContext";
import AddProject from "./screens/AddProject";
import AddActivity from "./screens/AddActivity";
import AddCar from "./screens/AddCar";


const Stack = createStackNavigator();

export default function App() {
  
  return (
    <EmployeeProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="LoginScreen" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="AdminLoginScreen" component={AdminLoginScreen} /> 
          <Stack.Screen name="AdminDashboard" component={AdminTabs} />
          <Stack.Screen name="UserDashboard" component={UserTabs} />
          <Stack.Screen name="AdminTabs" component={AdminTabs} />
          <Stack.Screen name="AddProject" component={AddProject} />
          <Stack.Screen name="AddActivity" component={AddActivity} />
          <Stack.Screen name="AddCar" component={AddCar} />
          </Stack.Navigator>
      </NavigationContainer>
    </EmployeeProvider>
  );
}
