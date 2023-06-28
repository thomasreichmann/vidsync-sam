import { expect } from "chai";
import "dotenv/config";
import TwitchService from "./twitchService";

describe("Twitch service tests", function () {
  it("verify clip return length", async () => {
    const QUANT = 20;
    const ID = "21779";

    let twitchService = new TwitchService();

    let result = await twitchService.getClips(ID, QUANT);
    expect(result.length).to.be.equal(QUANT);
  });
});
