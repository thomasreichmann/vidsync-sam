import "dotenv/config";
import fs from "fs";
import { Common } from "googleapis";
import YoutubeService from "../src/services/youtubeService.js";

const client = {
  clientId: process.env.clientId ?? "",
  clientSecret: process.env.clientSecret ?? "",
};

const refreshToken: string = process.env.refreshToken || "";

const youtubeService = new YoutubeService(client, refreshToken);

const stream = fs.createReadStream("./temp/1e56f624-c929-4d5e-83f0-dc4b11356f43.mp4");

youtubeService
  .uploadVideo(stream, {
    title: "This is a custom title: SKT_Light, NastaiGaming, squarebracket1",
    description:
      "SKT_Light: http://twitch.tv/SKT_Light\nNastaiGaming: http://twitch.tv/NastaiGaming\nsquarebracket1: http://twitch.tv/squarebracket1\n\n00:00 SKT_Light\n00:43 NastaiGaming\n01:14 squarebracket1\n",
  })
  .then((data) => {
    console.log(data);
  })
  .catch((e) => {
    // In many cases, errors from the API will come back as `GaxiosError`.
    // These will include the full HTTP Response (you should check for it first)
    if ((e as Common.GaxiosError).response) {
      const err = e as Common.GaxiosError;
      console.error(err.response);
    }
  });
