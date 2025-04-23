/**
 * Dataset usado para gerar as Medições (1.1.98) via integração
 * @name dsInsereMedicaoEmItemDeContratoEFaturaMedicao
 * @author Gabriel Persike
 * @param  {int} CODCOLIGADA 
 * @param  {int} IDCNT 
 * @param  {int} NSEQITMCNT 
 * @param  {float} VALOR 
 * @param  {float} QUANTIDADE 
 * @param  {string} USUARIO 
 * @param  {Date} DATA 
 * @returns {Dataset} {STATUS, MENSAGEM}
*/

// Exemplo de Chamada
// var ds = DatasetFactory.getDataset("dsInsereMedicaoEmItemDeContratoEFaturaMedicao",null,[
//     DatasetFactory.createConstraint("CODCOLIGADA", "1","1",ConstraintType.MUST),
//     DatasetFactory.createConstraint("IDCNT", "10344","10344",ConstraintType.MUST),
//     DatasetFactory.createConstraint("NSEQITMCNT", "1","1",ConstraintType.MUST),
//     DatasetFactory.createConstraint("NSEQITEMMEDICAO", "15","15",ConstraintType.MUST),
//     DatasetFactory.createConstraint("VALOR", "20.0000","20.0000",ConstraintType.MUST),
//     DatasetFactory.createConstraint("QUANTIDADE", "1.0000","1.0000",ConstraintType.MUST),
//     DatasetFactory.createConstraint("USUARIO", "gabriel.persike","gabriel.persike",ConstraintType.MUST),
//     DatasetFactory.createConstraint("DATA", "2025-04-23T00:00:00.000","2025-04-23T00:00:00.000",ConstraintType.MUST),
// ],null);

function createDataset(fields, constraints, sortFields) {
    try {
        // Le e Valida Constraints
        var constraints = getConstraints(constraints);
        var listConstrainstObrigatorias = ["CODCOLIGADA", "IDCNT", "NSEQITMCNT", "NSEQITEMMEDICAO", "VALOR", "QUANTIDADE", "USUARIO", "DATA"];
        lancaErroSeConstraintsObrigatoriasNaoInformadas(constraints, listConstrainstObrigatorias);

        insereMedicaoNaTabelaTITMCNTMEDICAO(constraints);

        FaturaMedicao(constraints);


        // Fatura a Medição por Webservice gerando o 1.1.99





        // Busca o ID do Movimento gerado



        return returnDataset("SUCESSO", "Medição inserida!");

    } catch (error) {
        if (typeof error == "object") {
            var mensagem = [];
            var keys = Object.keys(error);
            for (var i = 0; i < keys.length; i++) {
                mensagem.push(keys[i] + ": " + error[keys[i]]);
            }

            return returnDataset("ERRO", mensagem.join(" - "));
        } else {
            return returnDataset("ERRO", error);
        }
    }
}



// Insere Medicao
function insereMedicaoNaTabelaTITMCNTMEDICAO(constraints) {
    try {
        var dataSource = "/jdbc/RM";
        var ic = new javax.naming.InitialContext();
        var ds = ic.lookup(dataSource);
        var myQuery = "INSERT INTO TITMCNTMEDICAO (CODCOLIGADA, IDCNT, NSEQITMCNT, NSEQMEDICAO, STATUS, DATA, VALOR, QUANTIDADE, DATAEXECUCAO, RECCREATEDBY, RECCREATEDON) VALUES (?,?,?,?,?,?,?,?,?,?,SYSDATETIME())";
        var conn = ds.getConnection();
        var stmt = conn.prepareStatement(myQuery);

        log.info("dsInsereMedicaoEmItemDeContratoEFaturaMedicao setInt 1");
        stmt.setInt(1, constraints.CODCOLIGADA);//CODCOLIGADA
        log.info("dsInsereMedicaoEmItemDeContratoEFaturaMedicao setInt 2");
        stmt.setInt(2, constraints.IDCNT);//IDCNT
        log.info("dsInsereMedicaoEmItemDeContratoEFaturaMedicao setInt 3");
        stmt.setInt(3, constraints.NSEQITMCNT);//NSEQITMCNT
        log.info("dsInsereMedicaoEmItemDeContratoEFaturaMedicao setInt 4");
        stmt.setInt(4, constraints.NSEQITEMMEDICAO);//NSEQMEDICAO
        log.info("dsInsereMedicaoEmItemDeContratoEFaturaMedicao setInt 5");
        stmt.setInt(5, 0);//STATUS
        log.info("dsInsereMedicaoEmItemDeContratoEFaturaMedicao setInt 6");
        stmt.setString(6, constraints.DATA);//DATA
        log.info("dsInsereMedicaoEmItemDeContratoEFaturaMedicao setInt 7");
        stmt.setFloat(7, constraints.VALOR);//VALOR
        log.info("dsInsereMedicaoEmItemDeContratoEFaturaMedicao setInt 8");
        stmt.setFloat(8, constraints.QUANTIDADE);//QUANTIDADE
        log.info("dsInsereMedicaoEmItemDeContratoEFaturaMedicao setInt 9");
        stmt.setString(9, constraints.DATA);//DATAEXECUCAO
        log.info("dsInsereMedicaoEmItemDeContratoEFaturaMedicao setInt 10");
        stmt.setString(10, constraints.USUARIO);//RECCREATEDBY
        //RECCREATEDON cria como SYSDATETIME()


        log.info("dsInsereMedicaoEmItemDeContratoEFaturaMedicao execute");

        var rowCount = stmt.executeUpdate();
        log.info("dsInsereMedicaoEmItemDeContratoEFaturaMedicao rowCount? " + rowCount);
        if (rowCount > 0) {
            return true;
        }
        else {
            throw "Erro ao Inserir Medição rowCount = " + rowCount;
        }
    } catch (e) {
        throw e;
    } finally {
        if (stmt != null) {
            stmt.close();
        }
        if (conn != null) {
            conn.close();
        }
    }
}

