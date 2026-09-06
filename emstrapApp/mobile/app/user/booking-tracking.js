import { useLocalSearchParams } from "expo-router";
import BookingTrackingScreen from "../../src/screens/user/BookingTrackingScreen";

export default function Page() {
    const { bookingId } = useLocalSearchParams();

    return (
        <BookingTrackingScreen
            bookingId={bookingId}
        />
    );
}