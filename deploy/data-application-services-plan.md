# Data Application Services Docker 部署方案

## 概述

为 `data-application-service` 和 `data-application-gateway` 两个服务：
1. 更新 Makefile（添加 build、start 等目标）
2. 创建 Dockerfile
3. 集成到 docker-compose.yml 部署

## 服务信息

### data-application-service
- **端口**: 8156
- **服务名**: `af_data_application_service`
- **二进制名**: `data-application-service-server`
- **主入口**: `cmd/server/main.go`
- **配置文件**: `cmd/server/config/config.yaml`
- **启动方式**: 使用命令行参数 `--confPath` 和 `--addr`
- **当前状态**: 
  - ✅ 有 Makefile（但缺少 build/start 目标）
  - ❌ 无 Dockerfile
  - ❌ 未集成到 docker-compose.yml

### data-application-gateway
- **端口**: 8157
- **服务名**: `af_data_application_gateway`
- **二进制名**: `data-application-gateway-server`
- **主入口**: `cmd/server/main.go`
- **配置文件**: `cmd/server/config/config.yaml`
- **启动方式**: 使用命令行参数 `--confPath` 和 `--addr`
- **当前状态**: 
  - ✅ 有 Makefile（但缺少 build/start 目标）
  - ❌ 无 Dockerfile
  - ❌ 未集成到 docker-compose.yml

## 实施方案

### 1. 更新 Makefile

#### 1.1 data-application-service/Makefile

参考 `basic-search/Makefile`，添加以下目标：

- `build`: 构建当前平台二进制
- `build-linux`: 构建 Linux 平台二进制
- `start`: 使用已构建的二进制启动（需要先构建）
- `start-dev`: 构建并启动

**要点**:
- 二进制名称: `data-application-service-server`
- 启动命令: `./bin/data-application-service-server --confPath dev-config/config.yaml --addr 0.0.0.0:8156`
- 使用 `CGO_ENABLED=0`（除非有 CGO 依赖）

#### 1.2 data-application-gateway/Makefile

参考 `basic-search/Makefile`，添加以下目标：

- `build`: 构建当前平台二进制
- `build-linux`: 构建 Linux 平台二进制
- `start`: 使用已构建的二进制启动（需要先构建）
- `start-dev`: 构建并启动

**要点**:
- 二进制名称: `data-application-gateway-server`
- 启动命令: `./bin/data-application-gateway-server --confPath cmd/server/config/config.yaml --addr 0.0.0.0:8157`
- 使用 `CGO_ENABLED=0`（除非有 CGO 依赖）

### 2. 创建 Dockerfile

#### 2.1 data-application-service/docker/Dockerfile

参考 `basic-search/docker/Dockerfile`，创建多阶段构建：

**Stage 0 (builder)**:
- 基础镜像: `golang:1.24.11`
- 复制 `go.mod` 和 `go.sum`
- 下载依赖
- 安装 `wire` 工具
- 复制源代码
- 生成 wire 代码（如果需要）
- 构建二进制: `data-application-service-server`

**Stage 1 (prod)**:
- 基础镜像: `ubuntu:24.04`
- 创建用户和组（adp:adp, UID=1001, GID=1001）
- 复制二进制文件到 `/opt/data-application-service/`
- 复制配置文件到 `/opt/data-application-service/config/`
- 创建日志目录
- 设置工作目录: `/opt/data-application-service/`
- 暴露端口: `8156`
- 启动命令: `["./data-application-service-server", "--confPath", "config/config.yaml", "--addr", "0.0.0.0:8156"]`

#### 2.2 data-application-gateway/docker/Dockerfile

参考 `basic-search/docker/Dockerfile`，创建多阶段构建：

**Stage 0 (builder)**:
- 基础镜像: `golang:1.24.11`
- 复制 `go.mod` 和 `go.sum`
- 下载依赖
- 安装 `wire` 工具
- 复制源代码
- 生成 wire 代码（如果需要）
- 构建二进制: `data-application-gateway-server`