function FaturaMedicao(constraints) {
    var xml = MontaXML_FaturarMedicao(constraints);

    var service = ServiceManager.getService("ProcessRM");
    var serviceHelper = service.getBean();
    var serviceLocator = service.instantiate("com.totvs.WsProcess");
    var wsObj = serviceLocator.getRMIwsProcess();
    log.info("teste xml strXml: " + xml);
   

    var pUsuario = "fluig";
    var pPassword = "flu!g@cc#2018";
    var authService = serviceHelper.getBasicAuthenticatedClient(wsObj, "com.totvs.IwsProcess", pUsuario, pPassword);			    	 
    var ret = authService.executeWithParams('CTRFATURAMENTOMEDICAOPROCDATA',xml);
    log.info("ret");
    log.dir(ret);



}
function MontaXML_FaturarMedicao(constraints) {
    try {
        var xml = "";
        xml += '<?xml version="1.0" encoding="utf-16"?>';
        xml += '<CtrFaturamentoMedicaoProcParams xmlns:i="http://www.w3.org/2001/XMLSchema-instance" z:Id="i1" xmlns:z="http://schemas.microsoft.com/2003/10/Serialization/" xmlns="http://www.totvs.com.br/RM/">';
        xml += '  <Context xmlns:d2p1="http://www.totvs.com.br/RM/" z:Id="i2" xmlns="http://www.totvs.com/">';
        xml += '    <d2p1:_params xmlns:d3p1="http://schemas.microsoft.com/2003/10/Serialization/Arrays">';
        xml += '      <d3p1:KeyValueOfanyTypeanyType>';
        xml += '        <d3p1:Key xmlns:d5p1="http://www.w3.org/2001/XMLSchema" i:type="d5p1:string">$EXERCICIOFISCAL</d3p1:Key>';
        xml += '        <d3p1:Value xmlns:d5p1="http://www.w3.org/2001/XMLSchema" i:type="d5p1:int">8</d3p1:Value>';
        xml += '      </d3p1:KeyValueOfanyTypeanyType>';
        xml += '      <d3p1:KeyValueOfanyTypeanyType>';
        xml += '        <d3p1:Key xmlns:d5p1="http://www.w3.org/2001/XMLSchema" i:type="d5p1:string">$CODLOCPRT</d3p1:Key>';
        xml += '        <d3p1:Value xmlns:d5p1="http://www.w3.org/2001/XMLSchema" i:type="d5p1:int">-1</d3p1:Value>';
        xml += '      </d3p1:KeyValueOfanyTypeanyType>';
        xml += '      <d3p1:KeyValueOfanyTypeanyType>';
        xml += '        <d3p1:Key xmlns:d5p1="http://www.w3.org/2001/XMLSchema" i:type="d5p1:string">$CODTIPOCURSO</d3p1:Key>';
        xml += '        <d3p1:Value xmlns:d5p1="http://www.w3.org/2001/XMLSchema" i:type="d5p1:int">-1</d3p1:Value>';
        xml += '      </d3p1:KeyValueOfanyTypeanyType>';
        xml += '      <d3p1:KeyValueOfanyTypeanyType>';
        xml += '        <d3p1:Key xmlns:d5p1="http://www.w3.org/2001/XMLSchema" i:type="d5p1:string">$EDUTIPOUSR</d3p1:Key>';
        xml += '        <d3p1:Value xmlns:d5p1="http://www.w3.org/2001/XMLSchema" i:type="d5p1:string">-1</d3p1:Value>';
        xml += '      </d3p1:KeyValueOfanyTypeanyType>';
        xml += '      <d3p1:KeyValueOfanyTypeanyType>';
        xml += '        <d3p1:Key xmlns:d5p1="http://www.w3.org/2001/XMLSchema" i:type="d5p1:string">$CODUNIDADEBIB</d3p1:Key>';
        xml += '        <d3p1:Value xmlns:d5p1="http://www.w3.org/2001/XMLSchema" i:type="d5p1:int">-1</d3p1:Value>';
        xml += '      </d3p1:KeyValueOfanyTypeanyType>';
        xml += '      <d3p1:KeyValueOfanyTypeanyType>';
        xml += '        <d3p1:Key xmlns:d5p1="http://www.w3.org/2001/XMLSchema" i:type="d5p1:string">$CODCOLIGADA</d3p1:Key>';
        xml += '        <d3p1:Value xmlns:d5p1="http://www.w3.org/2001/XMLSchema" i:type="d5p1:int">1</d3p1:Value>';
        xml += '      </d3p1:KeyValueOfanyTypeanyType>';
        xml += '      <d3p1:KeyValueOfanyTypeanyType>';
        xml += '        <d3p1:Key xmlns:d5p1="http://www.w3.org/2001/XMLSchema" i:type="d5p1:string">$RHTIPOUSR</d3p1:Key>';
        xml += '        <d3p1:Value xmlns:d5p1="http://www.w3.org/2001/XMLSchema" i:type="d5p1:string">-1</d3p1:Value>';
        xml += '      </d3p1:KeyValueOfanyTypeanyType>';
        xml += '      <d3p1:KeyValueOfanyTypeanyType>';
        xml += '        <d3p1:Key xmlns:d5p1="http://www.w3.org/2001/XMLSchema" i:type="d5p1:string">$CODIGOEXTERNO</d3p1:Key>';
        xml += '        <d3p1:Value xmlns:d5p1="http://www.w3.org/2001/XMLSchema" i:type="d5p1:string">-1</d3p1:Value>';
        xml += '      </d3p1:KeyValueOfanyTypeanyType>';
        xml += '      <d3p1:KeyValueOfanyTypeanyType>';
        xml += '        <d3p1:Key xmlns:d5p1="http://www.w3.org/2001/XMLSchema" i:type="d5p1:string">$CODSISTEMA</d3p1:Key>';
        xml += '        <d3p1:Value xmlns:d5p1="http://www.w3.org/2001/XMLSchema" i:type="d5p1:string">T</d3p1:Value>';
        xml += '      </d3p1:KeyValueOfanyTypeanyType>';
        xml += '      <d3p1:KeyValueOfanyTypeanyType>';
        xml += '        <d3p1:Key xmlns:d5p1="http://www.w3.org/2001/XMLSchema" i:type="d5p1:string">$CODUSUARIOSERVICO</d3p1:Key>';
        xml += '        <d3p1:Value xmlns:d5p1="http://www.w3.org/2001/XMLSchema" i:type="d5p1:string"></d3p1:Value>';
        xml += '      </d3p1:KeyValueOfanyTypeanyType>';
        xml += '      <d3p1:KeyValueOfanyTypeanyType>';
        xml += '        <d3p1:Key xmlns:d5p1="http://www.w3.org/2001/XMLSchema" i:type="d5p1:string">$IDPRJ</d3p1:Key>';
        xml += '        <d3p1:Value xmlns:d5p1="http://www.w3.org/2001/XMLSchema" i:type="d5p1:int">-1</d3p1:Value>';
        xml += '      </d3p1:KeyValueOfanyTypeanyType>';
        xml += '      <d3p1:KeyValueOfanyTypeanyType>';
        xml += '        <d3p1:Key xmlns:d5p1="http://www.w3.org/2001/XMLSchema" i:type="d5p1:string">$CHAPAFUNCIONARIO</d3p1:Key>';
        xml += '        <d3p1:Value xmlns:d5p1="http://www.w3.org/2001/XMLSchema" i:type="d5p1:string">-1</d3p1:Value>';
        xml += '      </d3p1:KeyValueOfanyTypeanyType>';
        xml += '      <d3p1:KeyValueOfanyTypeanyType>';
        xml += '        <d3p1:Key xmlns:d5p1="http://www.w3.org/2001/XMLSchema" i:type="d5p1:string">$CODFILIAL</d3p1:Key>';
        xml += '        <d3p1:Value xmlns:d5p1="http://www.w3.org/2001/XMLSchema" i:type="d5p1:int">1</d3p1:Value>';
        xml += '      </d3p1:KeyValueOfanyTypeanyType>';
        xml += '    </d2p1:_params>';
        xml += '    <d2p1:Environment>WebServices</d2p1:Environment>';
        xml += '  </Context>';
        xml += '  <PrimaryKeyList xmlns:d2p1="http://schemas.microsoft.com/2003/10/Serialization/Arrays" xmlns="http://www.totvs.com/">';
        xml += '    <d2p1:ArrayOfanyType>';
        xml += '      <d2p1:anyType xmlns:d4p1="http://www.w3.org/2001/XMLSchema" i:type="d4p1:int">0</d2p1:anyType>';
        xml += '    </d2p1:ArrayOfanyType>';
        xml += '    <d2p1:ArrayOfanyType>';
        xml += '      <d2p1:anyType xmlns:d4p1="http://www.w3.org/2001/XMLSchema" i:type="d4p1:decimal">0</d2p1:anyType>';
        xml += '    </d2p1:ArrayOfanyType>';
        xml += '    <d2p1:ArrayOfanyType>';
        xml += '      <d2p1:anyType xmlns:d4p1="http://www.w3.org/2001/XMLSchema" i:type="d4p1:string">TEXTO</d2p1:anyType>';
        xml += '    </d2p1:ArrayOfanyType>';
        xml += '    <d2p1:ArrayOfanyType>';
        xml += '      <d2p1:anyType xmlns:d4p1="http://www.w3.org/2001/XMLSchema" i:type="d4p1:dateTime">2025-04-23T00:00:00-03:00</d2p1:anyType>';
        xml += '    </d2p1:ArrayOfanyType>';
        xml += '  </PrimaryKeyList>';
        xml += '  <PrimaryKeyNames xmlns:d2p1="http://schemas.microsoft.com/2003/10/Serialization/Arrays" xmlns="http://www.totvs.com/">';
        xml += '    <d2p1:string>COLUNAPK</d2p1:string>';
        xml += '  </PrimaryKeyNames>';
        xml += '  <CtrFaturamento>';
        xml += '    <CtrFaturamentoMedicaoPar z:Id="i3">';
        xml += '      <InternalId i:nil="true" xmlns="http://www.totvs.com/" />';
        xml += '      <CodColigada>' + constraints.CODCOLIGADA + '</CodColigada>';
        xml += '      <CodSistemaLogado i:nil="true" />';
        xml += '      <CodTmvCompra i:nil="true" />';
        xml += '      <CodTmvVenda i:nil="true" />';
        xml += '      <CodUsuarioLogado i:nil="true" />';
        xml += '      <IdCnt>' + constraints.IDCNT + '</IdCnt>';
        xml += '      <NumeroMovCompra i:nil="true" />';
        xml += '      <NumeroMovVenda i:nil="true" />';
        xml += '      <SerieCompra i:nil="true" />';
        xml += '      <SerieVenda i:nil="true" />';
        xml += '      <Data>' + constraints.DATA + '</Data>';
        xml += '      <NSeqItmCnt>' + constraints.NSEQITMCNT + '</NSeqItmCnt>';
        xml += '      <NSeqMedicao>' + constraints.NSEQITEMMEDICAO + '</NSeqMedicao>';
        xml += '    </CtrFaturamentoMedicaoPar>';
        xml += '  </CtrFaturamento>';
        xml += '</CtrFaturamentoMedicaoProcParams>';

        return xml;

    } catch (error) {
        throw error;
    }
}



