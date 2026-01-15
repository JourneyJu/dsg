package v1

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/kweaver-ai/dsg/services/apps/data-view/adapter/driven/mq/es"
	"github.com/kweaver-ai/dsg/services/apps/data-view/adapter/driven/rest/configuration_center"
	"github.com/kweaver-ai/dsg/services/apps/data-view/adapter/driven/rest/mdl_data_model"
	my_errorcode "github.com/kweaver-ai/dsg/services/apps/data-view/common/errorcode"
	"github.com/kweaver-ai/idrm-go-common/errorcode"
	"github.com/kweaver-ai/idrm-go-frame/core/errorx/agerrors"
	"github.com/kweaver-ai/idrm-go-frame/core/telemetry/log"
	"github.com/samber/lo"
	"go.uber.org/zap"

	"github.com/kweaver-ai/dsg/services/apps/data-view/common/constant"
	"github.com/kweaver-ai/dsg/services/apps/data-view/common/util"
	"github.com/kweaver-ai/dsg/services/apps/data-view/domain/form_view"
	"github.com/kweaver-ai/dsg/services/apps/data-view/infrastructure/db/model"
	"github.com/kweaver-ai/idrm-go-common/rest/data_view"
	"github.com/kweaver-ai/idrm-go-frame/core/enum"
)

func (f *formViewUseCase) GetLogicViewReportInfo(ctx context.Context, req *data_view.GetLogicViewReportInfoReq) (*data_view.GetLogicViewReportInfoRes, error) {
	reportInfos := make(map[string]*data_view.ReportInfo)
	viewIdMap := make(map[string]string, 0)
	viewIds := make([]string, len(req.FieldIds))
	datasourceIds := make([]string, 0)
	viewIdDatasourceIdMap := make(map[string]string, 0)

	for i, fieldId := range req.FieldIds {
		viewField, err := f.fieldRepo.GetField(ctx, fieldId)
		if err != nil {
			return nil, err
		}
		if _, exist := viewIdMap[fieldId]; !exist {
			viewIdMap[fieldId] = viewField.FormViewID
		}
		viewIds[i] = viewField.FormViewID
		reportInfos[fieldId] = &data_view.ReportInfo{
			FieldTechnicalName: viewField.TechnicalName,
		}
	}
	views, err := f.repo.GetByIds(ctx, util.DuplicateStringRemoval(viewIds))
	if err != nil {
		return nil, err
	}
	for _, view := range views {
		if view.Type == constant.FormViewTypeDatasource.Integer.Int32() {
			datasourceIds = append(datasourceIds, view.DatasourceID)
			viewIdDatasourceIdMap[view.ID] = view.DatasourceID
		}
	}
	modelDatasource, err := f.datasourceRepo.GetByIds(ctx, util.DuplicateStringRemoval(datasourceIds))
	if err != nil {
		return nil, err
	}
	datasourceMap := make(map[string]*model.Datasource)
	for _, datasource := range modelDatasource {
		datasourceMap[datasource.ID] = datasource
	}
	for _, fieldId := range req.FieldIds {
		if datasourceId, exist := viewIdDatasourceIdMap[viewIdMap[fieldId]]; exist {
			reportInfos[fieldId].DatasourceSchema = datasourceMap[datasourceId].Schema
			reportInfos[fieldId].DatasourceId = datasourceId
		}
	}
	return &data_view.GetLogicViewReportInfoRes{
		ReportInfos: reportInfos,
	}, nil

}

