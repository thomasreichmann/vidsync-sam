import { SchedulerClient } from "@aws-sdk/client-scheduler";

const REGION = "us-east-1";

export default new SchedulerClient({ region: REGION });