// Utils
function getConstraints(constraints) {
    try {
        var retorno = {};
        if (constraints != null) {
            for (var i = 0; i < constraints.length; i++) {
                var constraint = constraints[i];
                retorno[constraint.fieldName] = constraint.initialValue;
            }
        }
        return retorno;
    } catch (error) {
        throw error;
    }
}
function lancaErroSeConstraintsObrigatoriasNaoInformadas(constraints, listConstrainstObrigatorias) {
    try {
        var retornoErro = [];
        for (var i = 0; i < listConstrainstObrigatorias.length; i++) {
            if (constraints[listConstrainstObrigatorias[i]] == null || constraints[listConstrainstObrigatorias[i]] == "" || constraints[listConstrainstObrigatorias[i]] == undefined) {
                retornoErro.push(listConstrainstObrigatorias[i]);
            }
        }

        if (retornoErro.length > 0) {
            throw "Constraints obrigatorioas nao informadas (" + retornoErro.join(", ") + ")";
        }
    } catch (error) {
        throw error;
    }
}
function returnDataset(STATUS, MENSAGEM) {
    var dataset = DatasetBuilder.newDataset();
    dataset.addColumn("STATUS");
    dataset.addColumn("MENSAGEM");
    dataset.addRow([STATUS, MENSAGEM]);
    return dataset;
}