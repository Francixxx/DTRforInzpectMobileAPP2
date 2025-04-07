import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import axios from "axios";
import { EmployeeContext } from "../context/EmployeeContext";

const AdminDashboard = () => {
  const { employees, fetchEmployees } = useContext(EmployeeContext);
  const [totalIn, setTotalIn] = useState(0);
  const [totalOut, setTotalOut] = useState(0);

  useEffect(() => {
    fetchEmployees();
    fetchAttendanceCount();
  }, []);

  const fetchAttendanceCount = async () => {
    try {
      const response = await axios.get("http://10.100.1.113:5000/attendance-count"); 
      setTotalIn(response.data.totalIn);
      setTotalOut(response.data.totalOut);
    } catch (error) {
      console.error("Error fetching attendance count:", error);
    }
  };

  const employeeCount = employees.length;
  const totalInOut = totalIn + totalOut;
  const totalRequests = employees.filter(emp => emp.requestedToll).length;
  const overtimeRequests = employees.filter(emp => emp.requestedOvertime).length;

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        <View style={styles.box}>
          <Text style={styles.boxText}>Total Employees</Text>
          <Text style={styles.count}>{employeeCount}</Text>
        </View>
        <View style={styles.box}>
          <Text style={styles.boxText}>Total In</Text>
          <Text style={styles.count}>{totalIn}</Text>
        </View>
        <View style={styles.box}>
          <Text style={styles.boxText}>Total Out</Text>
          <Text style={styles.count}>{totalOut}</Text>
        </View>
        <View style={styles.box}>
          <Text style={styles.boxText}>Total In & Out</Text>
          <Text style={styles.countHighlighted}>{totalInOut}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: "flex-start", backgroundColor: "#ffffff" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  box: {
    backgroundColor: "#f8f9fa",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    alignItems: "center",
    width: "48%",
    marginBottom: 15,
  },
  boxHighlighted: {
    backgroundColor: "#d1e7fd",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
  },
  boxText: { fontSize: 18, fontWeight: "bold", color: "#495057" },
  count: { fontSize: 26, fontWeight: "700", color: "#007bff", marginTop: 10 },
  countHighlighted: { fontSize: 28, fontWeight: "bold", color: "#0056b3", marginTop: 10 },
});

export default AdminDashboard;
