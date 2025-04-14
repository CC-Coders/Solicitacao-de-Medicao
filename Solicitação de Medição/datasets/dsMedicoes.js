function defineStructure() {

}
function onSync(lastSyncDate) {

}
function createDataset(fields, constraints, sortFields) {
    let myQuery = null;
    let OPERACAO = null;
    let JSONMEDICAO = null;
    let JSONEQUIPAMENTO = null;
    let JSONITENS = [];
    let CODIGOCONTRATO = null;
    let CODIGOSCONTRATO = null;
    let MEDICAOID = null;
    let GCCUSTO = null;
    let CODCOLIGADA = null;
    let PROCESSOID = null;
    let STATUSID = null;
    let DOCID = null;
    let VALORDESCONTO = null;
    let PREFIXOS = null;

    if (constraints != null) {
        for (i = 0; i < constraints.length; i++) {
            if (constraints[i].fieldName == "OPERACAO") {
                OPERACAO = constraints[i].initialValue;
            }
            else if (constraints[i].fieldName == "JSONMEDICAO") {
                JSONMEDICAO = JSON.parse(constraints[i].initialValue);
            }
            else if (constraints[i].fieldName == "JSONEQUIPAMENTO") {
                JSONEQUIPAMENTO = JSON.parse(constraints[i].initialValue);
            }
            else if (constraints[i].fieldName == "CODIGOCONTRATO") {
                CODIGOCONTRATO = constraints[i].initialValue;
            }
            else if (constraints[i].fieldName == "MEDICAOID") {
                MEDICAOID = constraints[i].initialValue;
            }
            else if (constraints[i].fieldName == "GCCUSTO") {
                GCCUSTO = constraints[i].initialValue;
            }
            else if (constraints[i].fieldName == "CODCOLIGADA") {
                CODCOLIGADA = constraints[i].initialValue;
            }
            else if (constraints[i].fieldName == "CODIGOSCONTRATO") {
                CODIGOSCONTRATO = constraints[i].initialValue;
            }
            else if (constraints[i].fieldName == "PROCESSOID") {
                PROCESSOID = constraints[i].initialValue;
            }
            else if (constraints[i].fieldName == "STATUSID") {
                STATUSID = constraints[i].initialValue;
            }
            else if (constraints[i].fieldName == "DOCID") {
                DOCID = constraints[i].initialValue;
            }
            else if (constraints[i].fieldName == "VALORDESCONTO") {
                VALORDESCONTO = constraints[i].initialValue;
            }
            else if (constraints[i].fieldName == "PREFIXOS") {
                PREFIXOS = constraints[i].initialValue;
            }
            else if (constraints[i].fieldName == "JSONITENS") {
            	JSONITENS = constraints[i].initialValue;
            }
        }

    }

    if (OPERACAO == "INSERT") {
        log.info("---------/// INCICIANDO INSERT MEDIÇÃO  \\\\-------------")
        /*myQuery = "INSERT INTO MEDICOES " +
        	"(IDCNT, OBRA, FORNECEDOR, CNPJ, CODIGOCONTRATO, PERIODOINICIAL, PERIODOFINAL, NUMEROMEDICAO, DATACOMPETENCIA, PRESENTEMEDICAO, ACUMULADOATUAL, DESCONTOATUAL, STATUS, RETENCAOANTERIOR, RETENCAOATUAL, POSSUIREIDI, TAXAREIDI, REIDIANTERIOR, REIDIATUAL, OPTANTEPELOSIMPLES) " +
            " OUTPUT inserted.MedicaoID " +
            "VALUES (" +
            "'" + JSONMEDICAO.IDCNT + "', " +
            "'" + JSONMEDICAO.OBRA + "', " +
            "'" + JSONMEDICAO.FORNECEDOR.replace("'","''") + "', " +
            "'" + JSONMEDICAO.CNPJ + "', " +
            "'" + JSONMEDICAO.CODIGOCONTRATO + "', " +
            "'" + JSONMEDICAO.PERIODOINICIALFORMATADA + "', " +
            "'" + JSONMEDICAO.PERIODOFINALFORMATADA + "', " +
            JSONMEDICAO.NUMEROMEDICAO + ", " +
            "'" + JSONMEDICAO.DATACOMPETENCIAFORMATADA + "', " +
            + JSONMEDICAO.PRESENTEMEDICAO + ", "
            + JSONMEDICAO.ACUMULADOATUAL + ", "
            + JSONMEDICAO.DESCONTOATUAL + ", 1, "
            + JSONMEDICAO.RETENCAOANTERIOR + ", "
            + JSONMEDICAO.RETENCAOATUAL +", "
            + (JSONMEDICAO.POSSUIREIDI ? 1 : 0) +", "
            + JSONMEDICAO.TAXAREIDI + ", "
            + JSONMEDICAO.REIDIANTERIOR + ", "
            + JSONMEDICAO.REIDIATUAL +", "
            + (JSONMEDICAO.OPTANTEPELOSIMPLES ? 1 : 0) + " )";

        log.info(myQuery);
        let medicaoSalva = executaQuery(myQuery);
        let medicaoID = medicaoSalva.values[0][0];

        log.info("---------/// "+ medicaoID+"   \\\\-------------")
        
        let myQueryItens = "INSERT INTO MEDICOESITENS " +
            "(MEDICAOID, DESCRICAO, PREFIXO, UNIDADE, VALORUNITARIO, ACUMULADOFISICOANT, ACUMULADOFINANCEIROANT, DIASTRABALHADOS, ACUMULADOFISICOATUAL, ACUMULADOFINANCEIROATUAL, PRESENTEFISICO, PRESENTEFINANCEIRO, EQUIPLOCID) " +
            "OUTPUT inserted.* VALUES ";

        let myQueryInsertEquipLoc = "INSERT INTO CONTRATOEQUIPLOC "+
            "(PREFIXO, OBRA, CHASSI, PLACA, CPFCNPJ, FORNECEDOR, FABRICANTE, ANO, MODELO, DESCRICAO, UNIDADE, VALOR, VALORLOCACAO, STATUS, CODIGOCONTRATO, EXTRA) "+
            "OUTPUT inserted.ID VALUES ";
        
        let itensSalvos = false;
        let equipamentoID = null;
        if (JSONMEDICAO.Itens) {
            for (var i = 0; i < JSONMEDICAO.Itens.length; i++) {
            	let itemMedicao = JSONMEDICAO.Itens[i];

            	if (itemMedicao.NOVOITEM){
            		var queryEquipamento = myQueryInsertEquipLoc + "('" + itemMedicao.PREFIXO + "', '"
            		+ JSONMEDICAO.contrato.CODCCUSTO + "', '"
            		+ itemMedicao.CHASSI +  "', '"
            		+ itemMedicao.PLACA + "', '"
            		+ itemMedicao.CPFCNPJ + "', '"
            		+ itemMedicao.FORNECEDOR.replace("'","''") + "','"
            		+ itemMedicao.FABRICANTE.replace("'","''") + "', "
            		+ itemMedicao.ANO + ", '"
            		+ itemMedicao.MODELO + "', '"
            		+ itemMedicao.DESCRICAOEQUIPAMENTO.replace("'","''") + "', '"
            		+ itemMedicao.UNIDADE + "', "
            		+ itemMedicao.VALOREQUIPAMENTO + ", "
            		+ itemMedicao.VALOR
            		+ ",3,'"
            		+ JSONMEDICAO.contrato.CODIGOCONTRATO + "', "
            		+ itemMedicao.EXTRA + ")";
            		
            		log.info(queryEquipamento);
            		let retornoEquipamento = executaQuery(queryEquipamento);
            		equipamentoID = retornoEquipamento.values[0][0];            		
            	}
            	
            	if(!equipamentoID && itemMedicao.EQUIPLOCID > 0){
            		equipamentoID = itemMedicao.EQUIPLOCID
            	}
	            
	            let itemQuery = myQueryItens + "(" + medicaoID + ", '" +
	            	itemMedicao.DESCRICAO.replace("'","''") + "', '" +
	                itemMedicao.PREFIXO + "', '" +
	                itemMedicao.UNIDADE.replace("ÃŠ", "Ê") + "', " +
	                Number(itemMedicao.VALORUNITARIO) + ", " +
	                Number(itemMedicao.ACUMULADOFISICOANT) + ", " +
	                Number(itemMedicao.ACUMULADOFINANCEIROANT) + ", " +
	                Number(itemMedicao.DIASTRABALHADOS) + ", " +
	                Number(itemMedicao.ACUMULADOFISICOATUAL) + ", " +
	                Number(itemMedicao.ACUMULADOFINANCEIROATUAL) + ", " +
	                Number(itemMedicao.PRESENTEFISICO) + ", " +
	                Number(itemMedicao.PRESENTEFINANCEIRO) + ", " +
	                equipamentoID + ")";
	            
	            executaQuery(itemQuery);
	            itensSalvos = true;
	            equipamentoID = null;
            }
        }

        if (medicaoID > 0 && itensSalvos) {
            let querySelect = "SELECT * FROM" +
                " MEDICOES M" +
                " INNER JOIN MEDICOESITENS MI ON M.MEDICAOID = MI.MEDICAOID" +
                " WHERE M.MEDICAOID = " + medicaoID;
            let dsSelectMedicao = executaQuery(querySelect);
            return dsSelectMedicao;
        }
        return medicaoSalva;*/
        myQuery = " DECLARE @MedicaoID int; " +
        " BEGIN TRY " +
        " BEGIN TRANSACTION; " +
        " SET NOCOUNT ON; " +
        " DECLARE @EquipamentoId int = null; " +
        " DECLARE @TempTable TABLE (ID INT); "

        myQuery += "INSERT INTO MEDICOES " +
            "(IDCNT, COLIGADA, OBRA, FORNECEDOR, CNPJ, CODIGOCONTRATO, PERIODOINICIAL, PERIODOFINAL, NUMEROMEDICAO, DATACOMPETENCIA, CATEGORIAPRODUTOID, PRESENTEMEDICAO, ACUMULADOANTERIOR, ACUMULADOATUAL, DESCONTOANTERIOR, DESCONTOATUAL, STATUS, POSSUIRETENCAO, RETENCAOANTERIOR, RETENCAOATUAL, POSSUIREIDI, TAXAREIDI, REIDIANTERIOR, REIDIATUAL, OPTANTEPELOSIMPLES, DESCONTOS_EXTRA, ACUMULADO_DESCONTOS_EXTRA) " +
            " OUTPUT inserted.MedicaoID INTO @TempTable " +
            "VALUES ('"
            + JSONMEDICAO.IDCNT + "', "
            + JSONMEDICAO.COLIGADA + ", '"
            + JSONMEDICAO.OBRA + "', '"
            + JSONMEDICAO.FORNECEDOR.replace("'", "''") + "', '"
            + JSONMEDICAO.CNPJ + "', '"
            + JSONMEDICAO.CODIGOCONTRATO + "', '" 
            + JSONMEDICAO.PERIODOINICIALFORMATADA + "', '" 
            + JSONMEDICAO.PERIODOFINALFORMATADA + "', " 
            + JSONMEDICAO.NUMEROMEDICAO + ", '"
            + JSONMEDICAO.DATACOMPETENCIAFORMATADA + "', " 
            + JSONMEDICAO.CATEGORIAPRODUTOID + ", "
            + JSONMEDICAO.PRESENTEMEDICAO + ", "
            + JSONMEDICAO.ACUMULADOANTERIOR + ", "
            + JSONMEDICAO.ACUMULADOATUAL + ", "
            + JSONMEDICAO.DESCONTOANTERIOR + ", "
            + JSONMEDICAO.DESCONTOATUAL + ", 1, "
            + (JSONMEDICAO.POSSUIRETENCAO ? 1 : 0) + ", "
            + JSONMEDICAO.RETENCAOANTERIOR + ", "
            + JSONMEDICAO.RETENCAOATUAL + ", "
            + (JSONMEDICAO.POSSUIREIDI ? 1 : 0) + ", "
            + JSONMEDICAO.TAXAREIDI + ", "
            + JSONMEDICAO.REIDIANTERIOR + ", "
            + JSONMEDICAO.REIDIATUAL + ", "
            +(JSONMEDICAO.OPTANTEPELOSIMPLES ? 1 : 0) + ", "
            + JSONMEDICAO.VALORDESCONTOEXTRA+ ", "
            + JSONMEDICAO.ACUMULADOVALORDESCONTOEXTRA + "); ";

        myQuery += " SET @MedicaoID = (SELECT TOP(1)ID FROM @TempTable); "

        let myQueryItens = "INSERT INTO MEDICOESITENS " +
            "(MEDICAOID, DESCRICAO, PREFIXO, UNIDADE, VALORUNITARIO, ACUMULADOFISICOANT, ACUMULADOFINANCEIROANT, DIASTRABALHADOS, ACUMULADOFISICOATUAL, ACUMULADOFINANCEIROATUAL, PRESENTEFISICO, PRESENTEFINANCEIRO, EQUIPLOCID) " +
            " VALUES ";

        let myQueryInsertEquipLoc = "INSERT INTO CONTRATOEQUIPLOC " +
            "(PREFIXO, OBRA, CHASSI, PLACA, CPFCNPJ, FORNECEDOR, FABRICANTE, ANO, MODELO, DESCRICAO, UNIDADE, VALOR, VALORLOCACAO, STATUS, CODIGOCONTRATO, EXTRA) " +
            "OUTPUT inserted.ID INTO @TempTable VALUES ";

        if (JSONMEDICAO.Itens) {
            for (var i = 0; i < JSONMEDICAO.Itens.length; i++) {
                let itemMedicao = JSONMEDICAO.Itens[i];
                if (!itemMedicao.EQUIPLOCID || !(itemMedicao.EQUIPLOCID > 0)){
                    itemMedicao.EQUIPLOCID = 0;
                }

                myQuery += "SET @EquipamentoID = null; DELETE FROM @TempTable; "
                if (itemMedicao.NOVOITEM) {
                    myQuery += myQueryInsertEquipLoc + "('" + itemMedicao.PREFIXO + "', '"
                        + JSONMEDICAO.contrato.CODCCUSTO + "', '"
                        + itemMedicao.CHASSI + "', '"
                        + itemMedicao.PLACA + "', '"
                        + itemMedicao.CPFCNPJ + "', '"
                        + itemMedicao.FORNECEDOR.replace("'", "''") + "','"
                        + itemMedicao.FABRICANTE.replace("'", "''") + "', "
                        + itemMedicao.ANO + ", '"
                        + itemMedicao.MODELO + "', '"
                        + itemMedicao.DESCRICAOEQUIPAMENTO.replace("'", "''") + "', '"
                        + itemMedicao.UNIDADE + "', "
                        + itemMedicao.VALOREQUIPAMENTO + ", "
                        + itemMedicao.VALOR
                        + ",3,'"
                        + JSONMEDICAO.contrato.CODIGOCONTRATO + "', "
                        + itemMedicao.EXTRA + "); ";
                }
            
                myQuery += " SET @EquipamentoID = (SELECT TOP(1)ID FROM @TempTable); " ;

                myQuery += myQueryItens + "(@MedicaoID, '" +
                    itemMedicao.DESCRICAO.replace("'", "''") + "', '" +
                    itemMedicao.PREFIXO + "', '" +
                    itemMedicao.UNIDADE.replace("ÃŠ", "Ê") + "', " +
                    Number(itemMedicao.VALORUNITARIO) + ", " +
                    Number(itemMedicao.ACUMULADOFISICOANT) + ", " +
                    Number(itemMedicao.ACUMULADOFINANCEIROANT) + ", " +
                    Number(itemMedicao.DIASTRABALHADOS) + ", " +
                    Number(itemMedicao.ACUMULADOFISICOATUAL) + ", " +
                    Number(itemMedicao.ACUMULADOFINANCEIROATUAL) + ", " +
                    Number(itemMedicao.PRESENTEFISICO) + ", " +
                    Number(itemMedicao.PRESENTEFINANCEIRO) + ", " +
                    "IIF(" + itemMedicao.EQUIPLOCID + " > 0, " + itemMedicao.EQUIPLOCID + ", @EquipamentoId)); ";
            }
        }

        myQuery += "COMMIT TRANSACTION; " +
            "END TRY " +
            "BEGIN CATCH " +
            "ROLLBACK TRANSACTION; " +
            "END CATCH; " +
            " SELECT @MedicaoID";

        log.info("*-*-*-*-*-*-* QUERY MEDIÇÃO - INSERT WITH TRANSACTION *-*-*-*-*-*-*")
        log.info(myQuery);
        let medicaoSalva = executaQuery(myQuery);
        let medicaoID = medicaoSalva.values[0][0];

        if (medicaoID > 0) {
            let querySelect = "SELECT "
            + " M.*," 
            + " CP.DESCRICAO 'CATEGORIAPRODUTO',"
            + " MI.* "
            + " FROM MEDICOES M"
            + " LEFT JOIN CATEGORIAPRODUTOMEDICAO CP ON CP.ID = M.CATEGORIAPRODUTOID"
            + " INNER JOIN MEDICOESITENS MI ON M.MEDICAOID = MI.MEDICAOID"
            + " WHERE M.MEDICAOID = " + medicaoID;
            let dsSelectMedicao = executaQuery(querySelect);
            return dsSelectMedicao;
        }
    }
    else if (OPERACAO == "INSERIRPROCESSOID") {
        myQuery = "UPDATE MEDICOES SET PROCESSOID = " + PROCESSOID + " WHERE MEDICAOID = " + MEDICAOID;
        log.info(myQuery);
        let dsUpdate = executaQuery(myQuery);
        return dsUpdate;
    }

    else if (OPERACAO == "ATUALIZARSTATUS") {
        myQuery = "UPDATE MEDICOES SET STATUS = " + STATUSID + " WHERE MEDICAOID = " + MEDICAOID;
        let dsUpdate = executaQuery(myQuery);
        return dsUpdate;
    }

    else if (OPERACAO == "SELECTWHEREMEDICAOID") {
        myQuery = "SELECT "
            + " M.*," 
            + " CP.DESCRICAO 'CATEGORIAPRODUTO',"
            + " MI.* "
            + " FROM MEDICOES M"
            + " LEFT JOIN CATEGORIAPRODUTOMEDICAO CP ON CP.ID = M.CATEGORIAPRODUTOID"
            + " INNER JOIN MEDICOESITENS MI ON M.MEDICAOID = MI.MEDICAOID"
            + " WHERE M.MEDICAOID = " + MEDICAOID;
        let dsRetorno = executaQuery(myQuery);
        return dsRetorno;
    }

    else if (OPERACAO == "BUSCAMEDICOESPENDENTESPORCONTRATO") {
        myQuery = "SELECT MEDICAOID, PROCESSOID, DATACOMPETENCIA, PERIODOINICIAL, PERIODOFINAL, NUMEROMEDICAO, STATUS FROM MEDICOES WHERE CODIGOCONTRATO = '" + CODIGOCONTRATO + "' AND STATUS = 1";
        let dsRetorno = executaQuery(myQuery);
        return dsRetorno;
    }

    else if (OPERACAO == "ULTIMAMEDICAOWHERECODCONTRATOOBRA") {
        myQuery = "SELECT TOP(1) "
            + "M.ACUMULADOATUAL, "
            + "M.DESCONTOATUAL + M.DESCONTOANTERIOR 'DESCONTOATUAL', "
            + "M.DESCONTOS_EXTRA + M.ACUMULADO_DESCONTOS_EXTRA 'ACUMULADO_DESCONTOS_EXTRA', "
            + "M.NUMEROMEDICAO, "
            + "M.SEGUNDAASSINATURA, "
            + "M.TERCEIRAASSINATURA, "
            + "M.CATEGORIAPRODUTOID, "
            + "M.PERIODOINICIAL, "
            + "M.PERIODOFINAL, "
            + "M.RETENCAOANTERIOR, "
            + "M.RETENCAOATUAL, "
            + "M.POSSUIREIDI, "
            + "M.TAXAREIDI, "
            + "CP.DESCRICAO 'CATEGORIAPRODUTO' "
            + "FROM MEDICOES M "
            + "LEFT JOIN CATEGORIAPRODUTOMEDICAO CP ON CP.ID = M.CATEGORIAPRODUTOID "
            + "WHERE M.CODIGOCONTRATO = '" + CODIGOCONTRATO
            + "' AND M.OBRA = '" + GCCUSTO
            + "' ORDER BY M.MEDICAOID DESC ";

        let dsUltimaMedicao = executaQuery(myQuery);
        return dsUltimaMedicao;
    }

    else if (OPERACAO == "ULTIMASMEDICOESITENSWHERECODCONTRATO") {
        myQuery = "SELECT  * FROM MEDICOESITENS "
            + "WHERE MEDICAOID IN ( "
            + "SELECT TOP(1) "
            + "MEDICAOID "
            + "FROM MEDICOES WHERE CODIGOCONTRATO = '" + CODIGOCONTRATO + "' "
            + "ORDER BY MEDICAOID DESC);";

        let dsRetorno = executaQuery(myQuery);
        return dsRetorno;
    }

    else if (OPERACAO == "SELECTWHERECODCONTRATO") {
        myQuery = "SELECT * FROM MEDICOES\
        WHERE MEDICOES.CODIGOCONTRATO = '" + CODIGOCONTRATO;
        let dsMedicao = executeQuery(myQuery);
        myQuery = "SELECT * FROM MEDICOESITENS\
        	WHERE MEDICOESITENS.MEDICAOID = " + dsMedicao.MEDICAOID;
        let dsMedicaoItens = executeQuery(myQuery);
        dsMedicao.Itens = dsMedicaoItens;
        return dsMedicao;
    }
    
    else if(OPERACAO == "DELETEITENS"){
    	let prefixoString = "";
    	let medicaoItensString = "";
    	let contratoItemString = "";
    	
    	for (var i = 0; i < JSONITENS.length; i++) {
    		let item = JSONITENS[i];
    	
    		if (item.PREFIXO != null && item.PREFIXO != "")
    			prefixoString += "'" + item.PREFIXO + "',";

        	if (item.MEDICAOITEMID > 0)
        		medicaoItensString += item.MEDICAOITEMID + ",";
        
        	if (item.CONTRATOITEMID > 0)
        		contratoItemString += item.CONTRATOITEMID + ","
        }
        
        if (prefixoString != "") {
            let prefixosString = "(" + prefixoString.slice(0, -1) + ")";
            myQuery = "UPDATE CONTRATOEQUIPLOC SET STATUS = -3 WHERE CODIGOCONTRATO = " + CODIGOCONTRATO + " AND PREFIXO IN " + prefixosString;
            executaQuery(myQuery);
        }
        if (medicaoItensString != "") {
            let medicaoItensString = "(" + medicaoItensString.slice(0, -1) + ")";
            myQuery = "DELETE FROM MEDICOESITENS WHERE MEDICAOITEMID IN " + medicaoItensString;
            executaQuery(myQuery);
        }
        if (contratoItemString != "") {
            let contratoItemString = "(" + contratoItemString.slice(0, -1) + ")";
            myQuery = "DELETE FROM CONTRATOITEM WHERE CONTRATOITEMID IN " + contratoItemString;
            executaQuery(myQuery);
        }
        
        return;
    }

    else if (OPERACAO == "SELECTCONTRATOSRM") {
        let queryRM = "SELECT "
            + "TCNT.IDCNT, "
            + "TCNT.CODCOLIGADA, "
            + "TCNT.CODIGOCONTRATO, "
            + "TCNT.CODCCUSTO, "
            + "FCFO.NOMEFANTASIA AS FORNECEDOR, "
            + "FCFO.CGCCFO, "
            + "TTCN.DESCRICAO AS TIPOCONTRATO, "
            + "TSTACNT.DESCRICAO AS STATUS "
            + "FROM TCNT "
            + "INNER JOIN TITMCNT ON TCNT.IDCNT = TITMCNT.IDCNT "
            + "INNER JOIN FCFO ON TCNT.CODCFO = FCFO.CODCFO AND FCFO.CODCOLIGADA IN (0, 1) "
            + "INNER JOIN TTCN ON TTCN.CODTCN = TCNT.CODTCN AND TTCN.CODCOLIGADA = TCNT.CODCOLIGADA "
            + "INNER JOIN TSTACNT ON TSTACNT.CODSTACNT = TCNT.CODSTACNT AND TSTACNT.CODCOLIGADA = TCNT.CODCOLIGADA "
            + "WHERE TITMCNT.CODTMV = '1.1.99' "
            + "AND TCNT.CODCCUSTO = '" + GCCUSTO + "'"
            + "AND TCNT.CODCOLIGADA = " + CODCOLIGADA + ";";

        let dsContratosRM = executaQueryRM(queryRM);
        return dsContratosRM;
    }

    else if (OPERACAO == "REMOVERMEDICAO") {
        let response = null;

        myQuery = "SELECT MEDICAOID FROM MEDICOES WHERE PROCESSOID = " + PROCESSOID;
        let medicao = executaQuery(myQuery);
        let medicaoID = medicao.values[0][0];

        myQuery = "DELETE FROM MEDICOESITENS WHERE MEDICAOID = " + medicaoID;
        response = executaQuery(myQuery);

        myQuery = "DELETE FROM MEDICOES WHERE MEDICAOID = " + medicaoID;
        response = executaQuery(myQuery);

        return response;
    }

    else if (OPERACAO == "SELECTMEDICOESWHERECODCONTRATO") {
        myQuery = "SELECT * FROM MEDICOES WHERE CODIGOCONTRATO IN (" + CODIGOSCONTRATO + ");";
        let dsMedicoes = executaQuery(myQuery);
        return dsMedicoes;
    }

    else if (OPERACAO == "SELECTCATEGORIASPRODUTOMEDICAO") {
        myQuery = "SELECT * FROM CATEGORIAPRODUTOMEDICAO;";
        log.info(myQuery);
        let dsCategorias = executaQuery(myQuery);
        return dsCategorias;
    }

    else if (OPERACAO == "REMOVERMEDICAOPORID"){
        myQuery = "DELETE FROM MEDICOESITENS WHERE MEDICAOID = " + MEDICAOID;
        myQuery += " DELETE FROM MEDICOES WHERE MEDICAOID = " + MEDICAOID;
        
        let medicoes = executaQuery(myQuery);

        return medicoes;
    }
    else if (OPERACAO == "BUSCARDESCONTO") {
        myQuery = "SELECT VALORDESCONTO FROM CONTRATODESCONTO WHERE CODIGOCONTRATO = '" + CODIGOCONTRATO + "'";
        log.info(myQuery);
        return executaQuery(myQuery);
    }
    else if (OPERACAO == "UPDATEDESCONTO") {
        myQuery = "UPDATE CONTRATODESCONTO SET VALORDESCONTO = " + VALORDESCONTO + " WHERE CODIGOCONTRATO = '" + CODIGOCONTRATO + "'";
        log.info(myQuery);
        return executaQuery(myQuery);
    }
    else if (OPERACAO == "BUSCARDESCONTODETALHADO") {
        myQuery = "SELECT [dt_ordem]"
                + ",[num_equipamento]"
                + ",[dt_ano]"
                + ",[dt_mes]"
                + ",[num_OS]"
                + ",[item_OS]"
                + ",[des_centro_custo_pagamento]"
                + ",[cod_centro_custo_pagamento]"
                + ",[vlr_total]"
            + " FROM [CastilhoObras].[dbo].[silver_pecas]"
            + " WHERE cod_alocacao_despesa = 1"
            + " AND st_terceiro = 1"
            + " AND cod_centro_custo_pagamento = '" + GCCUSTO + "'" // Código da obra
            //+ " AND num_equipamento IN " + PREFIXOS           // Código do prefixo;
            + " ORDER BY [dt_ano],[dt_mes],[dt_ordem],[des_fornecedor] ASC"
        log.info(myQuery);
        return executaQueryCastilhoObras(myQuery);
    }

    else if (OPERACAO == "SETULTIMOPDF"){
        myQuery = "UPDATE MEDICOES SET ULTIMOPDFID = " + DOCID + " WHERE MEDICAOID = " + MEDICAOID; 
        log.info(myQuery);
        return executaQuery(myQuery);
    }

    else if (OPERACAO == "GETULTIMOPDF"){
        myQuery = "SELECT ULTIMOPDFID FROM MEDICOES WHERE MEDICAOID = " + MEDICAOID;    
        log.info(myQuery);
        let resultado = executaQuery(myQuery);
        return resultado;
    }

    else if (OPERACAO == "UPDATE") {
        myQuery = "UPDATE MEDICOES SET "
            + " OBRA = '" + JSONMEDICAO.OBRA
            + "', FORNECEDOR = '" + JSONMEDICAO.FORNECEDOR.replace("'","''")
            + "', CNPJ = '" + JSONMEDICAO.CNPJ
            + "', PERIODOINICIAL = '" + JSONMEDICAO.PERIODOINICIALFORMATADA
            + "', PERIODOFINAL = '" + JSONMEDICAO.PERIODOFINALFORMATADA
            + "', NUMEROMEDICAO = '" + JSONMEDICAO.NUMEROMEDICAO
            + "', DATACOMPETENCIA = '" + JSONMEDICAO.DATACOMPETENCIAFORMATADA
            + "', PRESENTEMEDICAO = " + JSONMEDICAO.PRESENTEMEDICAO
            + ", ACUMULADOATUAL = " + JSONMEDICAO.ACUMULADOATUAL
            + ", DESCONTOATUAL = " + JSONMEDICAO.DESCONTOATUAL
            + ", DESCONTOANTERIOR = " + JSONMEDICAO.DESCONTOANTERIOR
            + ", ACUMULADOANTERIOR = " + JSONMEDICAO.ACUMULADOANTERIOR
            + ", SEGUNDAASSINATURA = '" + JSONMEDICAO.SEGUNDAASSINATURA
            + "', TERCEIRAASSINATURA = '" + JSONMEDICAO.TERCEIRAASSINATURA
            + "', CATEGORIAPRODUTOID = " + JSONMEDICAO.CATEGORIAPRODUTOID
            + ", POSSUIRETENCAO = " + (JSONMEDICAO.POSSUIRETENCAO ? 1 : 0)
            + ", RETENCAOANTERIOR = " + (JSONMEDICAO.RETENCAOANTERIOR)
            + ", RETENCAOATUAL = " + (JSONMEDICAO.RETENCAOATUAL)
            + ", POSSUIREIDI = " + (JSONMEDICAO.POSSUIREIDI ? 1 : 0)
            + ", TAXAREIDI = " + (JSONMEDICAO.TAXAREIDI)
            + ", REIDIANTERIOR = " + (JSONMEDICAO.REIDIANTERIOR)
            + ", REIDIATUAL = " + (JSONMEDICAO.REIDIATUAL)
            + ", OPTANTEPELOSIMPLES = " + (JSONMEDICAO.OPTANTEPELOSIMPLES ? 1 : 0)
            + ", DESCONTOS_EXTRA = " + JSONMEDICAO.VALORDESCONTOEXTRA
            + " WHERE MEDICAOID = " + JSONMEDICAO.MEDICAOID + ";";
        log.info(myQuery);

        executaQuery(myQuery);

        let myQueryUpdate = "";
        let myQueryItens = "INSERT INTO MEDICOESITENS " +
            "(MEDICAOID, DESCRICAO, PREFIXO, UNIDADE, VALORUNITARIO, ACUMULADOFISICOANT, ACUMULADOFINANCEIROANT, DIASTRABALHADOS, ACUMULADOFISICOATUAL, ACUMULADOFINANCEIROATUAL, PRESENTEFISICO, PRESENTEFINANCEIRO, EQUIPLOCID) " +
            "VALUES ";

        let myQueryUpdateEquipLoc = "";
        let myQueryInsertEquipLoc = "INSERT INTO CONTRATOEQUIPLOC "+
	        "(PREFIXO, OBRA, CHASSI, PLACA, CPFCNPJ, FORNECEDOR, FABRICANTE, ANO, MODELO, DESCRICAO, UNIDADE, VALOR, VALORLOCACAO, STATUS, CODIGOCONTRATO, EXTRA) "+
	        "OUTPUT inserted.ID VALUES ";

        let temItensNovos = false;
        let atualizadoEquipLoc = false;
        let itensSalvos = false;
        let equipamentoID = null;
        
        for (var i = 0; i < JSONMEDICAO.Itens.length; i++) {
        	let itemMedicao = JSONMEDICAO.Itens[i];

        	if (itemMedicao.NOVOITEM){
        		var queryEquipamento = myQueryInsertEquipLoc + "('" + itemMedicao.PREFIXO + "', '"
        		+ JSONMEDICAO.contrato.CODCCUSTO + "', '"
        		+ itemMedicao.CHASSI +  "', '"
        		+ itemMedicao.PLACA + "', '"
        		+ itemMedicao.CPFCNPJ + "', '"
        		+ itemMedicao.FORNECEDOR.replace("'","''") + "','"
        		+ itemMedicao.FABRICANTE.replace("'","''") + "', "
        		+ itemMedicao.ANO + ", '"
        		+ itemMedicao.MODELO + "', '"
        		+ itemMedicao.DESCRICAOEQUIPAMENTO.replace("'","''") + "', '"
        		+ itemMedicao.UNIDADE + "', "
        		+ itemMedicao.VALOREQUIPAMENTO + ", "
        		+ itemMedicao.VALOR
        		+ ",3,'"
        		+ JSONMEDICAO.contrato.CODIGOCONTRATO + "', "
        		+ itemMedicao.EXTRA + ")";
        		
        		let retornoEquipamento = executaQuery(queryEquipamento);
        		equipamentoID = retornoEquipamento.values[0][0];    
        		
        		if(!equipamentoID){
            		equipamentoID = itemMedicao.EQUIPLOCID
            	}
        		
        		let itemQuery = myQueryItens + "(" + JSONMEDICAO.MEDICAOID + ", '" +
            	itemMedicao.DESCRICAO.replace("'","''") + "', '" +
                itemMedicao.PREFIXO + "', '" +
                itemMedicao.UNIDADE.replace("ÃŠ", "Ê") + "', " +
                Number(itemMedicao.VALORUNITARIO) + ", " +
                Number(itemMedicao.ACUMULADOFISICOANT) + ", " +
                Number(itemMedicao.ACUMULADOFINANCEIROANT) + ", " +
                Number(itemMedicao.DIASTRABALHADOS) + ", " +
                Number(itemMedicao.ACUMULADOFISICOATUAL) + ", " +
                Number(itemMedicao.ACUMULADOFINANCEIROATUAL) + ", " +
                Number(itemMedicao.PRESENTEFISICO) + ", " +
                Number(itemMedicao.PRESENTEFINANCEIRO) + ", " +
                equipamentoID + ")";
            
        		log.info(itemQuery);
        		executaQuery(itemQuery);
        	}
            
            //EQUIPAMENTOS LOCAÇÃO
            if (!itemMedicao.CONTRATOITEMID && itemMedicao.UNIDADE != "" && itemMedicao.UNIDADE != null && itemMedicao.UNIDADE != undefined) {
                atualizadoEquipLoc = true;
                let queryUpdateEquipLoc = "UPDATE CONTRATOEQUIPLOC SET UNIDADE = '" + itemMedicao.UNIDADE.replace("ÃŠ", "Ê") + "' ";
                queryUpdateEquipLoc += "WHERE ID = '" + itemMedicao.EQUIPLOCID + "'";
                executaQuery(queryUpdateEquipLoc);
            }
            

            //MEDIÇÃO ITENS
            if (!itemMedicao.NOVOITEM){
                myQueryUpdate += "UPDATE MEDICOESITENS SET "
                	+ " ACUMULADOFISICOANT = " + Number(itemMedicao.ACUMULADOFISICOANT)
                	+ ", ACUMULADOFINANCEIROANT = " + Number(itemMedicao.ACUMULADOFINANCEIROANT)
                	+ ", DIASTRABALHADOS = " + Number(itemMedicao.DIASTRABALHADOS)
                	+ ", ACUMULADOFISICOATUAL = " + Number(itemMedicao.ACUMULADOFISICOATUAL)
                	+ ", ACUMULADOFINANCEIROATUAL = " + Number(itemMedicao.ACUMULADOFINANCEIROATUAL)
                	+ ", PRESENTEFISICO = " + Number(itemMedicao.PRESENTEFISICO)
                	+ ", PRESENTEFINANCEIRO = " + Number(itemMedicao.PRESENTEFINANCEIRO)
                	+ " WHERE MEDICOESITENS.MEDICAOITEMID = " + itemMedicao.MEDICAOITEMID + "; ";
            }

        }
        
        log.info(myQueryUpdate);

        executaQuery(myQueryUpdate);


        let queryRetorno = "SELECT "
            + " M.*," 
            + " CP.DESCRICAO 'CATEGORIAPRODUTO',"
            + " MI.* "
            + " FROM MEDICOES M"
            + " LEFT JOIN CATEGORIAPRODUTOMEDICAO CP ON CP.ID = M.CATEGORIAPRODUTOID"
            + " INNER JOIN MEDICOESITENS MI ON M.MEDICAOID = MI.MEDICAOID"
            + " WHERE M.MEDICAOID = " + JSONMEDICAO.MEDICAOID;
        return executaQuery(queryRetorno);
    } else {
        return "CadastroDeEquipamentos: Operação inválida";
    }

    return;
} function onMobileSync(user) {

}

