# Auto Twitch Compiler - AWS Backend

This repository hosts the backend services for the Auto Twitch Compiler web-app. It manages the entire video processing pipeline, from curating Twitch clips based on user preferences to the final assembly of the video ready for YouTube upload.

## Overview

The backend is built using AWS Serverless Application Model (SAM) and consists of multiple Lambda functions, each responsible for a specific part of the video processing workflow:

1. **Curate**: Fetches Twitch clips based on provided game IDs, quantity, and languages.
2. **Download**: Downloads the selected Twitch clips.
3. **PreProcess**: Processes each clip, preparing them for assembly.
4. **Concatenate**: Merges all processed clips into a single video file ready for upload.

This serverless architecture ensures scalability, resilience, and efficient use of resources.

## Transition to AWS

Previously, the backend was hosted elsewhere, but in the spirit of evolution and leveraging best-of-breed cloud services, we've transitioned to AWS. This move provides improved scalability, flexibility, and a range of AWS services to further optimize the workflow.

For details about the frontend transition to Next.js and the shift from Firebase to MongoDB Atlas, please refer to the [frontend repository](https://chat.openai.com/c/link-to-frontend-repo).

## Dev

The lambdas are developed using Node.js, specifically:

- Node version: v19.4.0

## Deployment

The backend is orchestrated using AWS SAM. To deploy:

1. Ensure you have AWS SAM CLI installed.
2. Navigate to the project root and run:

   `sam build`

3. Followed by:

   `sam deploy --guided`

4. Follow the prompts to deploy the Lambdas and associated resources.

## Environment Variables

Sensitive data, like API keys, are stored securely using AWS Systems Manager Parameter Store. Ensure that the necessary parameters are set up in the AWS Management Console.

## Contributions

Pull requests are welcome. For significant changes, please open an issue first to discuss the proposed changes.
