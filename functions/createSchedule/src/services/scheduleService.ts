import {
  CreateScheduleCommand,
  CreateScheduleCommandInput,
  GetScheduleCommand,
  ResourceNotFoundException,
  ScheduleState,
  UpdateScheduleCommand,
  UpdateScheduleCommandInput,
} from "@aws-sdk/client-scheduler";
import scheduler from "../lib/scheduler.js";

type UpdateOrCreateCommandInput = CreateScheduleCommandInput & UpdateScheduleCommandInput;

export interface CreateScheduleParams {
  name: string;

  time: ScheduleTime;
  groupName: string;
  targetArn: string;
  roleArn: string;

  payload: any;

  state: ScheduleState;
}

export interface ScheduleTime {
  hours: string;
  minutes: string;
}

// Event bridge service
export default class ScheduleService {
  async getSchedule(name: string, groupName: string) {
    const command = new GetScheduleCommand({ Name: name, GroupName: groupName });

    try {
      const response = await scheduler.send(command, {});

      return response;
    } catch (error: any) {
      if (error instanceof ResourceNotFoundException) {
        return undefined;
      } else {
        throw error;
      }
    }
  }

  async createSchedule(params: CreateScheduleParams) {
    const command = await this.getCreateCommand(params);
    const response = await scheduler.send(command);

    return response;
  }

  private async getCreateCommand(params: CreateScheduleParams) {
    const commandInput: UpdateOrCreateCommandInput = {
      FlexibleTimeWindow: { Mode: "OFF" },
      Name: params.name,
      ScheduleExpression: `cron(${params.time.minutes} ${params.time.hours} * * ? *)`,

      GroupName: params.groupName,
      Target: {
        Arn: params.targetArn,
        RoleArn: params.roleArn,
        Input: JSON.stringify(params.payload),
      },
      State: params.state,
    };

    const schedule = await this.getSchedule(params.name, params.groupName);

    // If the schedule exists, we update it otherwise we create a new one.
    let command = schedule?.Arn ? new UpdateScheduleCommand(commandInput) : new CreateScheduleCommand(commandInput);

    return command;
  }
}
