package resources

import (
	"github.com/kweaver-ai/idrm-go-common/rest/auth-service"
	"github.com/kweaver-ai/idrm-go-common/rest/authorization"
)

var resourceBodyMap = map[string]*authorization.ResourceConfig{
	authorization.RESOURCE_TYPE_MENUS:       idrmMenus,
	authorization.API_RESOURCE_NAME:         idrmApi,
	authorization.SUB_SERVICE_RESOURCE_NAME: idrmApiRowRule,
}

var idrmMenus = &authorization.ResourceConfig{
	ID:          authorization.RESOURCE_TYPE_MENUS,
	Name:        "iDRM菜单",
	Description: "iDRM菜单资源",
	InstanceUrl: "GET /api/configuration-center/v1/resource/menus?platform=2&limit=1000",
	DataStruct:  "tree",
	Operation: []authorization.ResourceOperation{
		{
			ID:          auth_service.ActionCreate.String,
			Name:        []authorization.ResourceOperationName{{"zh-cn", auth_service.ActionCreate.Display}},
			Description: auth_service.ActionCreate.Display,
			Scope:       []string{"type", "instance"},
		},
		{
			ID:          auth_service.ActionUpdate.String,
			Name:        []authorization.ResourceOperationName{{"zh-cn", auth_service.ActionUpdate.Display}},
			Description: auth_service.ActionUpdate.Display,
			Scope:       []string{"type", "instance"},
		},
		{
			ID:          auth_service.ActionRead.String,
			Name:        []authorization.ResourceOperationName{{"zh-cn", auth_service.ActionRead.Display}},
			Description: auth_service.ActionRead.Display,
			Scope:       []string{"type", "instance"},
		},
		{
			ID:          auth_service.ActionDelete.String,
			Name:        []authorization.ResourceOperationName{{"zh-cn", auth_service.ActionDelete.Display}},
			Description: auth_service.ActionDelete.Display,
			Scope:       []string{"type", "instance"},
		},
		{
			ID:          auth_service.ActionImport.String,
			Name:        []authorization.ResourceOperationName{{"zh-cn", auth_service.ActionImport.Display}},
			Description: auth_service.ActionImport.Display,
			Scope:       []string{"type", "instance"},
		},
		{
			ID:          auth_service.ActionOffline.String,
			Name:        []authorization.ResourceOperationName{{"zh-cn", auth_service.ActionOffline.Display}},
			Description: auth_service.ActionOffline.Display,
			Scope:       []string{"type", "instance"},
		},
		{
			ID:          auth_service.ActionOnline.String,
			Name:        []authorization.ResourceOperationName{{"zh-cn", auth_service.ActionOnline.Display}},
			Description: auth_service.ActionOnline.Display,
			Scope:       []string{"type", "instance"},
		},
	},
}
var idrmApi = &authorization.ResourceConfig{
	ID:          authorization.API_RESOURCE_NAME,
	Name:        "iDRM接口服务",
	Description: "iDRM接口服务的配置信息",
	InstanceUrl: "GET /api/mdl-data-model/v1/resources?resource_type=data_view",
	DataStruct:  "string",
	Operation: []authorization.ResourceOperation{
		{
			ID: "read",
			Name: []authorization.ResourceOperationName{
				{"zh-cn", "读取"},
				{"en-us", "read"},
				{"zh-tw", "读取"},
			},
			Description: "读取或应用接口服务",
			Scope:       []string{"type", "instance"},
		},
		{
			ID: "download",
			Name: []authorization.ResourceOperationName{
				{"zh-cn", "下载"},
				{"en-us", "download"},
				{"zh-tw", "下載"},
			},
			Description: "下载接口服务",
			Scope:       []string{"type", "instance"},
		},
		{
			ID: "auth",
			Name: []authorization.ResourceOperationName{
				{"zh-cn", "授权"},
				{"en-us", "auth"},
				{"zh-tw", "授權"},
			},
			Description: "授权接口服务",
			Scope:       []string{"type", "instance"},
		},
		{
			ID: "allocate",
			Name: []authorization.ResourceOperationName{
				{"zh-cn", "授权仅分配"},
				{"en-us", "allocate"},
				{"zh-tw", "授權僅分配"},
			},
			Description: "授权仅分配接口服务",
			Scope:       []string{"type", "instance"},
		},
	},
}

var idrmApiRowRule = &authorization.ResourceConfig{
	ID:          authorization.SUB_SERVICE_RESOURCE_NAME,
	Name:        "接口限定规则",
	Description: "接口限定规则的配置信息",
	InstanceUrl: "GET /api/mdl-data-model/v1/resources?resource_type=data_view_row_column_rule",
	DataStruct:  "string",
	Operation: []authorization.ResourceOperation{
		{
			ID: "read",
			Name: []authorization.ResourceOperationName{
				{"zh-cn", "读取"},
				{"en-us", "read"},
				{"zh-tw", "读取"},
			},
			Description: "读取或应用接口服务",
			Scope:       []string{"type", "instance"},
		},
		{
			ID: "download",
			Name: []authorization.ResourceOperationName{
				{"zh-cn", "下载"},
				{"en-us", "download"},
				{"zh-tw", "下載"},
			},
			Description: "下载接口服务",
			Scope:       []string{"type", "instance"},
		},
		{
			ID: "auth",
			Name: []authorization.ResourceOperationName{
				{"zh-cn", "授权"},
				{"en-us", "auth"},
				{"zh-tw", "授權"},
			},
			Description: "授权接口服务",
			Scope:       []string{"type", "instance"},
		},
		{
			ID: "allocate",
			Name: []authorization.ResourceOperationName{
				{"zh-cn", "授权仅分配"},
				{"en-us", "allocate"},
				{"zh-tw", "授權僅分配"},
			},
			Description: "授权仅分配接口服务",
			Scope:       []string{"type", "instance"},
		},
	},
}
