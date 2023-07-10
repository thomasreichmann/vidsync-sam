FROM public.ecr.aws/lambda/nodejs:18 as function-builder

# Set the working directory
WORKDIR /var/task
RUN yum install -y tar xz

# Copy typescript source
COPY . .

RUN npm ci 

RUN npm run tsc

# Set the CMD to your handler (using the compiled JavaScript)
CMD [ "app.lambdaHandler"]
