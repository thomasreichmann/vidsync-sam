import fs from "fs";
import VideoService from "../../services/videoService.js";

const videoService: VideoService = new VideoService();

const filePath = "../../clips/IcyCoweringHabaneroResidentSleeper-Cr-aCd_NGWbawR8p.mp4";

videoService
  .normalize(filePath, "../../clips", {
    videoCodec: "mpeg4",
    videoBitrate: "4000",
    videoPreset: "ultrafast",
  })
  .then((result) => {
    const inputSize = fs.statSync(filePath).size / 1024 / 1024;
    const outputSize = fs.statSync(result).size / 1024 / 1024;
    const ratio = (outputSize / inputSize) * 100;

    console.log(`Input size: ${inputSize} MB`);
    console.log(`Output size: ${outputSize} MB`);
    console.log(`Output is ${ratio.toFixed(2)}% larger than input`);

    // Cleanup
    // fs.unlinkSync(result);
  });
