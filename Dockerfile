FROM alpine:latest
RUN echo "Hello World"
CMD ["sh", "-c", "echo Hello World && sleep 3600"]
