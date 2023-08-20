export type FFmpegVideoCodec =
  | "libx264"
  | "libx265"
  | "libvpx"
  | "libvpx-vp9"
  | "libaom-av1"
  | "mpeg4"
  | "libxvid"
  | "vp8"
  | "vp9"
  | "av1"
  | "flv";

export type AudioCodec = "aac" | "libmp3lame" | "libopus" | "libvorbis" | "pcm_s16le" | "pcm_s24le";

export type FFmpegVideoFormat = "mp4" | "mkv" | "flv" | "avi" | "mov" | "webm";

export type FFmpegVideoPreset =
  | "ultrafast"
  | "superfast"
  | "veryfast"
  | "faster"
  | "fast"
  | "medium"
  | "slow"
  | "slower"
  | "veryslow"
  | "placebo";
