# Stage 1: Use Maven for building
FROM maven:3.8.5-openjdk-17-slim as build
WORKDIR /app

COPY ./notification-service ./notification-service

WORKDIR /app/notification-service
RUN mvn clean package -DskipTests

# Stage 2: use OpenJDK for running
FROM openjdk:21-jdk-slim
WORKDIR /app
COPY --from=build /app/notification-service/target/*.jar notification-service.jar
EXPOSE 9003
ENTRYPOINT ["java","-jar","notification-service.jar", "--spring.profiles.active=docker"]