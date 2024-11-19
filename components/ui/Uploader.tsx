import {
  Animated,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";

type ImagesData = {
  uri: string;
  fileName: string | null;
};

export default function Uploader() {
  const [images, setImages] = useState<ImagesData[]>([]);
  const [imagesType, setImagesType] = useState<"photos" | "videos" | null>(
    null
  );
  const [scrollX, setScrollX] = useState<number>(0);
  const [isAutoScroll, setIsAutoScroll] = useState<boolean>(false);

  const scrollViewRef = useRef<ScrollView>(null);

  //   Automatic Scroll
  useEffect(() => {
    const scrollToRight = () => {
      if (scrollViewRef.current && isAutoScroll) {
        setScrollX((prev) => {
          const newValue = prev + 350;
          const maxWidth = 350 * images.length;
          if (newValue < maxWidth) {
            scrollViewRef.current?.scrollTo({ x: newValue, animated: true });
            return newValue;
          } else {
            scrollViewRef.current?.scrollTo({ x: 0, animated: true });
            return 0;
          }
        });
      }
    };
    const intervalId = setInterval(scrollToRight, 2000);

    return () => {
      clearInterval(intervalId);
    };
  }, [images, isAutoScroll]);

  const openGallery = async (
    type: "photos" | "videos",
    isAlreadyListImages: boolean = false
  ): Promise<void> => {
    setImagesType(type);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:
        type === "photos"
          ? ImagePicker.MediaTypeOptions.Images
          : ImagePicker.MediaTypeOptions.Videos,
      allowsMultipleSelection: type === "photos" ? true : false,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const selectedImages = result.assets.map((image) => ({
        uri: image.uri,
        fileName: image.fileName || "Unknow filename",
      }));

      if (!isAlreadyListImages) {
        setImages(selectedImages);
      } else {
        setImages([...images, ...selectedImages]);
      }
    }
  };

  const shuffleData = () => {
    const shuffled = [...images].sort(() => Math.random() - 0.5);
    setImages(shuffled);
    setScrollX(0);
  };

  const player = useVideoPlayer(images[0]?.uri, (player) => {
    player.loop = true;
    player.play();
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  return (
    <View style={styles.container}>
      {/* Show images */}
      <View>
        {images.length > 0 ? (
          <View style={{ flex: 1, maxWidth: "100%", padding: 20 }}>
            {/* PHOTOS */}
            {imagesType === "photos" && (
              <ScrollView
                horizontal
                showsVerticalScrollIndicator={false}
                ref={scrollViewRef}
                style={{ flexDirection: "row", gap: 10 }}
              >
                {images.map((image, index) => (
                  <View key={index}>
                    <Image
                      source={{ uri: image.uri }}
                      style={{
                        width: 350,
                        height: 350,
                        resizeMode: "contain",
                      }}
                    />
                  </View>
                ))}
              </ScrollView>
            )}
            {/* Videos */}
            {imagesType === "videos" && (
              <View>
                <VideoView
                  style={styles.video}
                  player={player}
                  allowsFullscreen
                  allowsPictureInPicture
                />
              </View>
            )}

            {/* Actions */}
            <View
              style={{
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 10,
                flexDirection: "row",
                gap: 10,
              }}
            >
              {imagesType === "photos" ? (
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => setIsAutoScroll(!isAutoScroll)}
                    style={styles.btn}
                  >
                    <Text style={styles.btnText}>
                      {isAutoScroll ? "Stop" : "Start"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => openGallery("photos", true)}
                    style={styles.btn}
                  >
                    <Text style={styles.btnText}>Add More</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => shuffleData()}
                    style={styles.btn}
                  >
                    <Text style={styles.btnText}>Randomize</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    if (isPlaying) {
                      player.pause();
                    } else {
                      player.play();
                    }
                  }}
                  style={styles.btn}
                >
                  <Text style={styles.btnText}>
                    {isPlaying ? "Pause" : "Play"}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => setImages([])}
                style={styles.btn}
              >
                <Text style={styles.btnText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={{ alignItems: "center" }}>
            <Text
              style={{ fontSize: 20, fontWeight: "bold", color: "#122D4F" }}
            >
              Upload
            </Text>

            <View
              style={
                (styles.container,
                { flexDirection: "row", gap: 10, marginVertical: 10 })
              }
            >
              <TouchableOpacity
                style={styles.btn}
                onPress={() => openGallery("photos")}
              >
                <Text style={styles.btnText}>Photos</Text>
              </TouchableOpacity>
              <Text style={{ color: "#122D4F", fontSize: 20 }}>or</Text>
              <TouchableOpacity
                style={styles.btn}
                onPress={() => openGallery("videos")}
              >
                <Text style={styles.btnText}>Videos</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    overflowY: "hidden",
    overflowX: "scroll",
    height: "50%",
    borderBottomWidth: 2,
    borderBottomColor: "#122D4F",
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 9,
    backgroundColor: "#122D4F",
  },
  btnText: {
    color: "#FFF",
  },
  contentContainer: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 50,
  },
  video: {
    width: 350,
    height: 275,
  },
  controlsContainer: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    padding: 10,
  },
});
