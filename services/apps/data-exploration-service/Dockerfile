FROM acr.KweaverAI.cn/public/ubuntu:22.04.20230316

#RUN cp -f /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
RUN apt-get update && \
    apt-get install -y curl

COPY app /usr/local/bin/af/

COPY cmd/server/config /usr/local/bin/af/cmd/server/config/
COPY cmd/server/docs /usr/local/bin/af/cmd/server/docs/
WORKDIR /usr/local/bin/af/
RUN chmod 757 -R  /usr/local/bin/af/  \
   && mkdir -p /opt/log/af  \
   && chmod 757 -R /opt/log/af

ENTRYPOINT ["/usr/local/bin/af/app","server","--conf","/usr/local/bin/af/cmd/server/config/","--addr","0.0.0.0:8281"]