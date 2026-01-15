package v1

import (
	"github.com/gin-gonic/gin"
	"github.com/kweaver-ai/dsg/services/apps/data-view/common/form_validator"
	"github.com/kweaver-ai/dsg/services/apps/data-view/common/util"
	"github.com/kweaver-ai/dsg/services/apps/data-view/domain/form_view"
	"github.com/kweaver-ai/idrm-go-common/rest/data_view"
	"github.com/kweaver-ai/idrm-go-frame/core/transport/rest/ginx"
)

func (f *FormViewService) GetLogicViewReportInfo(c *gin.Context) {
	req := form_validator.Valid[data_view.GetLogicViewReportInfoReq](c)
	if req == nil {
		return
	}

	res, err := util.TraceA1R2(c, req, f.uc.GetLogicViewReportInfo)
	if err != nil {
		ginx.ResBadRequestJson(c, err)
		return
	}

	ginx.ResOKJson(c, res)
}

func (f *FormViewService) BatchViewsFields(c *gin.Context) {
	req := form_validator.Valid[form_view.GetViewsFieldsReqParameter](c)
	if req == nil {
		return
	}

	res, err := util.TraceA1R2(c, req, f.uc.GetViewsFields)
	if err != nil {
		ginx.ResBadRequestJson(c, err)
		return
	}

	ginx.ResOKJson(c, res)
}

func (f *FormViewService) GetViewBasicInfoByTechnicalName(c *gin.Context) {
	req := form_validator.Valid[form_view.GetViewBasicInfoByNameReqParam](c)
	if req == nil {
		return
	}
	res, err := util.TraceA1R2(c, req, f.uc.GetViewBasicInfoByName)
	if err != nil {
		ginx.ResBadRequestJson(c, err)
		return
	}
	ginx.ResOKJson(c, res)
}

func (f *FormViewService) GetViewListByTechnicalNameInMultiDatasource(c *gin.Context) {
	req := form_validator.Valid[form_view.GetViewListByTechnicalNameInMultiDatasourceReq](c)
	if req == nil {
		return
	}
	res, err := util.TraceA1R2(c, &req.GetViewListByTechnicalNameInMultiDatasourceReq, f.uc.GetViewListByTechnicalNameInMultiDatasource)
	if err != nil {
		ginx.ResBadRequestJson(c, err)
		return
	}
	ginx.ResOKJson(c, res)
}

func (f *FormViewService) GetViewByKey(c *gin.Context) {
	req := form_validator.Valid[form_view.GetViewByKey](c)
	if req == nil {
		return
	}

	res, err := util.TraceA1R2(c, req, f.uc.GetViewByKey)
	if err != nil {
		ginx.ResBadRequestJson(c, err)
		return
	}

	ginx.ResOKJson(c, res)
}

// HasSubViewAuth 检查用户是否有子视图的授权规则
func (f *FormViewService) HasSubViewAuth(c *gin.Context) {
	req := form_validator.Valid[form_view.HasSubViewAuthParamReq](c)
	if req == nil {
		return
	}
	resp, err := f.uc.QueryAuthedSubView(c, req)
	if err != nil {
		ginx.ResBadRequestJson(c, err)
		return
	}
	ginx.ResOKJson(c, resp)
}

// 统计库表总数
func (f *FormViewService) GetTableCount(c *gin.Context) {
	req := form_validator.Valid[form_view.GetViewCountReqParam](c)
	if req == nil {
		return
	}
	res, err := util.TraceA1R2(c, req, f.uc.GetTableCount)
	if err != nil {
		ginx.ResBadRequestJson(c, err)
		return
	}

	ginx.ResOKJson(c, res)
}

// BatchGetExploreReport 批量获取质量得分报告
//
//	@Description	批量获取多个逻辑视图的质量得分报告（内部接口）
//	@Tags			数据探查
//	@Summary		批量获取质量得分报告
//	@Accept			application/json
//	@Produce		application/json
//	@Param			Authorization	header		string							true	"token"
//	@Param			body			body		form_view.BatchGetExploreReportReq	true	"请求参数"
//	@Success		200				{object}	form_view.BatchGetExploreReportResp	"成功响应参数"
//	@Failure		400				{object}	rest.HttpError					"失败响应参数"
//	@Router			/api/internal/data-view/v1/form-view/explore-report/batch [post]
func (f *FormViewService) BatchGetExploreReport(c *gin.Context) {
	req := form_validator.Valid[form_view.BatchGetExploreReportReq](c)
	if req == nil {
		return
	}

	res, err := util.TraceA1R2(c, req, f.uc.BatchGetExploreReport)
	if err != nil {
		ginx.ResBadRequestJson(c, err)
		return
	}

	ginx.ResOKJson(c, res)
}

// 同步统一视图服务视图信息
func (f *FormViewService) Sync(c *gin.Context) {
	go f.uc.Sync(c)
	ginx.ResOKJson(c, nil)
}
