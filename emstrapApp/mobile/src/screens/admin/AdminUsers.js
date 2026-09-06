import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    StyleSheet,
} from "react-native";

import AdminLayout from "../../components/admin/AdminLayout";
import UserCard from "../../components/admin/UserCard";
import { getUsers } from "../../services/userApi";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        try {
            const res = await getUsers();

            if (res.success) {
                const onlyUsers = (res.users || []).filter(
                    (account) => account.role === "user"
                );

                setUsers(onlyUsers);
            }
        } catch (err) {
            console.log(
                "LOAD USERS ERROR:",
                err?.response?.data || err.message
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <AdminLayout title="User Management">
            {loading ? (
                <ActivityIndicator
                    size="large"
                    style={{ marginTop: 40 }}
                />
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <UserCard user={item} />
                    )}
                    contentContainerStyle={styles.list}
                />
            )}
        </AdminLayout>
    );
}

const styles = StyleSheet.create({
    list: {
        padding: 16,
    },
});