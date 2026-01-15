//go:build wireinject
// +build wireinject

// The build tag makes sure the stub is not built in the final build.

package mock

import (
	"github.com/google/wire"
	"github.com/kweaver-ai/dsg/services/apps/configuration-center/adapter/driven/callbacks"
	"github.com/kweaver-ai/dsg/services/apps/configuration-center/adapter/driven/gorm"
	configuration "github.com/kweaver-ai/dsg/services/apps/configuration-center/adapter/driven/mq/configuration/impl"
	datasource "github.com/kweaver-ai/dsg/services/apps/configuration-center/adapter/driven/mq/datasource/impl"
	"github.com/kweaver-ai/dsg/services/apps/configuration-center/adapter/driven/rest/data_subject"
	hydraV6 "github.com/kweaver-ai/dsg/services/apps/configuration-center/adapter/driven/rest/hydra/v6"
	"github.com/kweaver-ai/dsg/services/apps/configuration-center/adapter/driven/rest/sszd_service"
	"github.com/kweaver-ai/dsg/services/apps/configuration-center/adapter/driven/rest/standardization"
	"github.com/kweaver-ai/dsg/services/apps/configuration-center/adapter/driven/rest/user_management"
	"github.com/kweaver-ai/dsg/services/apps/configuration-center/adapter/driven/rest/virtualization_engine"
	workflow "github.com/kweaver-ai/dsg/services/apps/configuration-center/adapter/driven/rest/workflow/impl"
	sharemanagement "github.com/kweaver-ai/dsg/services/apps/configuration-center/adapter/driven/thrift/sharemgnt"
	"github.com/kweaver-ai/dsg/services/apps/configuration-center/adapter/driver"
	"github.com/kweaver-ai/dsg/services/apps/configuration-center/adapter/driver/middleware"
	"github.com/kweaver-ai/dsg/services/apps/configuration-center/adapter/driver/mq/impl"
	"github.com/kweaver-ai/dsg/services/apps/configuration-center/domain"
	"github.com/kweaver-ai/dsg/services/apps/configuration-center/infrastructure"
	"github.com/kweaver-ai/dsg/services/apps/configuration-center/infrastructure/conf"
	"github.com/kweaver-ai/dsg/services/apps/configuration-center/infrastructure/repository/db"
	gocephclient "github.com/kweaver-ai/idrm-go-common/go-ceph-client"
	goFrame "github.com/kweaver-ai/idrm-go-frame"
	af_trace "github.com/kweaver-ai/idrm-go-frame/core/telemetry/trace"
	"github.com/kweaver-ai/idrm-go-frame/core/transport/rest"
	"github.com/kweaver-ai/idrm-go-frame/core/utils/httpclient"
	"github.com/redis/go-redis/v9"
)

var appRunnerSet = wire.NewSet(wire.Struct(new(AppRunner), "*"))

func InitAppMock(*conf.Server, *db.Database, *redis.Options) (*AppRunner, func(), error) {
	panic(wire.Build(
		driverSet,
		drivenSet,
		domain.Set,
		infrastructure.Set,
		newApp,
		appRunnerSet))
}

func newApp(hs *rest.Server) *goFrame.App {
	return goFrame.New(
		goFrame.Name("af_configuration_center"),
		goFrame.Server(hs),
	)
}

type AppRunner struct {
	App *goFrame.App
	Mq  impl.MQ
}

var driverSet = wire.NewSet(
	driver.NewHttpServer,
	middleware.NewMiddlewareMock,
	driver.RouterSet,
	driver.ServiceProviderSet,
)

var drivenSet = wire.NewSet(
	gorm.RepositoryProviderSet,
	gocephclient.NewCephClient,
	//http_client.NewRawHTTPClient,
	af_trace.NewOtelHttpClient,
	httpclient.NewMiddlewareHTTPClient,
	hydraV6.NewHydra,
	user_management.NewUserMgnt,
	//business_grooming.NewBusinessGrooming,
	virtualization_engine.NewVirtualizationEngine,
	datasource.NewMQHandleInstance,
	configuration.NewMQHandleInstance,
	sharemanagement.NewDriven,
	standardization.NewStandardization,
	data_subject.NewDataSubject,

	callbacks.NewTransport,
	callbacks.NewEntityChangeTransport,

	workflow.NewWorkflow,
	sszd_service.NewSszdService,
)
