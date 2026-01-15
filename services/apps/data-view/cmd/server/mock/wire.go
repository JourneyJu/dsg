//go:build wireinject
// +build wireinject

package mock

import (
	"github.com/google/wire"

	driven "github.com/kweaver-ai/dsg/services/apps/data-view/adapter/driven"
	"github.com/kweaver-ai/dsg/services/apps/data-view/adapter/driver"
	data_lineage "github.com/kweaver-ai/dsg/services/apps/data-view/adapter/driver/data_lineage/v1"
	data_privacy_policy "github.com/kweaver-ai/dsg/services/apps/data-view/adapter/driver/data_privacy_policy/v1"
	explore_task "github.com/kweaver-ai/dsg/services/apps/data-view/adapter/driver/explore_task/v1"
	form_view "github.com/kweaver-ai/dsg/services/apps/data-view/adapter/driver/form_view/v1"
	logic_view "github.com/kweaver-ai/dsg/services/apps/data-view/adapter/driver/logic_view/v1"
	"github.com/kweaver-ai/dsg/services/apps/data-view/adapter/driver/middleware/mock"
	"github.com/kweaver-ai/dsg/services/apps/data-view/adapter/driver/mq"
	"github.com/kweaver-ai/dsg/services/apps/data-view/adapter/driver/mq/datasource"
	data_explore "github.com/kweaver-ai/dsg/services/apps/data-view/adapter/driver/mq/explore"
	explore "github.com/kweaver-ai/dsg/services/apps/data-view/adapter/driver/mq/explore_task"
	driverKafka "github.com/kweaver-ai/dsg/services/apps/data-view/adapter/driver/mq/kafka"
	sub_view "github.com/kweaver-ai/dsg/services/apps/data-view/adapter/driver/sub_view/v1"
	"github.com/kweaver-ai/dsg/services/apps/data-view/common/app"
	"github.com/kweaver-ai/dsg/services/apps/data-view/common/initialization"
	domain "github.com/kweaver-ai/dsg/services/apps/data-view/domain"
	"github.com/kweaver-ai/dsg/services/apps/data-view/infrastructure/cache"
	my_config "github.com/kweaver-ai/dsg/services/apps/data-view/infrastructure/config"
	"github.com/kweaver-ai/dsg/services/apps/data-view/infrastructure/db"
	"github.com/kweaver-ai/dsg/services/apps/data-view/infrastructure/mq/kafka"
)

func InitApp(conf *my_config.Bootstrap) (*app.AppRunner, func(), error) {
	panic(wire.Build(
		initialization.InitAuditLog,
		driven.MockSet,
		driver.Set,
		domain.Set,
		infrastructureSet,
		app.NewApp,
		app.NewAppRunner,
		app.ToTransportServer,
	))
}

var driverSet = wire.NewSet(
	driver.NewRouter,
	driver.NewHttpEngine,
	mock.NewMiddleware,
	form_view.NewFormViewService,
	logic_view.NewLogicViewService,
	data_explore.NewDataExplorationHandler,
	sub_view.NewSubViewService,
	explore.NewExploreTaskHandler,
	data_privacy_policy.NewDataPrivacyPolicyService,
	//mq
	datasource.NewDataSourceConsumer,
	//mq.NewKafkaConsumer,
	driverKafka.NewKafkaProducer,
	data_lineage.NewFormViewService,
	explore_task.NewExploreTaskService,
	driverKafka.NewConsumerClient,
	mq.NewMQHandler,
)

var infrastructureSet = wire.NewSet(
	db.NewDB,
	kafka.NewSyncProducer,
	kafka.NewConsumerGroupMock,
	cache.NewRedisMock,
)
