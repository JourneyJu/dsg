package main

import (
	"context"
	"flag"

	"github.com/kweaver-ai/dsg/services/apps/data-view/common/form_validator"
	"github.com/kweaver-ai/dsg/services/apps/data-view/common/initialization"
	my_config "github.com/kweaver-ai/dsg/services/apps/data-view/infrastructure/config"
	"github.com/kweaver-ai/idrm-go-frame/core/config"
	"github.com/kweaver-ai/idrm-go-frame/core/logx/zapx"
)

var (
	Addr     string
	confPath string
)

func init() {
	flag.StringVar(&confPath, "confPath", "cmd/server/config/", "config path, eg: -conf config.yaml")
	flag.StringVar(&Addr, "addr", ":8133", "config path, eg: -addr 0.0.0.0:8123")
}

// @title       data-view
// @version     1.0.0.0
// @description AnyFabric data view
// @BasePath    /api/data-view/v1
func main() {
	flag.Parse()
	config.InitSources(confPath)

	bc := config.Scan[my_config.Bootstrap]()
	logConfig := config.Scan[zapx.LogConfigs]()
	// 初始化AR日志+Tracer
	tracerProvider := initialization.InitTraceAndLog(logConfig, &bc)
	defer func() {
		if err := tracerProvider.Shutdown(context.Background()); err != nil {
			panic(err)
		}
	}()
	//初始化验证器配置
	if err := form_validator.SetupValidator(); err != nil {
		panic(err)
	}
	//app, cleanup, err := mock.InitApp(&bc)
	app, cleanup, err := InitApp(&bc)
	if err != nil {
		panic(err)
	}
	defer cleanup()
	if err = app.WFStarter.Start(); err != nil {
		panic(err)
	}

	// start and wait for stop signal
	if err = app.Run(); err != nil {
		panic(err)
	}
}
