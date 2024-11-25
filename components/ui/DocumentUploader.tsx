import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useEffect, useRef, useState } from "react";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";

type ImagesData = {
  uri: string;
};

export default function DocumentUploader() {
  const [images, setImages] = useState<ImagesData[] | null>(null);
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
          const maxScroll = (images && images.length * 350) || 350;

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

  const pickDocument = async (
    type: "photos" | "videos",
    isAlreadyListImages: boolean = false
  ) => {
    try {
      setImagesType(type);
      const result = await DocumentPicker.getDocumentAsync({
        type: type === "photos" ? "image/*" : "video/*",
        multiple: type === "videos" ? false : true,
        copyToCacheDirectory: true,
      });

      console.log({ result });

      if (!result.canceled && result.assets) {
        const selectedImages = result.assets.map((asset) => ({
          uri: asset.uri,
        }));
        if (!isAlreadyListImages) {
          setImages(selectedImages);
        } else {
          setImages([...(images || []), ...selectedImages]);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const shuffleData = () => {
    if (!images) return;
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

  const player = useVideoPlayer(images && images[0]?.uri, (player) => {
    player.loop = true;
    player.play();
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  // IMAGES PHOTOS
  const RenderItem = ({ item }: { item: ImagesData }) => {
    return <Image source={{ uri: item.uri }} style={styles.photos} />;
  };

  return (
    <View style={styles.container}>
      {/* Show images */}
      {images && images.length > 0 ? (
        <View style={styles.imagesContainer}>
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
          <View style={styles.actionsContainer}>
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
                  onPress={() => pickDocument("photos", true)}
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

            <TouchableOpacity onPress={() => setImages([])} style={styles.btn}>
              <Text style={styles.btnText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={{ alignItems: "center" }}>
          <Text style={styles.title}>Upload</Text>

          <View
            style={
              (styles.container,
              {
                flexDirection: "row",
                gap: 10,
                marginVertical: 10,
                alignItems: "center",
              })
            }
          >
            <TouchableOpacity
              style={styles.btn}
              onPress={() => pickDocument("photos")}
            >
              <Text style={styles.btnText}>Photos</Text>
            </TouchableOpacity>
            <Text style={styles.text}>or</Text>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => pickDocument("videos")}
            >
              <Text style={styles.btnText}>Videos</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    overflowY: "hidden",
    overflowX: "scroll",
    height: "100%",
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#122D4F",
  },
  imagesContainer: {
    maxWidth: "100%",
    flex: 1,
  },
  actionsContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
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
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#122D4F",
  },
  text: { color: "#122D4F", fontSize: 20 },
  photos: {
    width: 350,
    height: 300,
    resizeMode: "contain",
  },
  video: {
    width: 350,
    height: 275,
  },
});
