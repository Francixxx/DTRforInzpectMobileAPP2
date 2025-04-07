import React, { useState } from "react";
import axios from "axios";

const RegisterEmployee = () => {
    const [idNumber, setIdNumber] = useState("");
    const [name, setName] = useState("");
    const [department, setDepartment] = useState("");
    const [position, setPosition] = useState("Direct"); // Default to Direct

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post("http://10.100.1.113:5000/register-employee", {
                id_number: idNumber,
                name,
                department,
                position,
            });

            alert("Employee registered successfully!");
            setIdNumber("");
            setName("");
            setDepartment("");
            setPosition("Direct");
        } catch (error) {
            console.error("Error registering employee:", error);
            alert("Failed to register employee.");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>ID Number:</label>
            <input type="text" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} required />

            <label>Name:</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

            <label>Department:</label>
            <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} required />

            <label>Position:</label>
            <select value={position} onChange={(e) => setPosition(e.target.value)} required>
                <option value="Direct">Direct</option>
                <option value="Admin">Admin</option>
            </select>

            <button type="submit">Register Employee</button>
        </form>
    );
};

export default RegisterEmployee;