**Stage 1 (prod)**:
- 基础镜像: `ubuntu:24.04`
- 创建用户和组（adp:adp, UID=1001, GID=1001）
- 复制二进制文件到 `/opt/data-application-gateway/`
- 复制配置文件到 `/opt/data-application-gateway/config/`
- 创建日志目录
- 设置工作目录: `/opt/data-application-gateway/`
- 暴露端口: `8157`
- 启动命令: `["./data-application-gateway-server", "--confPath", "config/config.yaml", "--addr", "0.0.0.0:8157"]`

### 3. 集成到 docker-compose.yml

在 `deploy/docker-compose.yml` 中添加两个服务配置：

#### 3.1 data-application-service

```yaml
data-application-service:
  build:
    context: ..
    dockerfile: services/apps/data-application-service/docker/Dockerfile
  container_name: data-application-service
  ports:
    - "8156:8156"
  environment:
    - CONFIG_PATH=/opt/data-application-service/config/config.yaml
    - DB_HOST=mariadb
    - DB_PORT=3306
    - DB_USERNAME=${MYSQL_USER:-dsg}
    - DB_PASSWORD=${MYSQL_PASSWORD:-dsg123}
    - DB_NAME=${MYSQL_DATABASE:-dsg}
    - DB_TYPE=mysql
    - REDIS_HOST=redis:6379
    - REDIS_PASSWORD=
    - REDIS_MASTER_NAME=${REDIS_MASTER_NAME:-mymaster}
    - KAFKA_HOST=kafka:9092
    - KAFKA_PORT=9092
    - KAFKA_USERNAME=${KAFKA_USERNAME:-admin}
    - KAFKA_PASSWORD=${KAFKA_PASSWORD:-admin123}
    - KAFKA_MECHANISM=PLAIN
    - KAFKA_VERSION=${KAFKA_VERSION:-2.3.1}
    - HYDRA_ADMIN=${HYDRA_ADMIN_HOST:-hydra:4445}
    - CONFIGURATION_CENTER=${CONFIGURATION_CENTER_HOST:-configuration-center:8133}
    - TRACE_ENABLED=false
    - LOG_LEVEL=info
    - GOPRIVATE=github.com/kweaver-ai/*
  volumes:
    - ../services/apps/data-application-service/cmd/server/config/config.yaml:/opt/data-application-service/config/config.yaml:ro
    - data-application-service-logs:/opt/data-application-service/logs
  networks:
    - dsg-network
  depends_on:
    mariadb:
      condition: service_healthy
    redis:
      condition: service_started
    kafka:
      condition: service_started
    hydra:
      condition: service_started
    configuration-center:
      condition: service_started
  restart: unless-stopped
```

#### 3.2 data-application-gateway

```yaml
data-application-gateway:
  build:
    context: ..
    dockerfile: services/apps/data-application-gateway/docker/Dockerfile
  container_name: data-application-gateway
  ports:
    - "8157:8157"
  environment:
    - CONFIG_PATH=/opt/data-application-gateway/config/config.yaml
    - DB_HOST=mariadb
    - DB_PORT=3306
    - DB_USERNAME=${MYSQL_USER:-dsg}
    - DB_PASSWORD=${MYSQL_PASSWORD:-dsg123}
    - DB_NAME=${MYSQL_DATABASE:-dsg}
    - DB_TYPE=mysql
    - REDIS_HOST=redis:6379
    - REDIS_PASSWORD=
    - REDIS_MASTER_NAME=${REDIS_MASTER_NAME:-mymaster}
    - CONFIGURATION_CENTER=${CONFIGURATION_CENTER_HOST:-configuration-center:8133}
    - HYDRA_ADMIN=${HYDRA_ADMIN_HOST:-hydra:4445}
    - DATA_APPLICATION_SERVICE=${DATA_APPLICATION_SERVICE_HOST:-data-application-service:8156}
    - TRACE_ENABLED=false
    - LOG_LEVEL=info
    - GOPRIVATE=github.com/kweaver-ai/*
  volumes:
    - ../services/apps/data-application-gateway/cmd/server/config/config.yaml:/opt/data-application-gateway/config/config.yaml:ro
    - data-application-gateway-logs:/opt/data-application-gateway/logs
  networks:
    - dsg-network
  depends_on:
    mariadb:
      condition: service_healthy
    redis:
      condition: service_started
    hydra:
      condition: service_started
    configuration-center:
      condition: service_started
    data-application-service:
      condition: service_started
  restart: unless-stopped
```

