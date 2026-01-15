package v1

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/kweaver-ai/dsg/services/apps/data-view/domain/sub_view"
	"github.com/kweaver-ai/idrm-go-common/errorcode"
	"github.com/kweaver-ai/idrm-go-frame/core/telemetry/trace"
	"github.com/kweaver-ai/idrm-go-frame/core/transport/rest/ginx"
)

// Update 更新指定子视图
//
//	@Description    更新指定子视图
//	@Tags           子视图
//	@Accept         application/json
//	@Produce        application/json
//	@Param          id  path        string              true    "子视图 ID"     Format(uuid)
//	@Param          _   body        sub_view.SubView    true    "请求参数"
//	@Success        200 {object}    sub_view.SubView            "成功响应参数"
//	@Failure        400 {object}    rest.HttpError              "失败响应参数"
//	@Router         /api/v1/data-view/v1/sub-views:id [put]
func (s *SubViewService) Update(c *gin.Context) {
	ctx, span := trace.StartServerSpan(c)
	defer span.End()

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		ginx.ResBadRequestJson(c, errorcode.Detail(errorcode.PublicInvalidParameter, err.Error()))
		return
	}

	var sv = &sub_view.SubView{ID: id}
	if err := c.ShouldBindJSON(sv); err != nil {
		ginx.ResBadRequestJson(c, errorcode.Detail(errorcode.PublicInvalidParameterJson, err.Error()))
		return
	}

	isInternal := strings.Contains(c.Request.URL.Path, "internal")
	if sv, err = s.uc.Update(ctx, sv, isInternal); err != nil {
		resErrJson(c, err)
		return
	}

	ginx.ResOKJson(c, sv)
}
