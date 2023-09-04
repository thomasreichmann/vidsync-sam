import "dotenv/config";
import { MetadataRequest, lambdaHandler } from "./src/app.js";

const context = {
  callbackWaitsForEmptyEventLoop: false,
  functionName: "",
  functionVersion: "",
  invokedFunctionArn: "",
  memoryLimitInMB: "",
  awsRequestId: "",
  logGroupName: "",
  logStreamName: "",
  getRemainingTimeInMillis: function (): number {
    throw new Error("Function not implemented.");
  },
  done: function (error?: Error | undefined, result?: any): void {
    throw new Error("Function not implemented.");
  },
  fail: function (error: string | Error): void {
    throw new Error("Function not implemented.");
  },
  succeed: function (messageOrObject: any): void {
    throw new Error("Function not implemented.");
  },
};

const request: MetadataRequest = {
  infos: [
    {
      title: "Unkillable god",
      creatorName: "Fierced",
      creatorUrl: "http://twitch.tv/Fierced",
      downloadUrl: "https://clips-media-assets2.twitch.tv/VaDuquaYVzOt-KVBOfPbrQ/AT-cm%7CVaDuquaYVzOt-KVBOfPbrQ.mp4",
      originalUrl: "https://clips.twitch.tv/DifficultInnocentRutabagaRalpherZ-5phXM634pUE589ut",
      durationSeconds: 14.5,
    },
    {
      title: "Sub gets the holy grail of POE!!!",
      creatorName: "viper91234",
      creatorUrl: "http://twitch.tv/viper91234",
      downloadUrl: "https://clips-media-assets2.twitch.tv/MhaUB8wE8MF6CmDm_KzOxQ/AT-cm%7CMhaUB8wE8MF6CmDm_KzOxQ.mp4",
      originalUrl: "https://clips.twitch.tv/HeartlessArtsyTigerBuddhaBar-zATwwXoKYOb8rM7F",
      durationSeconds: 59.9,
    },
    {
      title: "what is bros community",
      creatorName: "itsmyles12",
      creatorUrl: "http://twitch.tv/itsmyles12",
      downloadUrl: "https://clips-media-assets2.twitch.tv/GMnH8cREASIFXX__6DiIrw/AT-cm%7CGMnH8cREASIFXX__6DiIrw.mp4",
      originalUrl: "https://clips.twitch.tv/StrangeGentleSoybeanItsBoshyTime-xEQBIgVdf__oOIiv",
      durationSeconds: 29.3,
    },
    {
      title: "quinXD unkillable",
      creatorName: "oRubisco",
      creatorUrl: "http://twitch.tv/oRubisco",
      downloadUrl: "https://clips-media-assets2.twitch.tv/K4RWn1ewoZCGKQFgrhKkNA/AT-cm%7CK4RWn1ewoZCGKQFgrhKkNA.mp4",
      originalUrl: "https://clips.twitch.tv/SwissPolishedCarabeefKappaWealth-V7ChkIYpAWCuEqQ0",
      durationSeconds: 15.3,
    },
    {
      title: "Shroud’s take on the latest Valorant update.",
      creatorName: "mkposies",
      creatorUrl: "http://twitch.tv/mkposies",
      downloadUrl: "https://clips-media-assets2.twitch.tv/jNSGLZvP57--OYTfTx1aSg/AT-cm%7CjNSGLZvP57--OYTfTx1aSg.mp4",
      originalUrl: "https://clips.twitch.tv/SpunkyVictoriousStarlingWoofer-m8_nv745hN9PHVpK",
      durationSeconds: 47.4,
    },
    {
      title: "你他X的055鱷魚滾啦",
      creatorName: "楓狂小軟棠",
      creatorUrl: "http://twitch.tv/楓狂小軟棠",
      downloadUrl: "https://clips-media-assets2.twitch.tv/1j1yv4Zs50N6w-LYtSnUdw/vod-1912500736-offset-6572.mp4",
      originalUrl: "https://clips.twitch.tv/UgliestIcyCrocodilePhilosoraptor-hmznQ3rD4ti1KdR3",
      durationSeconds: 30,
    },
    {
      title: "when shanks talk that mess..",
      creatorName: "Stewie2K",
      creatorUrl: "http://twitch.tv/Stewie2K",
      downloadUrl: "https://clips-media-assets2.twitch.tv/UnB3Ww-9IVV8jnpkjSQiRg/AT-cm%7CUnB3Ww-9IVV8jnpkjSQiRg.mp4",
      originalUrl: "https://clips.twitch.tv/SquarePlumpPlumageOneHand-D70hVXyOemSNJCJG",
      durationSeconds: 59.9,
    },
    {
      title: "Jinggg's shorty is and will always be top tier",
      creatorName: "daddy_yangee",
      creatorUrl: "http://twitch.tv/daddy_yangee",
      downloadUrl: "https://clips-media-assets2.twitch.tv/wjaAzcDNIPx7FodtYVNZBA/vod-1911432202-offset-11312.mp4",
      originalUrl: "https://clips.twitch.tv/SpikyHeartlessBananaCoolCat-wM0g_HsWh21hU1kE",
      durationSeconds: 30,
    },
    {
      title: "New Champ Outplay",
      creatorName: "Cnoized",
      creatorUrl: "http://twitch.tv/Cnoized",
      downloadUrl: "https://clips-media-assets2.twitch.tv/YFH_UmK0Zka0kc2Ef5eLTg/AT-cm%7CYFH_UmK0Zka0kc2Ef5eLTg.mp4",
      originalUrl: "https://clips.twitch.tv/HappyShakingSharkHoneyBadger-YrRmRrSRzYR_l4tO",
      durationSeconds: 30.5,
    },
    {
      title: "movement master ",
      creatorName: "gerome_delabiche",
      creatorUrl: "http://twitch.tv/gerome_delabiche",
      downloadUrl: "https://clips-media-assets2.twitch.tv/NfuhXm6AhDJXKjuvhgOeSw/AT-cm%7CNfuhXm6AhDJXKjuvhgOeSw.mp4",
      originalUrl: "https://clips.twitch.tv/BetterSingleCiderPanicVis-boCEMlcqO6-GA55L",
      durationSeconds: 7.4,
    },
  ],
};

const res = lambdaHandler(request, context, () => {});

if (res instanceof Promise) {
  res.then((r) => console.log(r));
} else {
  console.log(res);
}
