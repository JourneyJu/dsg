package menu

import (
	"context"

	"github.com/kweaver-ai/dsg/services/apps/configuration-center/common/models/response"
	"github.com/kweaver-ai/idrm-go-common/rest/authorization"
	"github.com/samber/lo"
)

const DefaultPlatform = 1

type UseCase interface {
	GetMenus(ctx context.Context) (*GetMenusRes, error)
	GetPermissionMenus(ctx context.Context, sessionID string, req *PermissionMenusReq) (*response.PageResults[PermissionMenusRes], error)
	GetResourceMenuKeys(ctx context.Context) ([][]string, error)
	SetMenus(ctx context.Context, req *SetMenusReq) error
}

type GetMenusRes struct {
	Menus []any `json:"menus"` // 菜单列表
}

type PermissionMenusReq struct {
	ID string `json:"id" form:"id" binding:"omitempty"`
	PermissionMenusFixedReq
}

type PermissionMenusFixedReq struct {
	Keyword string `json:"keyword" form:"keyword" binding:"omitempty,max=255"`
	Limit   int    `json:"limit" form:"limit" binding:"omitempty,gt=0"`
	Offset  int    `json:"offset" form:"offset" binding:"omitempty,gt=0"`
}

type PermissionMenusRes struct {
	ID   string `json:"id"`
	Type string `json:"type"`
	Name string `json:"name"`
}

type SetMenusReq struct {
	Router []Mu `json:"router"`
}

type Mu struct {
	Type          string   `json:"type,omitempty"`
	Label         string   `json:"label,omitempty"`
	DomTitle      string   `json:"domtitle,omitempty"`
	Path          string   `json:"path"`
	Key           string   `json:"key,omitempty"`
	LayoutElement string   `json:"layoutElement,omitempty"`
	Module        []string `json:"module,omitempty"`
	Attribute     any      `json:"attribute,omitempty"`
	Element       string   `json:"element,omitempty"`
	Index         bool     `json:"index,omitempty"`
	Hide          bool     `json:"hide,omitempty"`
	Children      []*Mu    `json:"children,omitempty"`
	Actions       []string `json:"actions"`
}

func (m *Mu) Keys() []string {
	if !m.IsPermissionMenu() {
		return []string{}
	}
	keys := []string{m.Key}
	for _, child := range m.Children {
		if !child.IsPermissionMenu() {
			continue
		}
		keys = append(keys, child.Keys()...)
	}
	return keys
}

func (m *Mu) IsPermissionMenu() bool {
	return !(m.Label == "" || m.Hide)
}

func ToPermissionMenus(ms []*Mu) []*PermissionMenusRes {
	return lo.Times(len(ms), func(index int) *PermissionMenusRes {
		return &PermissionMenusRes{
			ID:   ms[index].Key,
			Name: ms[index].Label,
			Type: authorization.RESOURCE_TYPE_MENUS,
		}
	})
}
