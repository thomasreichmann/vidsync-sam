FROM 391615358272.dkr.ecr.us-east-1.amazonaws.com/custom-lambda-nodejs-ffmpeg

WORKDIR /var/task

# Copy typescript source
COPY . .

RUN npm ci && npm run tsc

# Set the CMD to your handler (using the compiled JavaScript)
CMD [ "app.lambdaHandler"]
