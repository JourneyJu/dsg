# Basic-Search 服务 Docker Compose 部署指南

## 快速开始

### 1. 使用启动脚本（推荐）

```bash
# 从项目根目录执行
./script/start-go-services.sh
```

脚本会自动：
- ✅ 扫描 `services/apps/` 目录下的所有 Go 服务（通过 go.mod 识别）
- ✅ 检查 Docker 和 Docker Compose 环境
- ✅ 提供多种启动模式选择
- ✅ 显示服务状态和访问地址

### 2. 手动启动所有服务

```bash
cd deploy
docker compose up -d
```

### 2. 查看服务状态

```bash
docker-compose ps
```

### 3. 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f basic-search
docker-compose logs -f opensearch
docker-compose logs -f kafka
```

### 4. 停止所有服务

```bash
docker-compose down
```

### 5. 停止并删除数据卷

```bash
docker-compose down -v
```

## 服务说明

### 核心服务

- **basic-search** (端口: 8163)
  - 基础搜索服务
  - 健康检查: http://localhost:8163/health

### 依赖服务

- **opensearch** (端口: 9200, 9600)
  - 搜索引擎
  - 访问: http://localhost:9200
  - 默认禁用安全插件（开发环境）

- **kafka** (端口: 9092, 31000)
  - 消息队列服务
  - 需要先启动 zookeeper

- **zookeeper** (端口: 2181)
  - Kafka 的依赖服务

- **hydra** (端口: 4444, 4445)
  - OAuth2 服务
  - Public API: http://localhost:4444
  - Admin API: http://localhost:4445

- **redis** (端口: 6379)
  - 缓存服务

### 可选工具

- **kafka-ui** (端口: 8080)
  - Kafka 管理界面
  - 启动方式: `docker-compose --profile tools up kafka-ui`
  - 访问: http://localhost:8080

## 环境变量配置

创建 `.env` 文件（可选）：

```bash
# OAuth 配置
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-client-secret

# 用户组织信息
USER_ORG_CODE=your-org-code
USER_ORG_NAME=your-org-name
```

## 开发环境

使用开发环境配置（支持热重载等）：

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## 配置文件

服务配置文件位于：
- `../services/apps/basic-search/dev-config/config.yaml`

修改配置后需要重启服务：

```bash
docker-compose restart basic-search
```

## 数据持久化

所有数据存储在 Docker volumes 中：

- `opensearch-data` - OpenSearch 数据
- `kafka-data` - Kafka 数据
- `redis-data` - Redis 数据
- `basic-search-logs` - 应用日志

查看 volumes：

```bash
docker volume ls | grep dsg
```

## 健康检查

检查所有服务健康状态：

```bash
# OpenSearch
curl http://localhost:9200/_cluster/health

# Hydra
curl http://localhost:4445/health/ready

# Basic-Search
curl http://localhost:8163/health
```

## 常见问题

### 1. 端口冲突

如果端口被占用，可以修改 `docker-compose.yml` 中的端口映射。

### 2. 内存不足

OpenSearch 默认使用 512MB 内存，如果系统内存不足，可以调整：

```yaml
environment:
  - "OPENSEARCH_JAVA_OPTS=-Xms256m -Xmx256m"
```

### 3. 服务启动失败

查看详细日志：

```bash
docker-compose logs basic-search
docker-compose logs opensearch
```

### 4. 清理所有数据

```bash
docker-compose down -v
docker volume prune
```

## 生产环境注意事项

⚠️ **此配置仅适用于开发/测试环境**

生产环境需要：

1. 启用 OpenSearch 安全插件
2. 配置 Kafka 认证
3. 使用外部 Redis 集群
4. 配置 Hydra 使用持久化数据库（PostgreSQL/MySQL）
5. 配置日志收集和监控
6. 使用 Kubernetes 或其他容器编排工具
