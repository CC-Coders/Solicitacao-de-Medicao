function displayFields(form,customHTML){
    form.setValue("userCode", getValue("WKUser"));
	form.setValue("formMode", form.getFormMode());
	form.setValue("atividade", getValue('WKNumState'));
	form.setValue("isMobile", form.getMobile());
	form.setValue("countBeforeTaskSave", 0);
}