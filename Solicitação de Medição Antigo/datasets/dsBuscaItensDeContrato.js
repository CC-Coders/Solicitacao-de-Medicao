function createDataset(fields, constraints, sortFields) {
    try {
        var constraints = getConstraints(constraints);
        if (constraints.CODCOLIGADA == undefined || constraints.CODCOLIGADA == null || constraints.CODCOLIGADA == "" || constraints.IDCNT == undefined || constraints.IDCNT == null || constraints.IDCNT == "") {
            throw "Parâmetros obrigatorios (CODCOLIGADA, IDCNT)";
        }

        var itens =  buscaItensDoContrato(constraints.CODCOLIGADA, constraints.IDCNT)
        return returnDataset("SUCESSO", "", JSONUtil.toJSON(itens));
    } catch (error) {
        if (typeof error == "object") {
            var mensagem = [];
            var keys = Object.keys(error);
            for (var i = 0; i < keys.length; i++) {
                mensagem.push(keys[i] + ": " + error[keys[i]]);
            }

            return returnDataset("ERRO", mensagem.join(" - "), null);
        } else {
            return returnDataset("ERRO", error, null);
        }
    }
}


function buscaItensDoContrato(CODCOLIGADA, IDCNT) {
    try {
        var query = "";
        query += "SELECT ITEM.NSEQITMCNT, PRODUTO.IDPRD, PRODUTO.CODIGOPRD, PRODUTO.NOMEFANTASIA, MAX(MEDICOES.NSEQMEDICAO) as NSEQMEDICAO "
        query += "FROM TCNT CONTRATO "
        query += "    INNER JOIN TITMCNT ITEM ON CONTRATO.IDCNT = ITEM.IDCNT AND  ITEM.CODCOLIGADA = CONTRATO.CODCOLIGADA "
        query += "    INNER JOIN TPRODUTO PRODUTO ON ITEM.CODCOLIGADA = PRODUTO.CODCOLPRD AND ITEM.IDPRD = PRODUTO.IDPRD "
        query += "    LEFT JOIN TITMCNTMEDICAO MEDICOES ON CONTRATO.CODCOLIGADA = MEDICOES.CODCOLIGADA AND CONTRATO.IDCNT = MEDICOES.IDCNT "
        query += "WHERE CONTRATO.CODCOLIGADA = ? AND CONTRATO.IDCNT = ? ";
        query += "GROUP BY ITEM.NSEQITMCNT,  PRODUTO.IDPRD, PRODUTO.CODIGOPRD, PRODUTO.NOMEFANTASIA";

        var retorno = executaQuery(query, [CODCOLIGADA, IDCNT]);
        return retorno;
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
function returnDataset(STATUS, MENSAGEM, RESULT) {
    var dataset = DatasetBuilder.newDataset();
    dataset.addColumn("STATUS");
    dataset.addColumn("MENSAGEM");
    dataset.addColumn("RESULT");
    dataset.addRow([STATUS, MENSAGEM, RESULT]);
    return dataset;
}
function executaQuery(query, values) {
    try {
        var dataSource = "/jdbc/RM";
        var ic = new javax.naming.InitialContext();
        var ds = ic.lookup(dataSource);

        var conn = ds.getConnection();
        var stmt = conn.prepareStatement(query);

        stmt.setInt(1, values[0]);//CODCOLIGADA
        stmt.setInt(2, values[1]);//IDCNT

        var rs = stmt.executeQuery();
        var retorno = [];
        var columnCount = rs.getMetaData().getColumnCount();

        while (rs.next()) {
            var linha = {};
            for (var i = 1; i <= columnCount; i++) {
                linha[rs.getMetaData().getColumnName(i)] = rs.getObject(rs.getMetaData().getColumnName(i));
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