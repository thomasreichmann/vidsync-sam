FROM public.ecr.aws/lambda/nodejs:18

# Set the working directory
WORKDIR /var/task

# Copy typescript source
COPY . .

RUN npm ci && npm run build

# Set the CMD to your handler (using the compiled JavaScript)
CMD [ "dist/src/app.lambdaHandler"]
