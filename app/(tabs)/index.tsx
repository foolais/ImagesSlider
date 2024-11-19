import { View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import Uploader from "@/components/ui/Uploader";

export default function HomeScreen() {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        minHeight: "100%",
        backgroundColor: "#F9F7E4",
      }}
    >
      <View style={{ flex: 1 }}>
        <Uploader />
        <Uploader />
      </View>
    </View>
  );
}
