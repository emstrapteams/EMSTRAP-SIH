import { useRef, useState } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import EmergencyHeader from "../common/EmergencyHeader";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function CameraCapture({
    onCapture,
    onCancel,
    loading = false,
}) {
    const cameraRef = useRef(null);

    const [permission, requestPermission] =
        useCameraPermissions();

    const [ready, setReady] = useState(false);

    if (!permission) {
        return <ActivityIndicator size="large" />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Text style={styles.permissionText}>
                    Camera permission is required
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={requestPermission}
                >
                    <Text style={styles.buttonText}>
                        Allow Camera
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    const takePicture = async () => {
        if (!cameraRef.current) return;

        const photo =
            await cameraRef.current.takePictureAsync({
                quality: 0.7,
                base64: true,
            });

        onCapture(photo);
    };

    return (
        <View style={styles.container}>
            <EmergencyHeader />

            <View style={{ flex: 1 }}>
                <CameraView
                    ref={cameraRef}
                    style={styles.camera}
                    facing="back"
                    onCameraReady={() => setReady(true)}
                />

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.cancel}
                        onPress={onCancel}
                    >
                        <Text style={styles.cancelText}>
                            Cancel
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        disabled={!ready || loading}
                        style={styles.capture}
                        onPress={takePicture}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.captureText}>
                                Capture
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },

    camera: {
        flex: 1,
    },

    footer: {
        position: "absolute",
        bottom: 40,
        left: 20,
        right: 20,
        flexDirection: "row",
        justifyContent: "space-between",
    },

    cancel: {
        backgroundColor: "#555",
        padding: 15,
        borderRadius: 12,
        width: 120,
        alignItems: "center",
    },

    capture: {
        backgroundColor: "#dc2626",
        padding: 15,
        borderRadius: 12,
        width: 150,
        alignItems: "center",
    },

    captureText: {
        color: "white",
        fontWeight: "700",
    },

    cancelText: {
        color: "white",
        fontWeight: "700",
    },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 30,
    },

    permissionText: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: "center",
    },

    button: {
        backgroundColor: "#dc2626",
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 12,
    },

    buttonText: {
        color: "white",
        fontWeight: "700",
    },
});