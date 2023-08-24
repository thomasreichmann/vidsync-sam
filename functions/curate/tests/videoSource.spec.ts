import "dotenv/config";
import IVideoSource, { VideoSourceOptions, VideoSourceType } from "../src/videoSources/IVideoSource.js";
import TwitchVideoSource from "../src/videoSources/TwitchVideoSource.js";

function getVideoSource(): IVideoSource {
  return new TwitchVideoSource();
}

const videoSource = getVideoSource();

const options: VideoSourceOptions = {
  type: VideoSourceType.Twitch,
  gameIds: ["21779", "29307"],
  languages: ["en"],
  quantity: 10,
};

videoSource.getVideos(options).then((videos) => {
  console.log(videos);
});
