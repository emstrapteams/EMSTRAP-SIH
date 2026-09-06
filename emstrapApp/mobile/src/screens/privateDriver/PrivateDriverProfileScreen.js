import React, { useEffect, useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import PrivateDriverHeader from "../../components/privateDriver/PrivateDriverHeader";

import { updateProfile } from "../../services/privateDriverService";

export default function PrivateDriverProfileScreen() {

    const [loading, setLoading] =
        useState(false);

    const [driver, setDriver] =
        useState(null);

    const [form, setForm] =
        useState({

            name: "",

            email: "",

            mobile: "",

            vehicleNumber: "",

            city: "",

            address: "",

        });

    useEffect(() => {

        loadProfile();

    }, []);

    async function loadProfile() {

        const data =
            await AsyncStorage.getItem("user");

        if (!data) return;

        const user =
            JSON.parse(data);

        setDriver(user);

        setForm({

            name: user.name || "",

            email: user.email || "",

            mobile: user.mobile || "",

            vehicleNumber:
                user.vehicleNumber || "",

            city: user.city || "",

            address: user.address || "",

        });

    }

    async function handleSave() {

        try {

            setLoading(true);

            const updated =
                await updateProfile(form);

            await AsyncStorage.setItem(

                "user",

                JSON.stringify(updated)

            );

            setDriver(updated);

            Alert.alert(

                "Success",

                "Profile updated successfully."

            );

        } catch (err) {

            Alert.alert(

                "Error",

                err?.response?.data?.message ||
                "Unable to update profile."

            );

        } finally {

            setLoading(false);

        }

    }

    function updateField(key, value) {

        setForm(prev => ({

            ...prev,

            [key]: value,

        }));

    }

    const initial =
        driver?.name?.charAt(0)?.toUpperCase() || "P";

    return (

        <SafeAreaView style={styles.container}>

            <PrivateDriverHeader />

            <ScrollView
                showsVerticalScrollIndicator={false}
            >

                <View style={styles.card}>

                    <View style={styles.avatar}>

                        <Text style={styles.avatarText}>
                            {initial}
                        </Text>

                    </View>

                    <Text style={styles.title}>
                        Edit Profile
                    </Text>

                    <Input
                        label="Full Name"
                        value={form.name}
                        onChangeText={v =>
                            updateField(
                                "name",
                                v
                            )
                        }
                    />

                    <Input
                        label="Email"
                        value={form.email}
                        editable={false}
                    />

                    <Input
                        label="Mobile Number"
                        value={form.mobile}
                        onChangeText={v =>
                            updateField(
                                "mobile",
                                v
                            )
                        }
                    />

                    <Input
                        label="Vehicle Number"
                        value={
                            form.vehicleNumber
                        }
                        onChangeText={v =>
                            updateField(
                                "vehicleNumber",
                                v
                            )
                        }
                    />

                    <Input
                        label="City"
                        value={form.city}
                        onChangeText={v =>
                            updateField(
                                "city",
                                v
                            )
                        }
                    />

                    <Input
                        label="Address"
                        value={form.address}
                        multiline
                        onChangeText={v =>
                            updateField(
                                "address",
                                v
                            )
                        }
                    />

                    <View
                        style={styles.buttons}
                    >

                        <TouchableOpacity
                            style={styles.cancel}
                            onPress={loadProfile}
                        >

                            <Text
                                style={
                                    styles.cancelText
                                }
                            >
                                Cancel
                            </Text>

                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.save}
                            disabled={loading}
                            onPress={handleSave}
                        >

                            <Text
                                style={
                                    styles.saveText
                                }
                            >
                                {loading
                                    ? "Saving..."
                                    : "Save Changes"}
                            </Text>

                        </TouchableOpacity>

                    </View>

                </View>

            </ScrollView>

        </SafeAreaView>

    );

}

function Input({

    label,

    multiline,

    ...props

}) {

    return (

        <>

            <Text style={styles.label}>
                {label}
            </Text>

            <TextInput

                {...props}

                multiline={multiline}

                style={[

                    styles.input,

                    multiline && {

                        height: 110,

                        textAlignVertical: "top",

                    },

                ]}

            />

        </>

    );

}

const styles = StyleSheet.create({

    container: {

        flex: 1,

        backgroundColor: "#F5F7FB",

    },

    card: {

        backgroundColor: "#FFFFFF",

        margin: 20,

        borderRadius: 22,

        padding: 24,

        elevation: 5,

    },

    avatar: {

        width: 90,

        height: 90,

        borderRadius: 45,

        backgroundColor: "#DC2626",

        alignSelf: "center",

        justifyContent: "center",

        alignItems: "center",

        marginBottom: 18,

    },

    avatarText: {

        color: "#FFFFFF",

        fontSize: 34,

        fontWeight: "700",

    },

    title: {

        textAlign: "center",

        fontSize: 30,

        fontWeight: "700",

        marginBottom: 30,

    },

    label: {

        fontWeight: "600",

        marginBottom: 8,

        marginTop: 14,

        color: "#374151",

    },

    input: {

        borderWidth: 1,

        borderColor: "#D1D5DB",

        borderRadius: 14,

        paddingHorizontal: 16,

        height: 54,

        fontSize: 16,

        backgroundColor: "#FFF",

    },

    buttons: {

        flexDirection: "row",

        justifyContent: "space-between",

        marginTop: 35,

    },

    cancel: {

        flex: 1,

        borderWidth: 1,

        borderColor: "#D1D5DB",

        marginRight: 10,

        height: 54,

        borderRadius: 14,

        justifyContent: "center",

        alignItems: "center",

    },

    cancelText: {

        fontWeight: "700",

        color: "#374151",

        fontSize: 16,

    },

    save: {

        flex: 1,

        marginLeft: 10,

        backgroundColor: "#DC2626",

        height: 54,

        borderRadius: 14,

        justifyContent: "center",

        alignItems: "center",

    },

    saveText: {

        color: "#FFFFFF",

        fontWeight: "700",

        fontSize: 16,

    },

});