func (f *formViewUseCase) GetViewListByTechnicalNameInMultiDatasource(ctx context.Context, req *data_view.GetViewListByTechnicalNameInMultiDatasourceReq) (*data_view.GetViewListByTechnicalNameInMultiDatasourceRes, error) {
	var err error
	var formViews []*model.FormView
	formViewTotal := make([]*model.FormView, 0)
	dids := make([]string, 0)
	for _, datasource := range req.Datasource {
		if len(datasource.OriginalName) > 0 {
			formViews, err = f.repo.GetViewsByDIdOriginalName(ctx, datasource.DatasourceID, datasource.OriginalName)
		} else {
			formViews, err = f.repo.GetViewsByDIdName(ctx, datasource.DatasourceID, datasource.TechnicalName)
		}
		if err != nil {
			return nil, err
		}
		for _, formView := range formViews {
			dids = append(dids, formView.DatasourceID)
		}
		formViewTotal = append(formViewTotal, formViews...)
	}
	datasourceMap, err := f.GetDatasourceMap(ctx, util.DuplicateStringRemoval(dids))
	if err != nil {
		return nil, err
	}
	res := make([]*data_view.FormView, 0)
	for _, formView := range formViewTotal {
		tmp := &data_view.FormView{
			ID:                 formView.ID,
			UniformCatalogCode: formView.UniformCatalogCode,
			TechnicalName:      formView.TechnicalName,
			OriginalName:       formView.OriginalName,
			BusinessName:       formView.BusinessName,
			Type:               enum.ToString[constant.FormViewType](formView.Type),
			DatasourceId:       formView.DatasourceID,
			Status:             enum.ToString[constant.FormViewScanStatus](formView.Status),
			OnlineStatus:       formView.OnlineStatus,
			AuditAdvice:        formView.AuditAdvice,
			EditStatus:         enum.ToString[constant.FormViewEditStatus](formView.EditStatus),
		}
		if d, exist := datasourceMap[formView.DatasourceID]; exist {
			tmp.Datasource = d.Name
			tmp.DatasourceType = d.TypeName
			tmp.DatasourceCatalogName = d.CatalogName
			tmp.ViewSourceCatalogName = d.DataViewSource
		}
		if formView.OnlineTime != nil {
			tmp.OnlineTime = formView.OnlineTime.UnixMilli()
		}
		if formView.PublishAt != nil {
			tmp.PublishAt = formView.PublishAt.UnixMilli()
		}
		res = append(res, tmp)

	}

	return &data_view.GetViewListByTechnicalNameInMultiDatasourceRes{
		FormViews: res,
	}, nil
}

func (f *formViewUseCase) GetViewByKey(ctx context.Context, req *form_view.GetViewByKey) (*form_view.FormViewSimpleInfo, error) {
	data, err := f.repo.GetViewByKey(ctx, req.Key)
	if err != nil {
		return nil, err
	}
	return &form_view.FormViewSimpleInfo{
		ID:            data.ID,
		BusinessName:  data.BusinessName,
		TechnicalName: data.TechnicalName,
		OwnerID:       data.OwnerId.String,
	}, nil
}

func (f *formViewUseCase) QueryAuthedSubView(ctx context.Context, req *form_view.HasSubViewAuthParamReq) ([]string, error) {
	viewIDSlice := strings.Split(req.ViewID, ",")
	ds, err := f.repo.UserAuthedViews(ctx, req.UserID, viewIDSlice...)
	if err != nil {
		return nil, err
	}
	return lo.Uniq(lo.Times(len(ds), func(index int) string {
		return ds[index].ViewID
	})), nil
}

func (f *formViewUseCase) Sync(ctx context.Context) {
	ctx = context.Background()
	views, err := f.DrivenMdlDataModel.GetDataViews(ctx)
	if err != nil {
		return
	}
	viewMap := make(map[string]*mdl_data_model.DataViewInfo)
	viewIds := make([]string, 0)
	for _, view := range views.Entries {
		viewMap[view.Id] = view
		viewIds = append(viewIds, view.Id)
	}
	viewInfos, err := f.DrivenMdlDataModel.GetDataView(ctx, viewIds)
	if err != nil {
		return
	}
	err = f.CompareFormView(ctx, viewMap, viewInfos)
	if err != nil {
		return
	}
}

