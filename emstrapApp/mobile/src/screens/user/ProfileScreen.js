import { useEffect, useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StyleSheet,
} from "react-native";

import {
    Ionicons,
    MaterialIcons,
    Feather,
} from "@expo/vector-icons";

import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function ProfileScreen() {

    const { logoutUser, loginUser } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);

    const [profile, setProfile] = useState({
        name: "",
        email: "",
        mobile: "",
        city: "",
        address: "",
        role: "",
    });

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {

        try {

            const res = await API.get("/auth/me");

            setProfile({
                name: res.data.name || "",
                email: res.data.email || "",
                mobile: res.data.mobile || "",
                city: res.data.city || "",
                address: res.data.address || "",
                role: res.data.role || "User",
            });

        } catch (err) {

            Alert.alert(
                "Error",
                "Failed to load profile"
            );

        } finally {

            setLoading(false);

        }

    }

    async function saveProfile() {

        try {

            setSaving(true);

            const res = await API.put(
                "/auth/profile",
                profile
            );

            loginUser(res.data.user);

            Alert.alert(
                "Success",
                "Profile updated"
            );

            setEditing(false);

        } catch (err) {

            Alert.alert(
                "Error",
                err?.response?.data?.message ||
                "Failed to update profile"
            );

        } finally {

            setSaving(false);

        }

    }

    if (loading) {

        return (
            <SafeAreaView style={styles.loader}>
                <ActivityIndicator
                    size="large"
                    color="#dc2626"
                />
            </SafeAreaView>
        );

    }

    return (

        <SafeAreaView style={styles.container}>

            <ScrollView
                showsVerticalScrollIndicator={false}
            >

                <View style={styles.header}>

                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {profile.name.charAt(0).toUpperCase()}
                        </Text>
                    </View>

                    <Text style={styles.name}>
                        {profile.name}
                    </Text>

                    <Text style={styles.role}>
                        {profile.role}
                    </Text>

                </View>

                <View style={styles.card}>

                    <ProfileField
                        icon="person-outline"
                        label="Full Name"
                        editable={editing}
                        value={profile.name}
                        onChange={(text) =>
                            setProfile({
                                ...profile,
                                name: text
                            })
                        }
                    />

                    <ProfileField
                        icon="mail-outline"
                        label="Email"
                        editable={editing}
                        value={profile.email}
                        onChange={(text) =>
                            setProfile({
                                ...profile,
                                email: text
                            })
                        }
                    />

                    <ProfileField
                        icon="call-outline"
                        label="Mobile"
                        editable={editing}
                        value={profile.mobile}
                        onChange={(text) =>
                            setProfile({
                                ...profile,
                                mobile: text
                            })
                        }
                    />

                    <ProfileField
                        icon="location-outline"
                        label="City"
                        editable={editing}
                        value={profile.city}
                        onChange={(text) =>
                            setProfile({
                                ...profile,
                                city: text
                            })
                        }
                    />

                    <ProfileField
                        icon="home-outline"
                        label="Address"
                        editable={editing}
                        multiline
                        value={profile.address}
                        onChange={(text) =>
                            setProfile({
                                ...profile,
                                address: text
                            })
                        }
                    />

                </View>

                {!editing ? (

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() =>
                            setEditing(true)
                        }
                    >
                        <Feather
                            name="edit"
                            color="#fff"
                            size={20}
                        />
                        <Text style={styles.primaryText}>
                            Edit Profile
                        </Text>
                    </TouchableOpacity>

                ) : (

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={saveProfile}
                    >

                        {saving
                            ? <ActivityIndicator color="#fff" />
                            : <>
                                <Ionicons
                                    name="checkmark"
                                    size={22}
                                    color="#fff"
                                />
                                <Text style={styles.primaryText}>
                                    Save Changes
                                </Text>
                            </>
                        }

                    </TouchableOpacity>

                )}

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={logoutUser}
                >
                    <MaterialIcons
                        name="logout"
                        size={22}
                        color="#dc2626"
                    />
                    <Text style={styles.logoutText}>
                        Logout
                    </Text>
                </TouchableOpacity>

            </ScrollView>

        </SafeAreaView>

    );

}

function ProfileField({
    icon,
    label,
    value,
    editable,
    onChange,
    multiline
}) {

    return (

        <View style={{ marginBottom: 20 }}>

            <Text style={styles.label}>
                {label}
            </Text>

            <View style={styles.inputBox}>

                <Ionicons
                    name={icon}
                    size={20}
                    color="#dc2626"
                />

                <TextInput
                    style={styles.input}
                    value={value}
                    editable={editable}
                    multiline={multiline}
                    onChangeText={onChange}
                />

            </View>

        </View>

    );

}
const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#f5f6fa",
    },

    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },

    header: {
        alignItems: "center",
        paddingTop: 35,
        paddingBottom: 30,
        backgroundColor: "#fff",
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 6,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
    },

    avatar: {
        width: 95,
        height: 95,
        borderRadius: 48,
        backgroundColor: "#dc2626",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
    },

    avatarText: {
        color: "#fff",
        fontSize: 38,
        fontWeight: "700",
    },

    name: {
        fontSize: 24,
        fontWeight: "700",
        color: "#111",
    },

    role: {
        marginTop: 4,
        color: "#666",
        textTransform: "capitalize",
        fontSize: 15,
    },

    card: {
        backgroundColor: "#fff",
        margin: 18,
        marginTop: 25,
        borderRadius: 18,
        padding: 20,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },

    label: {
        fontSize: 13,
        color: "#888",
        marginBottom: 8,
        fontWeight: "600",
    },

    inputBox: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ececec",
        borderRadius: 14,
        paddingHorizontal: 15,
        backgroundColor: "#fafafa",
    },

    input: {
        flex: 1,
        paddingVertical: 15,
        paddingLeft: 12,
        fontSize: 16,
        color: "#111",
    },

    primaryButton: {
        backgroundColor: "#dc2626",
        marginHorizontal: 18,
        marginTop: 10,
        borderRadius: 15,
        height: 56,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
    },

    primaryText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 17,
        marginLeft: 8,
    },

    logoutButton: {
        marginHorizontal: 18,
        marginTop: 15,
        marginBottom: 40,
        borderWidth: 1,
        borderColor: "#dc2626",
        borderRadius: 15,
        height: 56,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: "#fff",
    },

    logoutText: {
        color: "#dc2626",
        fontWeight: "700",
        fontSize: 17,
        marginLeft: 8,
    },

});