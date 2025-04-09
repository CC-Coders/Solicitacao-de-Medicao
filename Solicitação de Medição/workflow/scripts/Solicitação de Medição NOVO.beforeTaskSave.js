function beforeTaskSave(colleagueId,nextSequenceId,userList){
    log.info("BeforeTaskSave: " + getValue("WKNumProces"));
    if (hAPI.getCardValue("countBeforeTaskSave") == 0) {
        hAPI.setCardValue("countBeforeTaskSave", 1);
        var atividade = getValue('WKNumState');
        var decisao = hAPI.getCardValue("optAprovacao");
        var engenheiro = hAPI.getCardValue("engenheiro");
        var superior = hAPI.getCardValue("superior");
        var diretoria = hAPI.getCardValue("diretoria");
        var medicaoID = hAPI.getCardValue("medicaoID");

        if (atividade == 0 || atividade == 4 || atividade == 22 || atividade == 5) {//Se atividade inicio
            if (hAPI.getCardValue("idDocMedicao") != null && hAPI.getCardValue("idDocMedicao") != "" && hAPI.getCardValue("idDocMedicao") != 0) {
                AnexarDocumento(hAPI.getCardValue("idDocMedicao"));//Anexa o boletim de medição na solicitação                
            }
        }
        
        if (atividade == 0 || atividade == 4){
            if (hAPI.getCardValue("idDocMemoCalculo") != null && hAPI.getCardValue("idDocMemoCalculo") != "" && hAPI.getCardValue("idDocMemoCalculo") != 0) {
                AnexarDocumento(hAPI.getCardValue("idDocMemoCalculo"));//Anexa o boletim de medição na solicitação                
            }
            atualizaProcessoIDMedicao();
            atualizarStatusMedicao(4);
        }
    
        if (atividade == 17) {
            if (hAPI.getCardValue("idDocMedicao") != null && hAPI.getCardValue("idDocMedicao") != "" && hAPI.getCardValue("idDocMedicao") != 0) {
                AnexarDocumento(hAPI.getCardValue("idDocMedicao"));//Anexa o boletim de medição na solicitação                
            }
        }


        if (atividade == 5 ) {
            if (decisao == "Aprovar") {
                EnviaEmailInclusao();
            }
        }
    

        if (atividade == 30 && decisao ==  "Aprovar" && (superior == "" || superior == null)) {//Se engenheiro aprova
            atualizarStatusMedicao(3);
            aprovaMov();
        }
        else if(atividade == 37 && decisao == "Aprovar" && (diretoria == "" || diretoria == null)){//Se superior aprova
            atualizarStatusMedicao(3);
            aprovaMov();
        }
        else if(atividade == 40 && decisao == "Aprovar"){//Se diretor aprova
            atualizarStatusMedicao(3);
            aprovaMov();
        }
    
        if ((atividade == 5 || atividade == 30 || atividade == 26 || atividade == 37 || atividade == 40 || atividade == 22) && (decisao != "Aprovar")) {//Se não aprovou verifica se complemento foi incluido
            if (getValue("WKUserComment") == "") {
                throw "Obrigatório informar um Complemento com a alteração necessária.";
            }
        }
    }
}

function aprovaMov() {
    log.info("inicia aprovMov");
    var values = hAPI.getCardValue("SalvarParametrosFormulario");
    if (typeof values !== 'object') {
        values = JSON.parse(values);
    }
    var IDMOV = hAPI.getCardValue("movimento");
    var coligada = hAPI.getCardValue("coligada");
    var processoFluig = getValue("WKNumProces");
    var usuarioAprovador = getValue("WKUser");

    var c1 = DatasetFactory.createConstraint("pUsuario", usuarioAprovador, usuarioAprovador, ConstraintType.MUST);
    var dsUsuAprovador = DatasetFactory.getDataset("ConsultaUsuarioRM", null, [c1], null);
    usuarioAprovador = dsUsuAprovador.getValue(0, "usuarioRM");

	var c1 = DatasetFactory.createConstraint("pIdmov", IDMOV, IDMOV, ConstraintType.MUST);
	var c2 = DatasetFactory.createConstraint("pCodcoligada", coligada, coligada, ConstraintType.MUST);
	var c3 = DatasetFactory.createConstraint("pUsuarioRM", usuarioAprovador, usuarioAprovador, ConstraintType.MUST);
	var c4 = DatasetFactory.createConstraint("pCodtmv", "1.1.99", "1.1.99", ConstraintType.MUST);
	var c5 = DatasetFactory.createConstraint("pNumprocesso", processoFluig, processoFluig, ConstraintType.MUST);
	var retorno = DatasetFactory.getDataset("AprovaMovimentoRM", null, [c1,c2,c3,c4,c5], null);
	
	if (!retorno || retorno == "" || retorno == null) {
		throw "Houve um erro na comunicação com o webservice. Tente novamente!";
	}
	else {
		if (retorno.values[0][0] == "false"){
			throw "Erro na Aprovação. Favor entrar em contato com o administrador do sistema. Mensagem: "+retorno.values[0][3];
		}
		else{	
            log.info("MOVIMENTO APROVADO = " + IDMOV);
            EnviaEmailAprovacao();
        }
    }
    log.info("fim aprovMov");
}