func (f *formViewUseCase) CompareFormView(ctx context.Context, viewMap map[string]*mdl_data_model.DataViewInfo, tables []*mdl_data_model.GetDataViewResp) error {
	formViews, err := f.repo.GetAllFormView(ctx)
	if err != nil {
		return errorcode.Detail(my_errorcode.DatabaseError, err.Error())
	}
	formViewsMap := make(map[string]*FormViewFlag)
	formViewInfosMap := make(map[string]*FormViewFlag)
	for _, formView := range formViews {
		if formView.MdlID != "" {
			formViewsMap[formView.MdlID] = &FormViewFlag{FormView: formView, flag: 1}
		} else {
			tmp := fmt.Sprintf("%s %s", formView.DatasourceID, formView.TechnicalName)
			formViewInfosMap[tmp] = &FormViewFlag{FormView: formView, flag: 1}
		}
	}

	// 需要的逻辑视图编码的数量
	var uniformCatalogCodeCount int
	for _, table := range tables {
		if flag := formViewsMap[table.Id]; flag != nil && flag.UniformCatalogCode != "" {
			continue
		}
		uniformCatalogCodeCount++
	}

	// 生成逻辑视图的编码
	codeList, err := f.configurationCenterDrivenNG.Generate(ctx, CodeGenerationRuleUUIDDataView, uniformCatalogCodeCount)
	if agerrors.Code(err).GetErrorCode() == "ConfigurationCenter.CodeGenerationRule.NotFound" {
		// 找不到对应编码生成规则，说明 configuration-center 可能没有升级，兼容
		// 处理，逻辑视图的编码设置为空。当 configuration-center 完成升级后可再
		// 次设置编码
		//
		// 兼容处理仅限于 2.0.0.1 一个版本，2.0.0.2 时移除这此兼容处理
		log.WithContext(ctx).Warn("generate code for data view fail", zap.Error(err), zap.Stringer("rule", CodeGenerationRuleUUIDDataView), zap.Int("count", len(tables)))
		codeList = &configuration_center.CodeList{Entries: make([]string, len(tables))}
	} else if err != nil {
		log.WithContext(ctx).Error("generate code for data view fail", zap.Error(err), zap.Stringer("rule", CodeGenerationRuleUUIDDataView), zap.Int("count", len(tables)))
		return err
	}

	var codeListIndex int
	for _, table := range tables {
		tmp := fmt.Sprintf("%s %s", table.DataSourceId, table.TechnicalName)
		if formViewsMap[table.Id] == nil && formViewInfosMap[tmp] == nil {
			if err = f.newFormView(ctx, codeList.Entries[codeListIndex], viewMap, table); err != nil {
				return err
			}
			codeListIndex++
		} else {
			//exist , form update or not form update (by field)
			var newUniformCatalogCode bool
			if newUniformCatalogCode = formViewsMap[table.Id].FormView.UniformCatalogCode == ""; newUniformCatalogCode {
				formViewsMap[table.Id].FormView.UniformCatalogCode = codeList.Entries[codeListIndex]
				codeListIndex++
			}
			var formView *model.FormView
			if formViewsMap[table.Id] != nil {
				formView = formViewsMap[table.Id].FormView
			} else {
				formView = formViewInfosMap[tmp].FormView
			}
			if err = f.updateFormView(ctx, formView, table, newUniformCatalogCode); err != nil {
				return err
			}
			formViewsMap[table.Id].flag = 2
		}
	}

	err = f.deleteFormView(ctx, formViewsMap)
	if err != nil {
		return err
	}
	return nil
}

func (f *formViewUseCase) newFormView(ctx context.Context, uniformCatalogCode string, viewMap map[string]*mdl_data_model.DataViewInfo, table *mdl_data_model.GetDataViewResp) (err error) {
	formViewId := uuid.New().String()
	fields := make([]*model.FormViewField, len(table.Fields))
	fieldObjs := make([]*es.FieldObj, len(table.Fields)) // 发送ES消息字段列表
	var selectField string
	for i, field := range table.Fields {
		fields[i] = &model.FormViewField{
			FormViewID:       formViewId,
			TechnicalName:    field.Name,
			BusinessName:     field.DisplayName,
			OriginalName:     field.OriginalName,
			Comment:          sql.NullString{String: util.CutStringByCharCount(field.Comment, constant.CommentCharCountLimit), Valid: true},
			Status:           constant.FormViewNew.Integer.Int32(),
			PrimaryKey:       sql.NullBool{Bool: false, Valid: true},
			DataType:         field.Type,
			DataLength:       field.DataLength,
			DataAccuracy:     ToDataAccuracy(&field.DataAccuracy),
			OriginalDataType: field.Type,
			IsNullable:       field.IsNullable,
			Index:            i + 1,
		}
		fieldObjs[i] = &es.FieldObj{
			FieldNameZH: fields[i].BusinessName,
			FieldNameEN: fields[i].TechnicalName,
		}
		selectField = util.CE(selectField == "", util.QuotationMark(field.Name), fmt.Sprintf("%s,%s", selectField, util.QuotationMark(field.Name))).(string)
	}
	formView := &model.FormView{
		ID:                 formViewId,
		UniformCatalogCode: uniformCatalogCode,
		TechnicalName:      table.TechnicalName,
		BusinessName:       table.Name,
		OriginalName:       table.TechnicalName,
		Type:               constant.FormViewTypeDatasource.Integer.Int32(),
		DatasourceID:       viewMap[table.Id].DataSourceId,
		Status:             constant.FormViewNew.Integer.Int32(),
		EditStatus:         constant.FormViewDraft.Integer.Int32(),
		Comment:            sql.NullString{String: util.CutStringByCharCount(table.Comment, constant.CommentCharCountLimit), Valid: true},
		CreatedByUID:       table.Creator.ID,
		UpdatedByUID:       table.Updater.ID,
		MdlID:              table.Id,
	}

	tx := f.repo.Db().WithContext(ctx).Begin()
	//createSql := fmt.Sprintf("select %s from %s.%s.%s", selectField, dataSource.CatalogName, util.QuotationMark(dataSource.Schema), util.QuotationMark(table.Name))
	if err = f.repo.CreateFormAndField(ctx, formView, fields, "", tx); err != nil {
		log.WithContext(ctx).Error("【ScanDataSource】createView  DatabaseError", zap.Error(err))
		tx.Rollback()
		return errorcode.Detail(my_errorcode.DatabaseError, err.Error())
	}
	if err = f.esRepo.PubToES(ctx, formView, fieldObjs); err != nil { //扫描创建元数据视图
		tx.Rollback()
		return err
	}
	if err = tx.Commit().Error; err != nil {
		return errorcode.Detail(my_errorcode.DatabaseError, err.Error())
	}
	return nil
}

