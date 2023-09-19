import {
  CreateScheduleCommand,
  CreateScheduleCommandInput,
  GetScheduleCommand,
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
    const response = await scheduler.send(command);

    return response;
  }

  async createSchedule(params: CreateScheduleParams) {
    const command = await this.getCreateCommand(params);
    const response = await scheduler.send(command);

    return response;
  }

  private async getCreateCommand(params: CreateScheduleParams) {
    const commandInput: UpdateOrCreateCommandInput = {
      FlexibleTimeWindow: undefined,
      Name: params.name,
      ScheduleExpression: `${params.time.minutes} ${params.time.hours} * * ? *`,
      GroupName: params.groupName,
      Target: {
        Arn: params.targetArn,
        RoleArn: params.roleArn,
      },
      State: params.state,
    };

    const schedule = await this.getSchedule(params.name, params.groupName);
    let command: UpdateScheduleCommand | CreateScheduleCommand;
    if (schedule.Arn) {
      command = new UpdateScheduleCommand(commandInput);
    } else {
      command = new CreateScheduleCommand(commandInput);
    }

    return command;
  }
}