function executaQuery(query) {
    var newDataset = DatasetBuilder.newDataset();
    var dataSource = "/jdbc/CastilhoCustom";
    var ic = new javax.naming.InitialContext();
    var ds = ic.lookup(dataSource);
    var created = false;

    try {
        var conn = ds.getConnection();
        var stmt = conn.createStatement();
        var rs = stmt.executeQuery(query);
        var columnCount = rs.getMetaData().getColumnCount();

        while (rs.next()) {
            if (!created) {
                for (var i = 1; i <= columnCount; i++) {
                    newDataset.addColumn(rs.getMetaData().getColumnName(i));
                }
                created = true;
            }
            var Arr = new Array();
            for (var i = 1; i <= columnCount; i++) {
                var obj = rs.getObject(rs.getMetaData().getColumnName(i));
                if (null != obj) {
                    Arr[i - 1] = rs.getObject(rs.getMetaData().getColumnName(i)).toString();
                } else {
                    Arr[i - 1] = "   -   ";
                }
            }

            newDataset.addRow(Arr);
        }
    } catch (e) {
        log.error("ERRO==============> " + e.message);
        newDataset.addColumn("coluna");
        newDataset.addRow(["deu erro! "]);
        newDataset.addRow([e.message]);
        newDataset.addRow([query]);

    } finally {
        if (stmt != null) {
            stmt.close();
        }
        if (conn != null) {
            conn.close();
        }
    }

    return newDataset;
}

