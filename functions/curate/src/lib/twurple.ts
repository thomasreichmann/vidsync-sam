import { ApiClient } from "@twurple/api";
import { AppTokenAuthProvider } from "@twurple/auth";

const authProvider = new AppTokenAuthProvider(process.env.TWITCH_CLIENT_ID!, process.env.TWITCH_ACCESS_TOKEN!);

const apiClient = new ApiClient({ authProvider });

export default apiClient;
