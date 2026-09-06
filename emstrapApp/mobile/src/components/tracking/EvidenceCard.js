import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { uploadEvidence } from "../../services/api";
export default function EvidenceCard({
    emergencyId,
    evidence = [],
    onUploaded,
}) {
    const uploadSelectedImage = async (image) => {

        try {

            await uploadEvidence(
                emergencyId,
                `data:image/jpeg;base64,${image.base64}`
            );

            Alert.alert(
                "Success",
                "Evidence uploaded successfully."
            );

            onUploaded?.();

        } catch (err) {

            console.log(err);

            Alert.alert(
                "Upload Failed",
                "Please try again."
            );

        }

    };
    const openCamera = async () => {

        const permission =
            await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {

            Alert.alert(
                "Permission Required",
                "Camera permission is required."
            );

            return;

        }

        const result =
            await ImagePicker.launchCameraAsync({

                quality: 0.7,

                base64: true,

            });

        if (result.canceled) return;

        await uploadSelectedImage(
            result.assets[0]
        );

    };
    const openGallery = async () => {

        const result =
            await ImagePicker.launchImageLibraryAsync({

                quality: 0.7,

                base64: true,

            });

        if (result.canceled) return;

        await uploadSelectedImage(
            result.assets[0]
        );

    };
    const handleUpload = () => {

        Alert.alert(

            "Add Evidence",

            "Choose how you want to add evidence.",

            [

                {

                    text: "📷 Camera",

                    onPress: openCamera,

                },

                {

                    text: "🖼 Gallery",

                    onPress: openGallery,

                },

                {

                    text: "Cancel",

                    style: "cancel",

                },

            ]

        );

    };
    return (

        <View style={styles.card}>

            <Text style={styles.heading}>
                📷 Evidence Images
            </Text>

            <Text style={styles.subtitle}>
                Help responders by uploading additional images of the emergency.
            </Text>

            <TouchableOpacity
                style={styles.uploadButton}
                onPress={handleUpload}
            >

                <Text style={styles.uploadText}>
                    + Add More Evidence
                </Text>

            </TouchableOpacity>
            {evidence.length > 0 && (

                <View style={styles.imageContainer}>

                    {evidence.slice(0, 3).map((img, index) => (

                        <Image
                            key={index}
                            source={{
                                uri: img.imageUrl,
                            }}
                            style={styles.image}
                        />

                    ))}

                    {evidence.length > 3 && (

                        <View style={styles.moreImages}>

                            <Text style={styles.moreText}>
                                +{evidence.length - 3}
                            </Text>

                        </View>

                    )}

                </View>

            )}

        </View>

    );

}

const styles = StyleSheet.create({

    card: {

        backgroundColor: "#FFFFFF",

        borderRadius: 16,

        padding: 18,

        marginBottom: 16,

        elevation: 3,

    },

    heading: {

        fontSize: 20,

        fontWeight: "700",

        color: "#111827",

    },

    subtitle: {

        marginTop: 8,

        color: "#6B7280",

        fontSize: 15,

        lineHeight: 22,

        marginBottom: 16,

    },

    uploadButton: {

        borderWidth: 2,

        borderStyle: "dashed",

        borderColor: "#CBD5E1",

        borderRadius: 12,

        paddingVertical: 16,

        alignItems: "center",

    },

    uploadText: {

        fontSize: 16,

        fontWeight: "600",

        color: "#2563EB",

    },
    imageContainer: {

        flexDirection: "row",

        marginTop: 16,

    },

    image: {

        width: 70,

        height: 70,

        borderRadius: 10,

        marginRight: 10,

    },

    moreImages: {

        width: 70,

        height: 70,

        borderRadius: 10,

        backgroundColor: "#E5E7EB",

        justifyContent: "center",

        alignItems: "center",

    },

    moreText: {

        fontWeight: "700",

        fontSize: 18,

    },

});