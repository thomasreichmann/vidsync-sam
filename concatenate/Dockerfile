FROM public.ecr.aws/lambda/nodejs:18 as function-builder

# Set the working directory
WORKDIR /var/task
RUN yum install -y tar xz

# Download static build of ffmpeg
ADD https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz .
RUN tar -xf ffmpeg-release-amd64-static.tar.xz && \
    rm ffmpeg-release-amd64-static.tar.xz && \
    mv ffmpeg-*-static/ffmpeg /usr/local/bin/ffmpeg && \
    mv ffmpeg-*-static/ffprobe /usr/local/bin/ffprobe && \
    rm -r ffmpeg-*-static

# Copy typescript source
COPY . .

RUN npm ci 

RUN npm run tsc

# Set the CMD to your handler (using the compiled JavaScript)
CMD [ "app.lambdaHandler"]