function FormataMoeda(valor) {
    var numero = parseFloat(valor);
    numero = numero.toFixed(2).split('.');
    numero[0] = "R$ " + numero[0].split(/(?=(?:...)*$)/).join('.');
    return numero.join(',');
}

function BuscaNomeUsuario(id){
    var ds1 = DatasetFactory.getDataset("colleague", null, [DatasetFactory.createConstraint("colleagueId", id, id, ConstraintType.MUST)], null);
    return ds1.getValue(0, "colleagueName");
}

function atualizaProcessoIDMedicao() {
    var processoID = getValue("WKNumProces");
    var medicaoID = hAPI.getCardValue("medicaoID");
       
    var c1 = DatasetFactory.createConstraint("OPERACAO", "INSERIRPROCESSOID", "INSERIRPROCESSOID", ConstraintType.MUST);
    var c2 = DatasetFactory.createConstraint("MEDICAOID", medicaoID, medicaoID, ConstraintType.MUST);
    var c3 = DatasetFactory.createConstraint("PROCESSOID", processoID, processoID, ConstraintType.MUST);
    var retorno = DatasetFactory.getDataset("dsMedicoes", null, [c1,c2,c3], null);
}

function atualizarStatusMedicao(statusID) {
    var medicaoID = hAPI.getCardValue("medicaoID");
    var c1 = DatasetFactory.createConstraint("OPERACAO", "ATUALIZARSTATUS", "ATUALIZARSTATUS", ConstraintType.MUST);
    var c2 = DatasetFactory.createConstraint("MEDICAOID", medicaoID, medicaoID, ConstraintType.MUST);
    var c3 = DatasetFactory.createConstraint("STATUSID", statusID, statusID, ConstraintType.MUST);
    var retorno = DatasetFactory.getDataset("dsMedicoes", null, [c1,c2,c3], null);
}

function AnexarDocumento(id) {
    var attachments = hAPI.listAttachments();
    var isAnexado = false;

    for (var i = 0; i < attachments.size(); i++) {
        if (id == attachments.get(i).getDocumentId()) {
            isAnexado = true;
        }
    }

    if (!isAnexado) {
        hAPI.attachDocument(id);
    }
}

function BuscaColigada(CODCOLIGADA) {
    var constraints = [];

    if (CODCOLIGADA != null) {
        constraints.push(DatasetFactory.createConstraint("CODCOLIGADA", CODCOLIGADA, CODCOLIGADA, ConstraintType.MUST));
    }
    var ds = DatasetFactory.getDataset("Coligadas", null, constraints, null);
    return ds;
}

function BuscaRemetentes(obra){
	var nmRole = "solicitaAprovacaoMedicao" + obra.split(" ").join("");
    var listRemetentes = "";

	var listRole = DatasetFactory.getDataset("workflowColleagueRole", null, [DatasetFactory.createConstraint("roleId", nmRole, nmRole, ConstraintType.MUST)], null);
	if (listRole.values.length > 0) {
        for (var i = 0; i < listRole.values.length; i++) {
            listRemetentes += BuscaEmailUsuario(listRole.getValue(i, "workflowColleagueRolePK.colleagueId")) + "; ";
        }
	}
	else{
        var listUsersObra = DatasetFactory.getDataset("colleagueGroup", ["colleagueGroupPK.colleagueId"], [DatasetFactory.createConstraint("groupId", obra, obra, ConstraintType.MUST)],  ["colleagueGroupPK.colleagueId"]);
        var listUsersRole = DatasetFactory.getDataset("workflowColleagueRole", ["workflowColleagueRolePK.colleagueId"], [DatasetFactory.createConstraint("roleId", "medicoes", "medicoes", ConstraintType.MUST)],  ["workflowColleagueRolePK.colleagueId"]);

        var j = 0;
        for (var i = 0; i < listUsersObra.values.length; i++) {
            for (var x = j;  x < listUsersRole.values.length; x++) {
                if (listUsersObra.getValue(i, "colleagueGroupPK.colleagueId") == listUsersRole.getValue(x, "workflowColleagueRolePK.colleagueId")) {
                    listRemetentes += BuscaEmailUsuario(listUsersObra.getValue(i, "colleagueGroupPK.colleagueId")) + "; ";
                    j = x;
                    x = listUsersRole.length;
                }
            }
        }
	}

    log.info("ListRemetentes: " + listRemetentes.substring(0, listRemetentes.length - 2));
    return listRemetentes.substring(0, listRemetentes.length - 2);
}

