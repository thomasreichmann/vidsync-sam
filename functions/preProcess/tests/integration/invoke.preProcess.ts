import VideoService from "../../services/videoService.js";

const videoService: VideoService = new VideoService();

const filePath = "../../clips/5b622909-219f-4215-9a5d-10ecb8921667.mp4";

videoService.normalize(filePath, "../../clips").then((result) => {
  console.log(result);
});