function executaQueryRM(query) {
    var newDataset = DatasetBuilder.newDataset();
    var dataSource = "/jdbc/FluigRM";
    var ic = new javax.naming.InitialContext();
    var ds = ic.lookup(dataSource);
    var created = false;

    try {
        var conn = ds.getConnection();
        var stmt = conn.createStatement();
        var rs = stmt.executeQuery(query);
        var columnCount = rs.getMetaData().getColumnCount();

        while (rs.next()) {
            if (!created) {
                for (var i = 1; i <= columnCount; i++) {
                    newDataset.addColumn(rs.getMetaData().getColumnName(i));
                }
                created = true;
            }
            var Arr = new Array();
            for (var i = 1; i <= columnCount; i++) {
                var obj = rs.getObject(rs.getMetaData().getColumnName(i));
                if (null != obj) {
                    Arr[i - 1] = rs.getObject(rs.getMetaData().getColumnName(i)).toString();
                } else {
                    Arr[i - 1] = "   -   ";
                }
            }

            newDataset.addRow(Arr);
        }
    } catch (e) {
        log.error("ERRO==============> " + e.message);
        newDataset.addColumn("coluna");
        newDataset.addRow(["deu erro! "]);
        newDataset.addRow([e.message]);
        newDataset.addRow([query]);

    } finally {
        if (stmt != null) {
            stmt.close();
        }
        if (conn != null) {
            conn.close();
        }
    }

    return newDataset;
}

