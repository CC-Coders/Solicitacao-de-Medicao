function beforeCancelProcess(colleagueId,processId){
	var c1 = DatasetFactory.createConstraint("OPERACAO", "REMOVERMEDICAO", "REMOVERMEDICAO", ConstraintType.MUST);
	var c2 = DatasetFactory.createConstraint("PROCESSOID", processId, processId, ConstraintType.MUST);
	var retorno = DatasetFactory.getDataset("dsMedicoes", null, [c1,c2], null);
}