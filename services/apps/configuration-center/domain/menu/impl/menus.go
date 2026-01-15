package impl

import (
	"context"

	jsoniter "github.com/json-iterator/go"
	"github.com/kweaver-ai/dsg/services/apps/configuration-center/adapter/driven/gorm/configuration"
	repo "github.com/kweaver-ai/dsg/services/apps/configuration-center/adapter/driven/gorm/menu"
	"github.com/kweaver-ai/dsg/services/apps/configuration-center/adapter/driven/gorm/permission"
	"github.com/kweaver-ai/dsg/services/apps/configuration-center/adapter/driven/gorm/resource"
	"github.com/kweaver-ai/dsg/services/apps/configuration-center/common/errorcode"
	"github.com/kweaver-ai/dsg/services/apps/configuration-center/common/user_util"
	"github.com/kweaver-ai/dsg/services/apps/configuration-center/domain/menu"
	"github.com/kweaver-ai/dsg/services/apps/configuration-center/domain/user"
	"github.com/kweaver-ai/dsg/services/apps/configuration-center/infrastructure/repository/db/model"
	"github.com/kweaver-ai/idrm-go-common/d_session"
	"github.com/kweaver-ai/idrm-go-common/rest/authorization"
	"github.com/kweaver-ai/idrm-go-frame/core/telemetry/log"
)

type Menu struct {
	repo              repo.MenuRepo
	configurationRepo configuration.Repo
	resource          resource.Repo
	session           d_session.Session
	userDomain        user.UseCase
	permission        permission.Repo
	authDriven        authorization.Driven
}

func InitMenuCase(
	repo repo.MenuRepo,
) menu.UseCase {
	return &Menu{
		repo: repo,
	}
}

func NewUseCase(
	repo repo.MenuRepo,
	configurationRepo configuration.Repo,
	resource resource.Repo,
	session d_session.Session,
	userDomain user.UseCase,
	permission permission.Repo,
	authDriven authorization.Driven,
) menu.UseCase {
	return &Menu{
		repo:              repo,
		configurationRepo: configurationRepo,
		resource:          resource,
		session:           session,
		userDomain:        userDomain,
		permission:        permission,
		authDriven:        authDriven,
	}
}

type MenuFilter func(ctx context.Context, userID string) (map[string]bool, error)

type MenuActions func(ctx context.Context, userID string) (map[string][]string, error)

func (m *Menu) GetMenus(ctx context.Context) (*menu.GetMenusRes, error) {
	userInfo, err := user_util.GetUserInfo(ctx)
	if err != nil {
		return nil, err
	}
	uid := userInfo.ID
	menus, err := m.repo.GetMenusByPlatform(ctx, 1)
	if err != nil {
		return nil, errorcode.Detail(errorcode.PublicDatabaseError, err.Error())
	}
	filter, err := m.getUserMenuActionMap(ctx, uid)
	if err != nil {
		return nil, err
	}
	res := make([]any, 0, len(menus))
	for _, mu := range menus {
		ms := menu.Mu{}
		if err = jsoniter.Unmarshal([]byte(mu.Value), &ms); err != nil {
			return nil, errorcode.Detail(errorcode.PublicInternalError, err.Error())
		}
		has := filter.FilterMenu(&ms)
		if !has {
			continue
		}
		res = append(res, ms)
	}
	return &menu.GetMenusRes{
		Menus: res,
	}, nil
}

func (m *Menu) getUserMenuActionMap(ctx context.Context, userID string) (*MenuActionsFilter, error) {
	//获取所有的菜单
	menus, err := m.repo.GetMenusByPlatform(ctx, 1)
	if err != nil {
		return nil, errorcode.Detail(errorcode.PublicDatabaseError, err.Error())
	}
	muKeys := make([]string, 0)
	for _, mu := range menus {
		ms := menu.Mu{}
		if err = jsoniter.Unmarshal([]byte(mu.Value), &ms); err != nil {
			return nil, errorcode.Detail(errorcode.PublicInternalError, err.Error())
		}
		muKeys = append(muKeys, ms.Keys()...)
	}
	//获取所有菜单的操作
	resources := make([]authorization.ResourceObject, 0, len(menus))
	for _, key := range muKeys {
		resources = append(resources, authorization.ResourceObject{
			Type: authorization.RESOURCE_TYPE_MENUS,
			ID:   key,
		})
	}
	//组装参数
	args := &authorization.GetResourceOperationsArgs{
		Method: "GET",
		Accessor: authorization.Accessor{
			ID:   userID,
			Type: authorization.ACCESSOR_TYPE_USER,
		},
		Resources: resources,
	}
	resourceOperations, err := m.authDriven.GetResourceOperations(ctx, args)
	if err != nil {
		log.Errorf("GetAccessorPolicy error %v", err.Error())
		return nil, err
	}
	ops := make(map[string][]string)
	for _, obj := range resourceOperations {
		ops[obj.ID] = append(ops[obj.ID], obj.Operation...)
	}
	return NewMenuFilter(ops), nil
}

func (m *Menu) SetMenus(ctx context.Context, req *menu.SetMenusReq) error {
	err := m.repo.Truncate(ctx)
	if err != nil {
		return errorcode.Detail(errorcode.PublicDatabaseError, err.Error())
	}
	//增加额外的智能问数按钮
	req.Router = append(req.Router, alterMenus...)
	menus := make([]*model.Menu, 0)
	for _, router := range req.Router {
		marshal, _ := jsoniter.Marshal(router)
		menus = append(menus, &model.Menu{
			Platform: menu.DefaultPlatform,
			Value:    string(marshal),
		})
	}
	if len(menus) != 0 {
		err = m.repo.CreateBatch(ctx, menus)
		if err != nil {
			return errorcode.Detail(errorcode.PublicDatabaseError, err.Error())
		}
	}
	return nil
}