function executaQueryCastilhoObras(query) {
    var newDataset = DatasetBuilder.newDataset();
    var dataSource = "/jdbc/CastilhoObras";
    var ic = new javax.naming.InitialContext();
    var ds = ic.lookup(dataSource);
    var created = false;

    try {
        var conn = ds.getConnection();
        var stmt = conn.createStatement();
        var rs = stmt.executeQuery(query);
        var columnCount = rs.getMetaData().getColumnCount();

        while (rs.next()) {
            if (!created) {
                for (var i = 1; i <= columnCount; i++) {
                    newDataset.addColumn(rs.getMetaData().getColumnName(i));
                }
                created = true;
            }
            var Arr = new Array();
            for (var i = 1; i <= columnCount; i++) {
                var obj = rs.getObject(rs.getMetaData().getColumnName(i));
                if (null != obj) {
                    Arr[i - 1] = rs.getObject(rs.getMetaData().getColumnName(i)).toString();
                } else {
                    Arr[i - 1] = "   -   ";
                }
            }

            newDataset.addRow(Arr);
        }
    } catch (e) {
        log.error("ERRO==============> " + e.message);
        newDataset.addColumn("coluna");
        newDataset.addRow(["deu erro! "]);
        newDataset.addRow([e.message]);
        newDataset.addRow([query]);

    } finally {
        if (stmt != null) {
            stmt.close();
        }
        if (conn != null) {
            conn.close();
        }
    }

    return newDataset;
}