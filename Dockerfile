FROM maven:3-ibm-semeru-21-jammy as mvn_build
WORKDIR app
COPY . .
RUN mvn clean package -q \
    -DskipTests \
    -Dmaven.repo.local=/root/.m2/repository \
    -Dorg.slf4j.simpleLogger.log.org.apache.maven.cli.transfer.Slf4jMavenTransferListener=error \
    -T$(grep -c ^processor /proc/cpuinfo)

################################

FROM eclipse-temurin:21-jre as jar_build
WORKDIR app
COPY --from=mvn_build /app/target/Jetbrains-Help.jar Jetbrains-Help.jar
RUN java -Djarmode=layertools -jar Jetbrains-Help.jar extract

################################

FROM ibm-semeru-runtimes:open-21-jre
WORKDIR app
COPY --from=jar_build app/dependencies/ ./
COPY --from=jar_build app/spring-boot-loader/ ./
COPY --from=jar_build app/snapshot-dependencies/ ./
COPY --from=jar_build app/application/ ./
ENV JVM_OPTS="-Xmx512m -Xms256m" \
    TZ=Asia/Shanghai
EXPOSE 10768
ENTRYPOINT ["sh", "-c", "java ${JVM_OPTS} org.springframework.boot.loader.launch.JarLauncher ${0} ${@}"]
