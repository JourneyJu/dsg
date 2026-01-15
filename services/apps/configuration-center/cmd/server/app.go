package main

import (
	"github.com/kweaver-ai/dsg/services/apps/configuration-center/adapter/driven/callbacks"
	"github.com/kweaver-ai/dsg/services/apps/configuration-center/adapter/driver/mq/impl"
	"github.com/kweaver-ai/idrm-go-common/workflow"
	wf_go "github.com/kweaver-ai/idrm-go-common/workflow"
	goFrame "github.com/kweaver-ai/idrm-go-frame"
	"github.com/kweaver-ai/idrm-go-frame/core/transport/rest"
)

type MainArgs struct {
	Name       string //服务名称
	Version    string //系统版本
	ConfigPath string //配置文件地址
	Addr       string //监听地址
}

type AppRunner struct {
	App       *goFrame.App
	Mq        impl.MQ
	Callbacks *callbacks.Transports
	wfs       wf_go.WFStarter
}

func newApp(hs *rest.Server, wf workflow.WorkflowInterface) *goFrame.App {
	return goFrame.New(
		goFrame.Name(arg.Name),
		goFrame.Server(hs, &wrappedWorkflow{wf: wf}),
	)
}
func NewAppRunner(
	app *goFrame.App,
	mq impl.MQ,
	cs *callbacks.Transports,
	wfs wf_go.WFStarter,
) *AppRunner {
	return &AppRunner{
		App:       app,
		Mq:        mq,
		Callbacks: cs,
		wfs:       wfs,
	}
}

func (a *AppRunner) Run() error {
	// start consumer MQ
	a.Callbacks.Register()
	if err := a.wfs.Start(); err != nil {
		return err
	}
	return a.App.Run()
}