func (f *formViewUseCase) updateFormView(ctx context.Context, formView *model.FormView, table *mdl_data_model.GetDataViewResp, newUniformCatalogCode bool) (err error) {
	fieldList, err := f.fieldRepo.GetFormViewFieldList(ctx, formView.ID)
	if err != nil {
		return err
	}

	newFields := make([]*model.FormViewField, 0)
	updateFields := make([]*model.FormViewField, 0)
	deleteFields := make([]string, 0)

	fieldMap := make(map[string]*FormViewFieldFlag)
	for _, field := range fieldList {
		fieldMap[field.TechnicalName] = &FormViewFieldFlag{FormViewField: field, flag: 1}
	}
	formViewModify := false
	fieldNewOrDelete := false
	fieldObjs := make([]*es.FieldObj, len(table.Fields)) // 发送ES消息字段列表
	var selectFields string
	for i, field := range table.Fields {
		fieldObjs[i] = &es.FieldObj{
			FieldNameEN: field.Name,
		}
		if fieldMap[field.Name] == nil {
			//field new
			newField := &model.FormViewField{
				FormViewID:       formView.ID,
				TechnicalName:    field.Name,
				BusinessName:     field.DisplayName,
				OriginalName:     field.OriginalName,
				Comment:          sql.NullString{String: util.CutStringByCharCount(field.Comment, constant.CommentCharCountLimit), Valid: true},
				Status:           constant.FormViewFieldNew.Integer.Int32(),
				PrimaryKey:       sql.NullBool{Bool: false, Valid: true},
				DataType:         field.Type,
				DataLength:       field.DataLength,
				DataAccuracy:     ToDataAccuracy(&field.DataAccuracy),
				OriginalDataType: field.Type,
				IsNullable:       field.IsNullable,
				Index:            i + 1,
			}
			newFields = append(newFields, newField)
			formViewModify = true
			fieldNewOrDelete = true
			fieldObjs[i].FieldNameZH = newField.BusinessName
			if newField.DataType == "" { //不支持的类型设置状态，跳过创建
				newField.Status = constant.FormViewFieldNotSupport.Integer.Int32()
			} else {
				selectFields = util.CE(selectFields == "", util.QuotationMark(field.Name), fmt.Sprintf("%s,%s", selectFields, util.QuotationMark(field.Name))).(string)
			}
		} else {
			// field update
			oldField := fieldMap[field.Name]
			switch {
			case oldField.Status == constant.FormViewFieldDelete.Integer.Int32(): //删除的反转为新增
				log.WithContext(ctx).Infof("FormViewFieldDelete status Reversal", zap.String("oldField ID", oldField.ID))
				updateFields = append(updateFields, &model.FormViewField{ID: oldField.ID, Status: constant.FormViewFieldNew.Integer.Int32(), Index: i + 1})
				formViewModify = true
			case oldField.Comment.String != field.Comment: //不变状态
				oldField.FormViewField.Index = i + 1
				oldField.FormViewField.Comment = sql.NullString{String: util.CutStringByCharCount(field.Comment, constant.CommentCharCountLimit), Valid: true}
				updateFields = append(updateFields, oldField.FormViewField)
			case oldField.Index != i+1:
				oldField.FormViewField.Index = i + 1
				updateFields = append(updateFields, oldField.FormViewField)
			default: //field not update
			}
			fieldMap[field.Name].flag = 2
			fieldObjs[i].FieldNameZH = field.DisplayName
		}
	}
	for _, field := range fieldMap {
		if field.flag == 1 {
			//field delete
			deleteFields = append(deleteFields, field.ID)
			formViewModify = true
			fieldNewOrDelete = true
		}
	}

	if formView.MdlID == "" {
		formView.MdlID = table.Id
	}
	formViewUpdate := formView.Comment.String != table.Comment || formView.OriginalName != table.TechnicalName
	if formViewUpdate {
		formView.Comment = sql.NullString{String: util.CutStringByCharCount(table.Comment, constant.CommentCharCountLimit), Valid: true}
		formView.OriginalName = table.TechnicalName
	}
	var query string
	if formViewModify { //表的字段有变化
		if formView.EditStatus == constant.FormViewLatest.Integer.Int32() {
			formView.EditStatus = constant.FormViewDraft.Integer.Int32() //有修改，全部Draft
			formViewUpdate = true
		}
		if formView.Status == constant.FormViewUniformity.Integer.Int32() || formView.Status == constant.FormViewNew.Integer.Int32() {
			formViewUpdate = true
		}
	} else { //表的字段无变化
		if formView.Status == constant.FormViewNew.Integer.Int32() || formView.Status == constant.FormViewModify.Integer.Int32() {
			formViewUpdate = true
		}
		//草稿状态视图保持扫描状态
	}
	if formView.Status == constant.FormViewDelete.Integer.Int32() { //删除状态又找到
		log.WithContext(ctx).Infof("FormViewDelete status Reversal", zap.String("formView ID", formView.ID))
		formView.EditStatus = constant.FormViewDraft.Integer.Int32()
		formViewUpdate = true
	}
	formView.Status = enum.ToInteger[constant.FormViewScanStatus](table.Status).Int32()
	formView.BusinessName = table.Name
	if len(newFields) != 0 || len(updateFields) != 0 || len(deleteFields) != 0 { //字段及表都修改
		formView.UpdatedByUID = table.Updater.ID
		if err = f.repo.UpdateViewTransaction(ctx, formView, newFields, updateFields, deleteFields, query); err != nil {
			return errorcode.Detail(my_errorcode.DatabaseError, err.Error())
		}
		if err = f.esRepo.PubToES(ctx, formView, fieldObjs); err != nil { //扫描编辑元数据视图
			return err
		}
		f.RevokeAudit(ctx, formView, "原因：之前处于审核中时，有扫描到字段变更，因此撤销了当时的审核，需要重新进行提交")
	} else if formViewUpdate || newUniformCatalogCode { //只反转，字段不变更，或分配新的 UniformCatalogCode
		formView.UpdatedByUID = table.Updater.ID
		if err = f.repo.Update(ctx, formView); err != nil {
			log.WithContext(ctx).Error("【formViewUseCase】updateView repo Update", zap.Error(err))
			return errorcode.Detail(my_errorcode.DatabaseError, err.Error())
		}
	}

	if fieldNewOrDelete {
		result, err := f.redis.GetClient().Del(ctx, fmt.Sprintf(constant.SyntheticDataKey, formView.ID)).Result()
		if err != nil {
			log.WithContext(ctx).Error("【formViewUseCase】updateView fieldNewOrDelete clear synthetic-data fail ", zap.Error(err))
		}
		log.WithContext(ctx).Infof("【formViewUseCase】updateView fieldNewOrDelete clear synthetic-data result %d", result)
	}

	return nil
}

func (f *formViewUseCase) deleteFormView(ctx context.Context, formViewsMap map[string]*FormViewFlag) (err error) {
	deleteIds := make([]string, 0)
	for _, formView := range formViewsMap {
		if formView.flag == 1 {
			//delete
			deleteIds = append(deleteIds, formView.ID)
		}
	}
	if len(deleteIds) == 0 {
		return
	}
	auditingLogicView, err := f.logicViewRepo.GetAuditingInIds(ctx, deleteIds)
	if err != nil {
		return errorcode.Detail(my_errorcode.DatabaseError, err.Error())
	}
	for _, view := range auditingLogicView {
		f.RevokeAudit(ctx, view, "原因：之前处于审核中时，有扫描到视图删除，因此撤销了当时的审核，需要重新提交")
	}
	auditAdvice := "之前有扫描到“源表删除”的结果，导致资源不可用并做了自动下线的处理。"
	if err = f.repo.UpdateViewStatusAndAdvice(ctx, auditAdvice, deleteIds); err != nil {
		return errorcode.Detail(my_errorcode.DatabaseError, err.Error())
	}
	return nil
}
