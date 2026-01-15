FROM acr.kweaver-ai.cn/af/bigdatafile/ubuntu:22.04.20250308

#RUN cp -f /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

COPY cc /usr/local/bin/af/
COPY cmd/server/docs   /usr/local/bin/af/cmd/server/docs/
# 创建默认图片目录
RUN mkdir -p /app/assets/default
# 复制默认图片到容器中
COPY assets/default /app/assets/default/

COPY cmd/server/config /usr/local/bin/af/cmd/server/config/
COPY info /usr/local/bin/af/info/
COPY cmd/server/static/menu.json /usr/local/bin/af/cmd/server/static/menu.json
WORKDIR /usr/local/bin/af/
RUN chmod 757 -R  /usr/local/bin/af/
#RUN chmod 757 -R  /usr/local/bin/af/  \
#    && mkdir -p /opt/log/af  \
#    && chmod 757 -R /opt/log/af

# 设置环境变量（对所有后续指令和容器运行时生效）
ENV  OOO_ENABLE_MULTITHREADING=1 \
#    SAL_USE_VCLPLUGIN=gen \
    SAL_DISABLE_OPENCL=1 \
    LIBO_DISABLE_TELEMETRY=1 \
    OOO_DISABLE_RECOVERY=1

ENTRYPOINT ["/usr/local/bin/af/cc","--confPath","/usr/local/bin/af/cmd/server/config/"]
