import { useLocalSearchParams } from "expo-router";
import SearchingDriverScreen from "../../src/screens/user/SearchingDriverScreen";

export default function SearchingDriverPage() {
    const params = useLocalSearchParams();

    return (
        <SearchingDriverScreen
            bookingId={params.bookingId}
        />
    );
}