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
 * @returns {Dataset} {STATUS, MENSAGEM, RESULT}
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
        var listConstrainstObrigatorias = ["CODCOLIGADA", "IDCNT", "NSEQITMCNT", "NSEQITEMMEDICAO", "VALOR", "QUANTIDADEITEM", "VALORITEM", "USUARIO", "DATA"];
        lancaErroSeConstraintsObrigatoriasNaoInformadas(constraints, listConstrainstObrigatorias);

        alteraQuantidadeEValorDoItem(constraints);
        insereMedicaoNaTabelaTITMCNTMEDICAO(constraints);
        FaturaMedicaoEGeraMovimento(constraints);
        var dadosDoMovimento = buscaCodColigada_IDMovDoMovimentoGerado(constraints);

        return returnDataset("SUCESSO", "Medição inserida!", JSONUtil.toJSON(dadosDoMovimento));

    } catch (error) {
        if (typeof error == "object") {
            var mensagem = [];
            var keys = Object.keys(error);
            for (var i = 0; i < keys.length; i++) {
                mensagem.push(keys[i] + ": " + error[keys[i]]);
            }
            log.info("Erro ao executar dsInsereMedicaoEmItemDeContratoEFaturaMedicao:");
            log.info(mensagem.join(" - "));

            return returnDataset("ERRO", mensagem.join(" - "), null);
        } else {
            return returnDataset("ERRO", error, null);
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

        stmt.setInt(1, constraints.CODCOLIGADA);//CODCOLIGADA
        stmt.setInt(2, constraints.IDCNT);//IDCNT
        stmt.setInt(3, constraints.NSEQITMCNT);//NSEQITMCNT
        stmt.setInt(4, constraints.NSEQITEMMEDICAO);//NSEQMEDICAO
        stmt.setInt(5, 0);//STATUS
        stmt.setString(6, constraints.DATA);//DATA
        stmt.setFloat(7, constraints.VALOR);//VALOR
        stmt.setFloat(8, 1);//QUANTIDADE
        stmt.setString(9, constraints.DATA);//DATAEXECUCAO
        stmt.setString(10, constraints.USUARIO);//RECCREATEDBY
        //RECCREATEDON cria como SYSDATETIME()

        var rowCount = stmt.executeUpdate();
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
function FaturaMedicaoEGeraMovimento(constraints) {
    try {
        var xml = MontaXML_FaturarMedicao(constraints);

        var service = ServiceManager.getService("ProcessRM");
        var serviceHelper = service.getBean();
        var serviceLocator = service.instantiate("com.totvs.WsProcess");
        var wsObj = serviceLocator.getRMIwsProcess();
        log.info("teste xml strXml: " + xml);


        var pUsuario = "fluig";
        var pPassword = "flu!g@cc#2018";
        var authService = serviceHelper.getBasicAuthenticatedClient(wsObj, "com.totvs.IwsProcess", pUsuario, pPassword);
        var ret = authService.executeWithXmlParams('CTRFATURAMENTOMEDICAOPROCDATA', xml);
        if (ret == 1) {
            console.log("teste");
            return true;
        } else {
            throw "Erro ao Faturar Medição Retorno: " + ret;
        }
    } catch (error) {
        throw error;
    }
}
function MontaXML_FaturarMedicao(constraints) {
    try {
        var xml = "";
        xml += '<CtrFaturamentoMedicaoProcParams z:Id="i1" xmlns="http://www.totvs.com.br/RM/" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:z="http://schemas.microsoft.com/2003/10/Serialization/">';
        xml += '    <ActionModule xmlns="http://www.totvs.com/">T</ActionModule>';
        xml += '    <ActionName xmlns="http://www.totvs.com/">CtrFaturamentoMedicaoProcAction</ActionName>';
        xml += '    <CanParallelize xmlns="http://www.totvs.com/">true</CanParallelize>';
        xml += '    <CanSendMail xmlns="http://www.totvs.com/">false</CanSendMail>';
        xml += '    <CanWaitSchedule xmlns="http://www.totvs.com/">false</CanWaitSchedule>';
        xml += '    <CodUsuario xmlns="http://www.totvs.com/">Gabriel.Persike</CodUsuario>';
        xml += '    <ConnectionId i:nil="true" xmlns="http://www.totvs.com/" />';
        xml += '    <ConnectionString i:nil="true" xmlns="http://www.totvs.com/" />';
        xml += '    <Context z:Id="i2" xmlns="http://www.totvs.com/" xmlns:a="http://www.totvs.com.br/RM/">';
        xml += '        <a:_params xmlns:b="http://schemas.microsoft.com/2003/10/Serialization/Arrays">';
        xml += '            <b:KeyValueOfanyTypeanyType>';
        xml += '                <b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$EXERCICIOFISCAL</b:Key>';
        xml += '                <b:Value i:type="c:int" xmlns:c="http://www.w3.org/2001/XMLSchema">8</b:Value>';
        xml += '            </b:KeyValueOfanyTypeanyType>';
        xml += '            <b:KeyValueOfanyTypeanyType>';
        xml += '                <b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$CODLOCPRT</b:Key>';
        xml += '                <b:Value i:type="c:int" xmlns:c="http://www.w3.org/2001/XMLSchema">-1</b:Value>';
        xml += '            </b:KeyValueOfanyTypeanyType>';
        xml += '            <b:KeyValueOfanyTypeanyType>';
        xml += '                <b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$CODTIPOCURSO</b:Key>';
        xml += '                <b:Value i:type="c:int" xmlns:c="http://www.w3.org/2001/XMLSchema">-1</b:Value>';
        xml += '            </b:KeyValueOfanyTypeanyType>';
        xml += '            <b:KeyValueOfanyTypeanyType>';
        xml += '                <b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$EDUTIPOUSR</b:Key>';
        xml += '                <b:Value i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">-1</b:Value>';
        xml += '            </b:KeyValueOfanyTypeanyType>';
        xml += '            <b:KeyValueOfanyTypeanyType>';
        xml += '                <b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$CODUNIDADEBIB</b:Key>';
        xml += '                <b:Value i:type="c:int" xmlns:c="http://www.w3.org/2001/XMLSchema">-1</b:Value>';
        xml += '            </b:KeyValueOfanyTypeanyType>';
        xml += '            <b:KeyValueOfanyTypeanyType>';
        xml += '                <b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$CODCOLIGADA</b:Key>';
        xml += '                <b:Value i:type="c:int" xmlns:c="http://www.w3.org/2001/XMLSchema">1</b:Value>';
        xml += '            </b:KeyValueOfanyTypeanyType>';
        xml += '            <b:KeyValueOfanyTypeanyType>';
        xml += '                <b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$RHTIPOUSR</b:Key>';
        xml += '                <b:Value i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">-1</b:Value>';
        xml += '            </b:KeyValueOfanyTypeanyType>';
        xml += '            <b:KeyValueOfanyTypeanyType>';
        xml += '                <b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$CODIGOEXTERNO</b:Key>';
        xml += '                <b:Value i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">-1</b:Value>';
        xml += '            </b:KeyValueOfanyTypeanyType>';
        xml += '            <b:KeyValueOfanyTypeanyType>';
        xml += '                <b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$CODSISTEMA</b:Key>';
        xml += '                <b:Value i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">T</b:Value>';
        xml += '            </b:KeyValueOfanyTypeanyType>';
        xml += '            <b:KeyValueOfanyTypeanyType>';
        xml += '                <b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$CODUSUARIOSERVICO</b:Key>';
        xml += '                <b:Value i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema" />';
        xml += '            </b:KeyValueOfanyTypeanyType>';
        xml += '            <b:KeyValueOfanyTypeanyType>';
        xml += '                <b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$CODUSUARIO</b:Key>';
        xml += '                <b:Value i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">Gabriel.Persike</b:Value>';
        xml += '            </b:KeyValueOfanyTypeanyType>';
        xml += '            <b:KeyValueOfanyTypeanyType>';
        xml += '                <b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$IDPRJ</b:Key>';
        xml += '                <b:Value i:type="c:int" xmlns:c="http://www.w3.org/2001/XMLSchema">-1</b:Value>';
        xml += '            </b:KeyValueOfanyTypeanyType>';
        xml += '            <b:KeyValueOfanyTypeanyType>';
        xml += '                <b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$CHAPAFUNCIONARIO</b:Key>';
        xml += '                <b:Value i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">-1</b:Value>';
        xml += '            </b:KeyValueOfanyTypeanyType>';
        xml += '            <b:KeyValueOfanyTypeanyType>';
        xml += '                <b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$CODFILIAL</b:Key>';
        xml += '                <b:Value i:type="c:int" xmlns:c="http://www.w3.org/2001/XMLSchema">1</b:Value>';
        xml += '            </b:KeyValueOfanyTypeanyType>';
        xml += '        </a:_params>';
        xml += '        <a:Environment>DotNet</a:Environment>';
        xml += '    </Context>';
        xml += '    <CustomData i:nil="true" xmlns="http://www.totvs.com/" />';
        xml += '    <DisableIsolateProcess xmlns="http://www.totvs.com/">false</DisableIsolateProcess>';
        xml += '    <DriverType i:nil="true" xmlns="http://www.totvs.com/" />';
        xml += '    <ExecutionId xmlns="http://www.totvs.com/">568083be-269a-4cf8-9928-c7757155500d</ExecutionId>';
        xml += '    <FailureMessage xmlns="http://www.totvs.com/">Falha na execução do processo</FailureMessage>';
        xml += '    <FriendlyLogs i:nil="true" xmlns="http://www.totvs.com/" />';
        xml += '    <HideProgressDialog xmlns="http://www.totvs.com/">false</HideProgressDialog>';
        xml += '    <HostName xmlns="http://www.totvs.com/">HOMOLOGACAO</HostName>';
        xml += '    <Initialized xmlns="http://www.totvs.com/">true</Initialized>';
        xml += '    <Ip xmlns="http://www.totvs.com/">172.17.0.31</Ip>';
        xml += '    <IsolateProcess xmlns="http://www.totvs.com/">false</IsolateProcess>';
        xml += '    <JobID xmlns="http://www.totvs.com/">';
        xml += '        <Children />';
        xml += '        <ExecID>1</ExecID>';
        xml += '        <ID>2470310</ID>';
        xml += '        <IsPriorityJob>false</IsPriorityJob>';
        xml += '    </JobID>';
        xml += '    <JobServerHostName xmlns="http://www.totvs.com/">HOMOLOGACAO</JobServerHostName>';
        xml += '    <MasterActionName xmlns="http://www.totvs.com/">CtrItmMedicaoCntAction</MasterActionName>';
        xml += '    <MaximumQuantityOfPrimaryKeysPerProcess xmlns="http://www.totvs.com/">1000</MaximumQuantityOfPrimaryKeysPerProcess>';
        xml += '    <MinimumQuantityOfPrimaryKeysPerProcess xmlns="http://www.totvs.com/">1</MinimumQuantityOfPrimaryKeysPerProcess>';
        xml += '    <NetworkUser xmlns="http://www.totvs.com/">gabriel.persike</NetworkUser>';
        xml += '    <NotifyEmail xmlns="http://www.totvs.com/">false</NotifyEmail>';
        xml += '    <NotifyEmailList i:nil="true" xmlns="http://www.totvs.com/" xmlns:a="http://schemas.microsoft.com/2003/10/Serialization/Arrays" />';
        xml += '    <NotifyFluig xmlns="http://www.totvs.com/">false</NotifyFluig>';
        xml += '    <OnlineMode xmlns="http://www.totvs.com/">false</OnlineMode>';
        xml += '    <PrimaryKeyList xmlns="http://www.totvs.com/" xmlns:a="http://schemas.microsoft.com/2003/10/Serialization/Arrays">';
        xml += '        <a:ArrayOfanyType>';
        xml += '            <a:anyType i:type="b:short" xmlns:b="http://www.w3.org/2001/XMLSchema">1</a:anyType>';
        xml += '            <a:anyType i:type="b:int" xmlns:b="http://www.w3.org/2001/XMLSchema">8833</a:anyType>';
        xml += '            <a:anyType i:type="b:short" xmlns:b="http://www.w3.org/2001/XMLSchema">1</a:anyType>';
        xml += '            <a:anyType i:type="b:short" xmlns:b="http://www.w3.org/2001/XMLSchema">9</a:anyType>';
        xml += '        </a:ArrayOfanyType>';
        xml += '    </PrimaryKeyList>';
        xml += '    <PrimaryKeyNames xmlns="http://www.totvs.com/" xmlns:a="http://schemas.microsoft.com/2003/10/Serialization/Arrays">';
        xml += '        <a:string>CODCOLIGADA</a:string>';
        xml += '        <a:string>IDCNT</a:string>';
        xml += '        <a:string>NSEQITMCNT</a:string>';
        xml += '        <a:string>NSEQMEDICAO</a:string>';
        xml += '    </PrimaryKeyNames>';
        xml += '    <PrimaryKeyTableName xmlns="http://www.totvs.com/">TITMCNTMEDICAO</PrimaryKeyTableName>';
        xml += '    <ProcessName xmlns="http://www.totvs.com/">Faturamento Medição</ProcessName>';
        xml += '    <QuantityOfSplits xmlns="http://www.totvs.com/">0</QuantityOfSplits>';
        xml += '    <SaveLogInDatabase xmlns="http://www.totvs.com/">true</SaveLogInDatabase>';
        xml += '    <SaveParamsExecution xmlns="http://www.totvs.com/">false</SaveParamsExecution>';
        xml += '    <ScheduleDateTime xmlns="http://www.totvs.com/">2025-04-23T14:26:08.9605565-03:00</ScheduleDateTime>';
        xml += '    <Scheduler xmlns="http://www.totvs.com/">JobMonitor</Scheduler>';
        xml += '    <SendMail xmlns="http://www.totvs.com/">false</SendMail>';
        xml += '    <ServerName xmlns="http://www.totvs.com/">CtrFaturamentoMedicaoProcData</ServerName>';
        xml += '    <ServiceInterface i:nil="true" xmlns="http://www.totvs.com/" xmlns:a="http://schemas.datacontract.org/2004/07/System" />';
        xml += '    <ShouldParallelize xmlns="http://www.totvs.com/">false</ShouldParallelize>';
        xml += '    <ShowReExecuteButton xmlns="http://www.totvs.com/">true</ShowReExecuteButton>';
        xml += '    <StatusMessage i:nil="true" xmlns="http://www.totvs.com/" />';
        xml += '    <SuccessMessage xmlns="http://www.totvs.com/">Processo executado com sucesso</SuccessMessage>';
        xml += '    <SyncExecution xmlns="http://www.totvs.com/">false</SyncExecution>';
        xml += '    <UseJobMonitor xmlns="http://www.totvs.com/">true</UseJobMonitor>';
        xml += '    <UserName xmlns="http://www.totvs.com/">Gabriel.Persike</UserName>';
        xml += '    <WaitSchedule xmlns="http://www.totvs.com/">false</WaitSchedule>';
        xml += '    <CtrFaturamento>';
        xml += '        <CtrFaturamentoMedicaoPar z:Id="i3">';
        xml += '            <InternalId i:nil="true" xmlns="http://www.totvs.com/" />';
        xml += '            <CodColigada>' + constraints.CODCOLIGADA + '</CodColigada>';
        xml += '            <CodSistemaLogado>T</CodSistemaLogado>';
        xml += '            <CodTmvCompra>1.1.99</CodTmvCompra>';
        xml += '            <CodTmvVenda i:nil="true" />';
        xml += '            <CodUsuarioLogado>' + constraints.USUARIO + '</CodUsuarioLogado>';
        xml += '            <IdCnt>' + constraints.IDCNT + '</IdCnt>';
        xml += '            <NumeroMovCompra i:nil="true" />';
        xml += '            <NumeroMovVenda i:nil="true" />';
        xml += '            <SerieCompra>OC</SerieCompra>';
        xml += '            <SerieVenda i:nil="true" />';
        xml += '            <Data>2025-04-24T00:00:00</Data>';
        xml += '            <NSeqItmCnt>' + constraints.NSEQITMCNT + '</NSeqItmCnt>';
        xml += '            <NSeqMedicao>' + constraints.NSEQITEMMEDICAO + '</NSeqMedicao>';
        xml += '        </CtrFaturamentoMedicaoPar>';
        xml += '    </CtrFaturamento>';
        xml += '</CtrFaturamentoMedicaoProcParams>';


        return xml;
    } catch (error) {
        throw error;
    }
}
function buscaCodColigada_IDMovDoMovimentoGerado(constraints) {
    try {
        var dataSource = "/jdbc/RM";
        var ic = new javax.naming.InitialContext();
        var ds = ic.lookup(dataSource);

        var query = "SELECT CODCOLIGADA, IDMOV ";
        query += "FROM TITMMOV ";
        query += "WHERE CODCOLIGADA = ? AND IDCNT = ? AND NSEQITMMOV = 1 AND NSEQITMCNTMEDICAO = ?";

        var conn = ds.getConnection();
        var stmt = conn.prepareStatement(query);

        stmt.setInt(1, constraints.CODCOLIGADA);//CODCOLIGADA
        stmt.setInt(2, constraints.IDCNT);//IDCNT
        stmt.setInt(3, constraints.NSEQITEMMEDICAO);//NSEQMEDICAO

        var rs = stmt.executeQuery();

        var retorno = [];
        var columnCount = rs.getMetaData().getColumnCount();

        while (rs.next()) {
            var linha = {};
            for (var i = 1; i <= columnCount; i++) {
                linha[rs.getMetaData().getColumnName(i)] = rs.getObject(rs.getMetaData().getColumnName(i)).toString();
            }
            retorno.push(linha);
        }
        return retorno;
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
function alteraQuantidadeEValorDoItem(constraints) {
    try {
        var xml ="<CTRCNT>";
        xml += "    <TCNT>";
        xml += "        <CODCOLIGADA>" + constraints.CODCOLIGADA + "</CODCOLIGADA>";
        xml += "        <IDCNT>" + constraints.IDCNT + "</IDCNT>";
        xml += "    </TCNT>";
        xml += "    <TITMCNT>";
        xml += "        <CODCOLIGADA>" + constraints.CODCOLIGADA + "</CODCOLIGADA>";
        xml += "        <IDCNT>" + constraints.IDCNT + "</IDCNT>";
        xml += "        <NSEQITMCNT>" + constraints.NSEQITMCNT + "</NSEQITMCNT>";
        xml += "        <QUANTIDADE>" + constraints.QUANTIDADEITEM + "</QUANTIDADE>";
        xml += "        <PRECOFATURAMENTO>" + constraints.VALORITEM + "</PRECOFATURAMENTO>";
        xml += "      </TITMCNT>";
        xml +="</CTRCNT>";

        var contexto = "CODSISTEMA=T;CODCOLIGADA=" + constraints.CODCOLIGADA + ";CODUSUARIO=fluig";

        var retorno = DatasetFactory.getDataset("InsereContratoRM", null, [
            DatasetFactory.createConstraint("xml", xml, xml, ConstraintType.MUST),
            DatasetFactory.createConstraint("contexto", contexto, contexto, ConstraintType.MUST),
            DatasetFactory.createConstraint("idContrato", constraints.IDCNT, constraints.IDCNT, ConstraintType.MUST),
            DatasetFactory.createConstraint("coligada", constraints.CODCOLIGADA, constraints.CODCOLIGADA, ConstraintType.MUST),
        ], null);


        if (retorno.values[0][0] == "true") {
            return true;
        }
        else {
            throw retorno.values[0][0];
        }
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
function returnDataset(STATUS, MENSAGEM, RESULT) {
    var dataset = DatasetBuilder.newDataset();
    dataset.addColumn("STATUS");
    dataset.addColumn("MENSAGEM");
    dataset.addColumn("RESULT");
    dataset.addRow([STATUS, MENSAGEM, RESULT]);
    return dataset;
}