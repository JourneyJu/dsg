//go:build wireinject
// +build wireinject

// The build tag makes sure the stub is not built in the final build.

package main

import (
	"github.com/google/wire"
	driven "github.com/kweaver-ai/dsg/services/apps/data-view/adapter/driven"
	driver "github.com/kweaver-ai/dsg/services/apps/data-view/adapter/driver"
	"github.com/kweaver-ai/dsg/services/apps/data-view/common/app"
	"github.com/kweaver-ai/dsg/services/apps/data-view/common/initialization"
	domain "github.com/kweaver-ai/dsg/services/apps/data-view/domain"
	infrastructure "github.com/kweaver-ai/dsg/services/apps/data-view/infrastructure"
	my_config "github.com/kweaver-ai/dsg/services/apps/data-view/infrastructure/config"
)

// var appRunnerSet = wire.NewSet(wire.Struct(new(go_frame.App), "*"))
//var appRunnerSet = wire.NewSet(wire.Struct(new(AppRunner), "*"))

func InitApp(conf *my_config.Bootstrap) (*app.AppRunner, func(), error) {
	panic(wire.Build(
		initialization.InitAuditLog,
		driven.Set,
		driver.Set,
		domain.Set,
		infrastructure.Set,
		app.NewApp,
		app.NewAppRunner,
		app.ToTransportServer,
	))
}
