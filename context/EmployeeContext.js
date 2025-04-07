import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const EmployeeContext = createContext();

export const EmployeeProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://10.100.1.113:5000/employees"); // Ensure your backend route is correct
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <EmployeeContext.Provider value={{ employees, fetchEmployees, setEmployees }}>
      {children}
    </EmployeeContext.Provider>
  );
};