function BuscaEmailUsuario(usuario) {
    var ds = DatasetFactory.getDataset("colleague", null, [DatasetFactory.createConstraint("colleagueId", usuario, usuario, ConstraintType.MUST)], null);
    return ds.getValue(0, "mail");
}

function EnviaEmailAprovacao(){
    try{
        //var serverUrl = "homologacao.castilho.com.br:2020";//Homolog
        var serverUrl = "fluig.castilho.com.br:1010";//Prod
        var ObjContrato = JSON.parse(hAPI.getCardValue("ObjContrato"));
        var ObjMedicao = JSON.parse(hAPI.getCardValue("ObjMedicao"));
        var valorRetencao = hAPI.getCardValue("valorRetencao");

        var coligada = BuscaColigada(hAPI.getCardValue("coligada"));
        coligada = coligada.getValue(0, "CODCOLIGADA") + " - " + coligada.getValue(0, "NOMEFANTASIA");

        var html = 
        "<div>\
            <p> A solicitação de aprovação de medição foi <font color='green'><b>aprovada</b></font> pelo usuário <b>"+BuscaNomeUsuario(getValue("WKUser"))+".</b></p>\
        </div>\
        <div>\
            <div>\
                <b>Coligada: </b>\
                <span>" + coligada + "</span>\
            </div>\
            <div>\
                <b>Obra: </b>\
                <span>" + hAPI.getCardValue("ccusto") + " - " + hAPI.getCardValue("obra") + "</span>\
            </div>\
            <div>\
                <b>Contrato: </b>\
                <span>" + hAPI.getCardValue("CodigoContrato") + "</span>\
            </div>\
            <div>\
                <b>Descrição: </b>\
                <span>" + ObjContrato.CONTRATO + "</span>\
            </div>\
            <div>\
                <b>Fornecedor: </b>\
                <span>" + ObjContrato.FORNECEDOR + "</span>\
            </div>\
            <div>\
                <b>Competência: </b>\
                <span>" + ObjMedicao[0].DATACOMPETENCIA + "</span>\
            </div>\
            <div>\
                <b>Valor: </b>\
                <span>" + FormataMoeda(ObjMedicao[0].VALORBRUTO) + "</span>\
            </div>";
            if (valorRetencao != null && valorRetencao != "") {
                html+=  
                "<div>\
                    <b>Retenção: </b>\
                    <span>" + FormataMoeda(valorRetencao) + "</span>\
                </div>";
            }
        html+="\
        </div>";


        var linkDocMedicao = BuscaLinkDocMedicao();
        if (linkDocMedicao != false) {
            html+=
            "<br>\
            <div>\
                <b>Anexos:</b>\
                <br>\
                " + linkDocMedicao + "\
            </div>\
            <br>";
        }

        var param = {
            "CORPO": html,
            "SERVER_URL": serverUrl
        };

        var clientService = fluigAPI.getAuthorizeClientService();

        var data = {                                                   
            companyId : getValue("WKCompany").toString(),
            serviceCode : 'ServicoFluig',                     
            endpoint : '/api/public/alert/customEmailSender',  
            method : 'post',                              
            timeoutService: '100',
            params:{
                to: BuscaRemetentes(hAPI.getCardValue("obra")),
                //from: "no-reply@construtoracastilho.com.br", //Homolog
                from: "fluig@construtoracastilho.com.br", //Prod
                subject: "[FLUIG] Solicitação de medição aprovada!",
                templateId: "TPL_APROVACAO_MEDICOES",
                dialectId: "pt_BR",
                param:param
            }
        }

        var vo = clientService.invoke(JSONUtil.toJSON(data));
 
        if(vo.getResult()== null || vo.getResult().isEmpty()){
            throw "Retorno está vazio";
        }else{
            log.info(vo.getResult());
        }
    } catch(err) {
        throw err;
    }
}