#### 3.3 添加 volumes

在 `volumes` 部分添加：

```yaml
volumes:
  # ... existing volumes ...
  data-application-service-logs:
  data-application-gateway-logs:
```

### 4. 更新 docker-compose.dev.yml

在开发环境配置中添加两个服务的 DEBUG 模式配置：

```yaml
services:
  # ... existing services ...
  
  data-application-service:
    environment:
      - DEBUG=true
      - LOG_LEVEL=debug
      - TRACE_ENABLED=false

  data-application-gateway:
    environment:
      - DEBUG=true
      - LOG_LEVEL=debug
      - TRACE_ENABLED=false
```

### 5. 更新 .env.example

在环境变量模板中添加两个服务的配置（如果需要）：

```bash
# Data Application Services
DATA_APPLICATION_SERVICE_HOST=data-application-service:8156
DATA_APPLICATION_GATEWAY_HOST=data-application-gateway:8157
```

## 实施步骤

1. ✅ **更新 data-application-service/Makefile**
   - 添加 `build`、`build-linux`、`start`、`start-dev` 目标

2. ✅ **更新 data-application-gateway/Makefile**
   - 添加 `build`、`build-linux`、`start`、`start-dev` 目标

3. ✅ **创建 data-application-service/docker/Dockerfile**
   - 创建 `docker` 目录
   - 创建 Dockerfile

4. ✅ **创建 data-application-gateway/docker/Dockerfile**
   - 创建 `docker` 目录
   - 创建 Dockerfile

5. ✅ **更新 deploy/docker-compose.yml**
   - 添加 `data-application-service` 服务配置
   - 添加 `data-application-gateway` 服务配置
   - 添加对应的 volumes

6. ✅ **更新 deploy/docker-compose.dev.yml**
   - 添加两个服务的开发环境配置

7. ✅ **验证构建和启动**
   - 测试 Makefile 构建
   - 测试 Docker 构建
   - 测试 docker-compose 启动

## 注意事项

1. **配置文件路径**: 
   - 两个服务使用 `--confPath` 参数指定配置目录
   - Dockerfile 中需要复制配置文件到正确位置
   - docker-compose.yml 中通过 volume 挂载配置文件

2. **启动命令**: 
   - 与 `basic-search` 不同，这两个服务不使用子命令（如 `serve`）
   - 直接在 `ENTRYPOINT` 中运行二进制文件

3. **依赖关系**: 
   - `data-application-gateway` 依赖 `data-application-service`
   - 需要在 `depends_on` 中正确设置

4. **端口冲突**: 
   - 确认端口 8156 和 8157 未被占用
   - 如需要，可在 docker-compose.yml 中修改

5. **环境变量**: 
   - 两个服务都依赖 MariaDB、Redis、Hydra、Configuration Center
   - 需要确保这些服务已正确配置和启动

6. **日志目录**: 
   - 创建对应的日志 volume
   - 确保日志目录权限正确

## 参考服务

- **basic-search**: Dockerfile 和多阶段构建参考
- **auth-service**: 类似的启动方式（使用 `--confPath` 参数）
- **configuration-center**: 类似的服务依赖关系

## 测试清单

- [ ] Makefile build 成功
- [ ] Makefile build-linux 成功
- [ ] Docker 构建成功
- [ ] docker-compose up 启动成功
- [ ] 服务健康检查通过
- [ ] 日志输出正常
- [ ] 服务间通信正常
