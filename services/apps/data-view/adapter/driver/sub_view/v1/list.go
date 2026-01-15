package v1

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/kweaver-ai/dsg/services/apps/data-view/common/form_validator"
	"github.com/kweaver-ai/dsg/services/apps/data-view/domain/sub_view"
	"github.com/kweaver-ai/dsg/services/apps/data-view/domain/sub_view/validation"
	"github.com/kweaver-ai/idrm-go-common/errorcode"
	"github.com/kweaver-ai/idrm-go-frame/core/transport/rest/ginx"
)

// List 获取子视图列表
//
//	@Description    获取子视图列表
//	@Tags           子视图
//	@Accept         application/json
//	@Produce        application/json
//	@Param          logic_view_id   query   string  false   "逻辑视图 ID"   Format(uuid)
//	@Param          offset          query   int     false   "页码"          default(1)
//	@Param          limit           query   int     false   "每页数量"      default(10)
//	@Success        200 {object}    sub_view.SubView    "子视图列表"
//	@Failure        400 {object}    rest.HttpError          "失败响应参数"
//	@Router         /api/v1/data-view/v1/sub-views [get]
func (s *SubViewService) List(c *gin.Context) {
	var err error
	var opts sub_view.ListOptions
	if err = c.ShouldBindQuery(&opts); err != nil {
		ginx.ResBadRequestJson(c, errorcode.Detail(errorcode.PublicInvalidParameter, err.Error()))
		return
	}
	// gin doesn't support bind uuid.UUID from query.
	if v, ok := c.GetQuery("logic_view_id"); ok {
		if opts.LogicViewID, err = uuid.Parse(v); err != nil {
			ginx.ResBadRequestJson(c, errorcode.Detail(errorcode.PublicInvalidParameter, form_validator.ValidError{Key: "logic_view_id", Message: "logic_view_id 必须是一个有效的 UUID"}))
			return
		}
	}

	if err := validation.ValidateListOptions(&opts); err != nil {
		ginx.ResBadRequestJson(c, errorcode.Detail(errorcode.PublicInvalidParameter, form_validator.CreateValidErrorsFromFieldErrorList(err)))
		return
	}

	resp, err := s.uc.List(c, opts)
	if err != nil {
		resErrJson(c, err)
		return
	}

	ginx.ResOKJson(c, resp)
}

// ListID 获取子视图的 ID 列表
//
//	@Description    获取子视图的 ID 列表
//	@Tags           子视图
//	@Produce        application/json
//	@Router         /api/internal/data-view/v1/sub-view-ids [get]
func (s *SubViewService) ListID(c *gin.Context) {
	req := form_validator.Valid[sub_view.ListIDReq](c)
	if req == nil {
		return
	}

	var logicViewID uuid.UUID
	if req.LogicViewID != "" {
		logicViewID = uuid.MustParse(req.LogicViewID)
	}

	resp, err := s.uc.ListID(c, logicViewID)
	if err != nil {
		resErrJson(c, err)
		return
	}

	ginx.ResOKJson(c, resp)
}

func (s *SubViewService) ListSubViews(c *gin.Context) {
	req := form_validator.Valid[sub_view.ListSubViewsReq](c)
	if req == nil {
		return
	}
	ids := strings.Split(req.LogicViewID, ",")

	resp, err := s.uc.ListSubViews(c, ids...)
	if err != nil {
		resErrJson(c, err)
		return
	}

	ginx.ResOKJson(c, resp)
}
