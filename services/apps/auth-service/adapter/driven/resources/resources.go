package resources

import (
	"context"
	"github.com/kweaver-ai/idrm-go-common/rest/authorization"
	"github.com/kweaver-ai/idrm-go-frame/core/telemetry/log"
	"runtime"
)

// RegisterClient 资源注册客户端
type RegisterClient struct {
	authorization authorization.Driven
}

func NewRegisterClient(authorization authorization.Driven) *RegisterClient {
	return &RegisterClient{authorization: authorization}
}

// RegisterAll 注册所有资源
func (c *RegisterClient) RegisterAll(ctx context.Context) error {
	//windows下就不注册了
	if runtime.GOOS == "windows" {
		log.Warnf("Warning: Resource registration is not supported on Windows")
		return nil
	}
	for resourceID, resource := range resourceBodyMap {
		resource.ID = ""
		if err := c.authorization.SetResource(ctx, resourceID, resource); err != nil {
			log.Errorf("Warning: Failed to register resource %s: %v", resourceID, err)
			// 继续注册其他资源，不要因为一个失败而停止
			return err
		}
		log.Infof("Successfully registered resource: %s", resourceID)
	}
	////新建义务类型
	//if err := c.authorization.CreateObligationType(ctx, authorization.OBLIGATION_TYPE_IDRM_DATA, obligationTypeReq); err != nil {
	//	log.Errorf("Warning: Failed to register obligation type %s: %v", authorization.OBLIGATION_TYPE_IDRM_DATA, err)
	//	return err
	//}
	////绑定义务类型和资源
	//if _, err := c.authorization.CreatePolicy(ctx, policyConfigReq); err != nil {
	//	log.Errorf("Warning: Failed to bind obligation type %s to resource %s: %v", authorization.OBLIGATION_TYPE_IDRM_DATA, authorization.RESOURCE_TYPE_MENUS, err)
	//	return err
	//}
	return nil
}
