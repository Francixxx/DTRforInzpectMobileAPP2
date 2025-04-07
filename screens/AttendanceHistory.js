import React, { useEffect, useState } from "react";
import { View, Text, TextInput, ActivityIndicator, FlatList, StyleSheet } from "react-native";
import axios from "axios";

// Function to format date and time
const formatDateTime = (dateTime) => {
    if (!dateTime) return "Not Timed Out";

    const dateObj = new Date(dateTime);
    
    const formattedDate = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    }).format(dateObj);

    const formattedTime = new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).format(dateObj);

    return { date: formattedDate, time: formattedTime };
};

const AttendanceHistory = () => {
    const [attendance, setAttendance] = useState([]);
    const [filteredAttendance, setFilteredAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const response = await axios.get("http://10.100.1.113:5000/attendance-history");
                setAttendance(response.data);
                setFilteredAttendance(response.data); // Initialize filtered list
            } catch (error) {
                console.error("Error fetching attendance:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, []);

    // Function to handle search
    const handleSearch = (query) => {
        setSearchQuery(query);
        const filteredData = attendance.filter((item) =>
            item.employee_name.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredAttendance(filteredData);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Attendance History</Text>

            {/* Search Bar */}
            <TextInput
                style={styles.searchBar}
                placeholder="Search by Employee Name..."
                value={searchQuery}
                onChangeText={handleSearch}
            />

            {/* Table Header */}
            <View style={styles.headerRow}>
                <Text style={[styles.headerCell, { flex: 1.5 }]}>Employee Name</Text>
                <Text style={styles.headerCell}>Date</Text>
                <Text style={styles.headerCell}>Time In</Text>
                <Text style={styles.headerCell}>Time Out</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#007bff" />
            ) : (
                <FlatList
                    data={filteredAttendance}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => {
                        const timeIn = formatDateTime(item.time_in);
                        const timeOut = formatDateTime(item.time_out);

                        return (
                            <View style={[styles.row, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
                                <Text style={[styles.cell, { flex: 1.5 }]}>{item.employee_name}</Text>
                                <Text style={styles.cell}>{timeIn.date}</Text>
                                <Text style={styles.cell}>{timeIn.time}</Text>
                                <Text style={styles.cell}>{timeOut.time}</Text>
                            </View>
                        );
                    }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f8f9fa",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: "center",
        color: "#333",
    },
    searchBar: {
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 10,
        backgroundColor: "#fff",
    },
    headerRow: {
        flexDirection: "row",
        backgroundColor: "#007bff",
        paddingVertical: 10,
        borderRadius: 8,
        marginBottom: 5,
    },
    headerCell: {
        flex: 1,
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
    },
    row: {
        flexDirection: "row",
        padding: 12,
        borderRadius: 8,
        marginBottom: 5,
    },
    evenRow: {
        backgroundColor: "#e9ecef",
    },
    oddRow: {
        backgroundColor: "#ffffff",
    },
    cell: {
        flex: 1,
        fontSize: 15,
        textAlign: "center",
        color: "#333",
    },
});

export default AttendanceHistory;
