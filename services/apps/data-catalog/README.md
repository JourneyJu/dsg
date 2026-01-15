# 数据目录：data-catalog


## 运行
配置文件在cmd/server/config/config.yml, 确认配置文件的目录都存在，然后运行`go run ./cmd/server/main.go`

## 文档
使用 `make swag`更新文档

## 数据库
### 数据库无缝升级
数据库无缝升级使用的是[github.com/golang-migrate/migrate](https://github.com/golang-migrate/migrate), 目前使用的是命令方式，在项目的makefile文件中有大部分命令，可以直接使用
```shell
$ make hjelp
Targets:
 help                 Show help
 init                 Example: make init; install the dependence of this project
 swag                 Example: make swag;  build project with swagger docs
 wire                 Example: make wire; generate wire dependency
 run                  Example: make update; pull least code, generate least document, then build a executable file
 mc                   Example: make mc name=xxx; then create two sql file with version ahead of the file name
 mu                   Example: make mu v=3;  then execute the sql file which version=3
 md                   Example: make md v=2; then roll back the version 2
 mf                   Example: make mf v=3; change the version in database to 3 in force
```
命令依赖的操作系统环境变量如下：


|环境变量| 说明       | 值  |
|----|----|----|
|MYSQL_HOST| 数据库IP地址  | 127.0.0.1 |
|MYSQL_PORT| 数据库服务的端口 | 3306 |
|MYSQL_USERNAME| 数据库用户名   | root |
|MYSQL_PASSWORD| 数据库密码    | 123 |
|MYSQL_DB| 具体数据库  | demo |


#### 安装migrate工具
[安装文档](https://github.com/golang-migrate/migrate/tree/master/cmd/migrate)；可以去github上找安装文档

#### 添加SQL文件
执行下面命令后，在项目的`infrastructure/repository/db/migration` 文件夹下面生成两个sql文件，然后可以将需要更新的SQL语句写入
```
make mc name=add_column
```
在`.*.up.sql`里面写上更新的语句， 在`.*.down.sql`里面写上回滚SQL语句

#### 执行SQL语句
```shell
make mu 
```
执行下面的命令，将数据更新到最新的版本，如果已经是最新的版本，那么就不执行任何动作，如果想升级到指定的版本，可以添加版本参数
```shell
make mu v=3
```

#### 版本回退
执行下面命令，回退version=3 的内容，回退必须执行版本，否则全部回退，版本回退到0
```shell
make md v=3
```

#### 版本更新
执行下面的命令，数据库版本更新到3
```shell
make mf v=3
```

