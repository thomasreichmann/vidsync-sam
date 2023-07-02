import {
  ApiClient,
  HelixClip,
  HelixClipApi,
  HelixPaginatedRequest,
} from "@twurple/api";
import { HelixClipData } from "@twurple/api/lib/interfaces/endpoints/clip.external";
import { expect } from "chai";
import "dotenv/config";
import { anything, capture, instance, mock, when } from "ts-mockito";
import TwitchService from "./twitchService";

describe("Twitch service tests", function () {
  let twitchService: TwitchService;
  let twurpleClientMock: ApiClient;
  let clipsApiMock: HelixClipApi;
  let requestMock: HelixPaginatedRequest<HelixClipData, HelixClip>;

  beforeEach(() => {
    // Mock the getClipsForGamePaginated function
    clipsApiMock = mock<HelixClipApi>();

    // Mock the twurpleClient
    twurpleClientMock = mock<ApiClient>();

    // Mock the request
    requestMock = mock<HelixPaginatedRequest<HelixClipData, HelixClip>>();

    when(twurpleClientMock.clips).thenReturn(instance(clipsApiMock));
    when(
      clipsApiMock.getClipsForGamePaginated(anything(), anything())
    ).thenReturn(instance(requestMock));

    twitchService = new TwitchService(instance(twurpleClientMock));
  });

  it("should generate download url from clip", () => {
    // Arrange
    const clipId = "test-clip-id";
    const clip = {
      id: clipId,
      thumbnailUrl:
        "https://clips-media-assets2.twitch.tv/AT-cm%7C446951511-preview-480x272.jpg",
    } as HelixClip;

    // Act
    const url = twitchService.generateDownloadUrl(clip);
    // const downloadUrl = clip.thumbnailUrl.replace("-preview-480x272.jpg", ".mp4");

    // Assert
    expect(url).to.equal(
      `https://clips-media-assets2.twitch.tv/AT-cm%7C446951511.mp4`
    );
  });

  it("should get clips", async () => {
    // Arrange
    const gameId = "test-game-id";
    const quantity = 3;
    const mockClips = Array(quantity).fill({} as HelixClip);

    // Set up our mocks to return the values we want
    when(requestMock.getNext()).thenResolve(mockClips);

    // Act
    const clips = await twitchService.getClips(gameId, quantity);

    // Assert
    expect(clips).to.deep.equal(mockClips);
  });

  it("should trim clips to quantity", async () => {
    const QUANT = 20;
    const ID = "21779";

    const mockClips = Array(QUANT + 30).fill({} as HelixClip);

    // Set up our mocks to return the values we want
    when(requestMock.getNext()).thenResolve(mockClips);

    let result = await twitchService.getClips(ID, QUANT);
    expect(result.length).to.be.equal(QUANT);
  });

  it("should call getClipsForGamePaginated with correct arguments", async () => {
    const gameId = "test-game-id";
    const quantity = 3;

    when(requestMock.getNext()).thenResolve([]);

    await twitchService.getClips(gameId, quantity);

    const [arg1, arg2] = capture(clipsApiMock.getClipsForGamePaginated).last();

    // Check gameId is passed correctly
    expect(arg1).to.equal(gameId);

    // Check date range is as expected
    expect(arg2?.startDate).to.exist;
    expect(arg2?.endDate).to.exist;
  });
});
