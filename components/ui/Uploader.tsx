import {
  FlatList,
  Image,
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
  const [isAutoScroll, setIsAutoScroll] = useState<boolean>(false);

  const flatListRef = useRef<FlatList>(null);
  const scrollPosition = useRef(0);

  //   Automatic Scroll
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isAutoScroll) {
      intervalId = setInterval(() => {
        if (flatListRef.current) {
          const nextPosition = scrollPosition.current + 350;
          const maxScroll = images.length * 350;

          if (nextPosition >= maxScroll) {
            scrollPosition.current = 0;
          } else {
            scrollPosition.current = nextPosition;
          }

          flatListRef.current.scrollToOffset({
            offset: scrollPosition.current,
            animated: true,
          });
        }
      }, 3000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isAutoScroll, images]);

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
      allowsMultipleSelection: type === "videos" ? false : true,
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

    // Reset scroll position
    if (flatListRef.current) {
      scrollPosition.current = 0;
      flatListRef.current.scrollToOffset({
        offset: 0,
        animated: true,
      });
    }
  };

  const player = useVideoPlayer(images[0]?.uri, (player) => {
    player.loop = true;
    player.play();
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  const RenderItem = ({ item }: { item: ImagesData }) => {
    return (
      <Image
        source={{ uri: item.uri }}
        style={{
          width: 350,
          height: 350,
          resizeMode: "contain",
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Show images */}
      <View>
        {images.length > 0 ? (
          <View style={{ flex: 1, maxWidth: "100%", padding: 20 }}>
            {/* PHOTOS */}
            {imagesType === "photos" && (
              <FlatList
                data={images}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => <RenderItem item={item} />}
                horizontal
                showsHorizontalScrollIndicator={false}
                removeClippedSubviews
                initialNumToRender={5}
                maxToRenderPerBatch={10}
                windowSize={5}
                ref={flatListRef}
              />
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