function EnviaEmailInclusao(){
    try{
        //var serverUrl = "homologacao.castilho.com.br:2020";//Homolog
        var serverUrl = "fluig.castilho.com.br:1010";//Prod

        var ObjMedicao = JSON.parse(hAPI.getCardValue("ObjMedicao"));
        var ObjContrato = JSON.parse(hAPI.getCardValue("ObjContrato"));
        var coligada = BuscaColigada(hAPI.getCardValue("coligada"));
        coligada = coligada.getValue(0, "CODCOLIGADA") + " - " + coligada.getValue(0, "NOMEFANTASIA");
        var valorRetencao = hAPI.getCardValue("valorRetencao");
    
        var html = 
        "<p>\
            A <b>Solicitação de Medição</b>\
            <a href='http://" + serverUrl + "/portal/p/1/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID=" + getValue("WKNumProces") + "'>" + getValue("WKNumProces") + "</a>\
            do contrato " + hAPI.getCardValue("CodigoContrato") + " foi <b>incluída</b> no sistema e está <b>disponível para aprovação</b>!\
        </p>\
        <div>\
            <div>\
                <b>Coligada: </b>\
                <span>" + coligada + "</span>\
            </div>\
            <div>\
                <b>Obra: </b>\
                <span>" + hAPI.getCardValue("ccusto") + " - " + hAPI.getCardValue("obra") + "</span>\
            </div>\
            <div>\
                <b>Contrato: </b>\
                <span>" + hAPI.getCardValue("CodigoContrato") + "</span>\
            </div>\
            <div>\
                <b>Descrição: </b>\
                <span>" + ObjContrato.CONTRATO + "</span>\
            </div>\
            <div>\
                <b>Fornecedor: </b>\
                <span>" + ObjContrato.FORNECEDOR + "</span>\
            </div>\
            <div>\
                <b>Competência: </b>\
                <span>" + ObjMedicao[0].DATACOMPETENCIA + "</span>\
            </div>\
            <div>\
                <b>Valor: </b>\
                <span>" + FormataMoeda(ObjMedicao[0].VALORBRUTO) + "</span>\
            </div>";
    
            if (valorRetencao != null && valorRetencao != "") {
                html+=  
                "<div>\
                    <b>Retenção: </b>\
                    <span>" + FormataMoeda(valorRetencao) + "</span>\
                </div>";
            }
    
        html+=
        "</div>\
        <br>";

        var linkDocMedicao = BuscaLinkDocMedicao();
        if (linkDocMedicao != false) {
            html+=
            "<div>\
                <b>Anexos:</b>\
                <br>\
                " + linkDocMedicao + "\
            </div>\
            <br>";
        }

        
        html+="<div class='DescrMsgForum actions'>\
            <p class='DescrMsgForum'> Para mais detalhes, <a href='http://" + serverUrl + "/portal/p/1/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID=" + getValue("WKNumProces") + "' target='_blank'>clique aqui</a> ou verifique as informações adicionais nos campos complementares no RM.</p>\
        </div>";

        var param = {
            "CORPO": html,
            "SERVER_URL": serverUrl
        };
        var clientService = fluigAPI.getAuthorizeClientService();

        var data = {                                                   
            companyId : getValue("WKCompany").toString(),
            serviceCode : 'ServicoFluig',                     
            endpoint : '/api/public/alert/customEmailSender',  
            method : 'post', // 'delete', 'patch', 'post', 'get'                                        
            timeoutService: '100', // segundos
            params:{
                to: BuscaRemetentes(hAPI.getCardValue("obra")),
                from: "fluig@construtoracastilho.com.br", //Prod
                //from: "no-reply@construtoracastilho.com.br", //Homolog
                subject: "[Fluig] Medição incluída no RM!",
                templateId: "TPL_MEDICAO_CADASTRADA",
                dialectId: "pt_BR",
                param:param
            }
        }
        var vo = clientService.invoke(JSONUtil.toJSON(data));
 
        if(vo.getResult()== null || vo.getResult().isEmpty()){
            throw "Retorno está vazio";
        }else{
            log.info(vo.getResult());
        }
    } catch(err) {
        log.error(err);
        throw err;
    }
}

function BuscaLinkDocMedicao(){
    var retorno = false;
    var docs = hAPI.listAttachments();

    for (var i = 0; i < docs.size(); i++) {
        var doc = docs.get(i);
        if (hAPI.getCardValue("idDocMedicao").toString() == doc.getDocumentId()) {
            retorno = "<a href='" + fluigAPI.getDocumentService().getDownloadURL(doc.getDocumentId()) + "'>" + doc.getDocumentDescription() + "</a>"
        }
    }

    return retorno;
}