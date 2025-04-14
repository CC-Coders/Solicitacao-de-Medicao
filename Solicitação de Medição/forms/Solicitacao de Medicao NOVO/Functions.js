let sourcesImagesLogo = [];

function BuscaObras() {
    var c1 = DatasetFactory.createConstraint("colleagueId", $("#userCode").val(), $("#userCode").val(), ConstraintType.MUST);
    var c2 = DatasetFactory.createConstraint("groupId", "Controladoria", "Controladoria", ConstraintType.SHOULD);
    var c3 = DatasetFactory.createConstraint("groupId", "Administrador TI", "Administrador TI", ConstraintType.SHOULD);
    var ds = DatasetFactory.getDataset("colleagueGroup", null, [c1, c2, c3], null);
    var constraints = [];
    if (ds.values.length > 0 || $("#userCode").val() == "rodrigo.ramos") {
        constraints.push(DatasetFactory.createConstraint("permissaoGeral", "true", "true", ConstraintType.MUST));
    }
    constraints.push(DatasetFactory.createConstraint("usuario", $("#userCode").val(), $("#userCode").val(), ConstraintType.MUST));

    var ds = DatasetFactory.getDataset("BuscaPermissaoColigadasUsuario", null, constraints, null);
    if (ds.values.length > 0) {
        $("#obraSelect").html("<option></option>");
        var coligadaGroup = null;
        for (var i = 0; i < ds.values.length; i++) {
            if (coligadaGroup != ds.values[i].NOMEFANTASIA) {
                coligadaGroup = ds.values[i].NOMEFANTASIA;
                $("#obraSelect").append("<optgroup label='" + ds.values[i].CODCOLIGADA + " - " + ds.values[i].NOMEFANTASIA + "'></optgroup>");
            }

            $("#obraSelect")
                .find("optgroup:last")
                .append("<option value='" + ds.values[i].CODCOLIGADA + " - " + ds.values[i].CODCCUSTO + " - " + ds.values[i].perfil + "'>" + ds.values[i].CODCCUSTO + " - " + ds.values[i].perfil + "</option>");
        }
    }
    else{
        DatasetFactory.getDataset("colleagueGroup", null, [
            DatasetFactory.createConstraint("colleagueId",  $("#userCode").val(),  $("#userCode").val(), ConstraintType.MUST),
            DatasetFactory.createConstraint("groupId", "Obra", "Obra", ConstraintType.MUST, true),
        ], null,{
            success: (ds=>{
                $("#obraSelect").html("<option></option>");
                ds.values.forEach(obra=>{
                    DatasetFactory.getDataset("GCCUSTO", null,[
                        DatasetFactory.createConstraint("NOME", obra["colleagueGroupPK.groupId"], obra["colleagueGroupPK.groupId"], ConstraintType.MUST)
                    ], null, {
                        success: (ccusto=>{
                            $("#obraSelect").append("<option value='" + ccusto.values[0].CODCOLIGADA + " - " + ccusto.values[0].CODCCUSTO + " - " + ccusto.values[0].NOME + "'>" + ccusto.values[0].CODCCUSTO + " - " + ccusto.values[0].NOME + "</option>");
                        }),
                        error:(error=>{
                            FLUIGC.toast({
                                title: "Erro ao buscar obras: ",
                                message: error,
                                type: "warning"
                            });
                        })
                    })
                })
            }),
            error:(error=>{
                FLUIGC.toast({
                    title: "Erro ao buscar obras: ",
                    message: error,
                    type: "warning"
                });
            })
        });
    }
}

function obterInformacoesContrato() {
    const contrato = JSON.parse($("#ObjContrato").val());
    const ccusto = {
        COLIGADA: $("#coligada").val(),
        CODCCUSTO: $("#ccusto").val(),
        NOME: $("#obra").val(),
    };
    const fornecedor = {
        NOMEFANTASIA: $("#fornecedor").val(),
        CGCCFO: $("#CNPJFornecedor").val(),
        CODCFO: $("#codFornecedor").val(),
        NOME: $("#nomeFornecedor").val(),
        CIDADE: $("#cidadeFornecedor").val(),
        ESTADO: $("#estadoFornecedor").val(),
        OPTANTEPELOSIMPLES: $("#optanteSimples").val()
    };
    const atividade = $("#atividade").val();
    const medicaoEditarID = $("#medicaoEditarID").val();

    return {
        contrato: contrato,
        ccusto: ccusto,
        fornecedor: fornecedor,
        atividade: atividade,
        medicaoEditarID: medicaoEditarID
    }
}

function clicarBotao(referencia){
    $("#" + referencia).click();
}

function exibirPainelOperacoes() {
    $("#divCollapse").show();
    $("#divImageColigada").show();
}

function retornarSelecaoInicial() {
    $("#divListaContratos").show();
    $("#divSelectFornecedorCNPJ").show();
    $("#divSelectFornecedor").show();
}

function BuscaContratosDoFornecedor(cnpj) {
    var c1 = DatasetFactory.createConstraint("Operacao", "BuscaContratosPorFornecedorEFiliais", "BuscaContratosPorFornecedorEFiliais", ConstraintType.MUST);
    var c2 = DatasetFactory.createConstraint("CGCCFO", cnpj, cnpj, ConstraintType.MUST);
    var c3 = DatasetFactory.createConstraint("GCCUSTO", $("#ccusto").val(), $("#ccusto").val(), ConstraintType.MUST);
    var c4 = DatasetFactory.createConstraint("CODCOLIGADA", $("#coligada").val(), $("#coligada").val(), ConstraintType.MUST);
    var contratos = DatasetFactory.getDataset("DatasetMedicoes", null, [c1, c2, c3, c4], null).values;

    table.clear().draw();
    table.rows.add(contratos); // Add new data
    setTimeout(() => {
        table.columns.adjust().draw();
    }, 200);
}

function BuscaContratos() {
    var c1 = DatasetFactory.createConstraint("Operacao", "BuscaContratos", "BuscaContratos", ConstraintType.MUST);
    var c2 = DatasetFactory.createConstraint("GCCUSTO", $("#ccusto").val(), $("#ccusto").val(), ConstraintType.MUST);
    var c3 = DatasetFactory.createConstraint("CODCOLIGADA", $("#coligada").val(), $("#coligada").val(), ConstraintType.MUST);
    var contratos = DatasetFactory.getDataset("DatasetMedicoes", null, [c1, c2, c3], null).values;

    table.clear().draw();
    table.rows.add(contratos); // Add new data
    setTimeout(() => {
        table.columns.adjust().draw();
    }, 200);
}

function BuscarMedicoesPendentesPorContrato(codigoContrato) {
    var c1 = DatasetFactory.createConstraint("OPERACAO", "BUSCAMEDICOESPENDENTESPORCONTRATO", "BUSCAMEDICOESPENDENTESPORCONTRATO", ConstraintType.MUST);
    var c2 = DatasetFactory.createConstraint("CODIGOCONTRATO", codigoContrato, codigoContrato, ConstraintType.MUST);
    var ds = DatasetFactory.getDataset("dsMedicoes", null, [c1, c2], null).values;
    return ds;
}

function BuscaContratoPorCodigo(CODIGOCONTRATO) {
    var c1 = DatasetFactory.createConstraint("Operacao", "BuscaContratoPorCodigo", "BuscaContratoPorCodigo", ConstraintType.MUST);
    var c2 = DatasetFactory.createConstraint("GCCUSTO", $("#ccusto").val(), $("#ccusto").val(), ConstraintType.MUST);
    var c3 = DatasetFactory.createConstraint("CODCOLIGADA", $("#coligada").val(), $("#coligada").val(), ConstraintType.MUST);
    var c4 = DatasetFactory.createConstraint("CODIGOCONTRATO", CODIGOCONTRATO, CODIGOCONTRATO, ConstraintType.MUST);
    var ds = DatasetFactory.getDataset("DatasetMedicoes", null, [c1, c2, c3, c4], null).values[0];

    if (ds != undefined) {
        PreencheInfoContrato(ds);
        $("#divListaContratos").hide();
        $("#divCollapse").show();
        $("#ObjContrato").val(JSON.stringify(ds));
        $("#CodigoContrato").val(ds.CODIGOCONTRATO);
    }
}

function BuscaMedicoesAnterioresDoContrato(CODCOLIGADA, IDCNT) {
    var c1 = DatasetFactory.createConstraint("Operacao", "BuscaMedicoesDoContrato", "BuscaMedicoesDoContrato", ConstraintType.MUST);
    var c2 = DatasetFactory.createConstraint("CODCOLIGADA", CODCOLIGADA, CODCOLIGADA, ConstraintType.MUST);
    var c3 = DatasetFactory.createConstraint("IDCNT", IDCNT, IDCNT, ConstraintType.MUST);
    var medicoes = DatasetFactory.getDataset("DatasetMedicoes", null, [c1, c2, c3], null).values;
    return medicoes;
}

function BuscarDescontosSisma(prefixosQuery, centroCusto) {
    var c1 = DatasetFactory.createConstraint("OPERACAO", "BUSCARDESCONTODETALHADO", "BUSCARDESCONTODETALHADO", ConstraintType.SHOULD);
    var c2 = DatasetFactory.createConstraint("PREFIXOS", prefixosQuery, prefixosQuery, ConstraintType.SHOULD);
    var c3 = DatasetFactory.createConstraint("GCCUSTO", centroCusto, centroCusto, ConstraintType.SHOULD);
    var descontos = DatasetFactory.getDataset("DatasetMedicoes", null, [c1, c2, c3], null).values;
    return descontos;
}

function showDetails(listMovimentos) {
    console.log(listMovimentos);
    var html = "";
    if (listMovimentos.length < 1) {
        html = "<h3>Nenhuma medição encontrada!</h3>";
    }
    else {
        html =
            "<div>\
            <h3>Últimas Medições</h3>\
            <table class='table table-bordered'>\
                <thead>\
                    <th>Coligada</th>\
                    <th>Movimento</th>\
                    <th>Data Competência</th>\
                    <th>Valor</th>\
                    <th>Retenção</th>\
                    <th>Status</th>\
                </thead>\
                <tbody>";
        for (var i = 0; i < listMovimentos.length; i++) {
            var coligada = BuscaColigada(listMovimentos[i].CODCOLIGADA);
            coligada = coligada.CODCOLIGADA + " - " + coligada.NOMEFANTASIA;

            html +=
                "<tr>\
                            <td>" + coligada + "</td>\
                            <td>" + listMovimentos[i].IDMOV + "</td>\
                            <td>" + (listMovimentos[i].DATACOMPETENCIA == "   -   " ? " - " : FormataDataParaDD_MM_AAAA(listMovimentos[i].DATACOMPETENCIA)) + "</td>\
                            <td>" + FormataValor(listMovimentos[i].VALORBRUTOORIG) + "</td>\
                            <td>" +
                (!isNaN(listMovimentos[i].RETENCAO) ? FormataValor(listMovimentos[i].RETENCAO) : " - ") +
                "</td>\
                            <td>" + (listMovimentos[i].STATUS == "F" ? "Recebido" : (listMovimentos[i].TIPOAPROVACAO == 1 || listMovimentos[i].TIPOAPROVACAO == 3) ? "Aprovado" : "Aberto") + "</td>\
                        </tr>";
        }
        html += "</tbody>\
            </table>\
        </div>";

    }

    console.log("html: " + html);
    return html;
}

function PreencheInfoContrato(values) {
    if (values.HISTORICOLONGO && values.HISTORICOLONGO.includes("_detailsProcessInstanceID=")) {
        $("#linkContrato").attr("href", "http://fluig.castilho.com.br:1010/portal/p/1/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID=" + values.HISTORICOLONGO.split("_detailsProcessInstanceID=")[1].split(" ")[0].split(/(\d+)/)[1]);
        $("#linkContrato").attr("target", "_blank");
    } else {
        $("#linkContrato").attr("target", "_blank");
        $("#linkContrato").removeAttr("href");
    }

    $("#spanCodigoContrato").text(values.CODIGOCONTRATO);
    $("#spanTipoContrato").text(values.TIPOCONTRATO);
    $("#spanDescContrato").text(values.CONTRATO);
    $("#spanObra").text($("#obra").val());
    $("#spanFornecedor").text(values.FORNECEDOR);
    $("#fornecedor").val(values.FORNECEDOR);
    $("#spanCNPJFornecedor").text(values.CGCCFO);
    $("#spanStatusContrato").text(values.STATUS);
    $("#cidadeFornecedor").text(values.CIDADE);
    $("#estadoFornecedor").text(values.CODETD);
    $("#optanteSimples").val(values.OPTANTEPELOSIMPLES);
}

function CriaDocFluig(idInput, idPasta) {
    var files = $("#" + idInput)[0].files;
    var fileName = "";
    fileName = files[0].name;
    fileName = fileName.normalize('NFD').replace(/[\u0300-\u036f]/g, "");

    if (idInput == "inputFileMedicao") {
        $("#divBoletimMedicao").show();
        myLoading1 = FLUIGC.loading('#divBoletimMedicao');
        myLoading1.show();
    }

    var reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = function (e) {
        var bytes = e.target.result.split("base64,")[1];

        DatasetFactory.getDataset("CriacaoDocumentosFluig", null, [
            DatasetFactory.createConstraint("conteudo", bytes, bytes, ConstraintType.MUST),
            DatasetFactory.createConstraint("nome", fileName, fileName, ConstraintType.SHOULD),
            DatasetFactory.createConstraint("descricao", fileName, fileName, ConstraintType.SHOULD),
            DatasetFactory.createConstraint("pasta", idPasta, idPasta, ConstraintType.SHOULD)
        ], null, {
            success: function (data) {
                if (!data || data == "" || data == null) {
                    throw "Houve um erro na comunicação com o webservice de criação de documentos. Tente novamente!";
                } else {
                    if (data.values[0][0] == "false") {
                        throw "Erro ao criar arquivo. Favor entrar em contato com o administrador do sistema. Mensagem: " + data.values[0][1];
                    } else {
                        console.log("### GEROU docID = " + data.values[0].Resultado);
                        $("#idDoc" + idInput.split("inputFile")[1]).val(data.values[0].Resultado);

                        if (idInput == "inputFileMedicao") {
                            BuscaUrlDoc(data.values[0].Resultado).then(function (url) {
                                $("#pdfBoletimMedicao").attr("src", url + "#view=FitV");
                                myLoading1.hide();
                            });
                        }

                        $("#" + idInput).siblings("div").html(fileName);
                    }
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(jqXHR, textStatus, errorThrown);
            }
        });
    };
}

function savePdfToFluig(content, idPasta, nome = null) {
    var fileName = nome.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    
    DatasetFactory.getDataset("CriacaoDocumentosFluig", null, [
        DatasetFactory.createConstraint("conteudo", content, content, ConstraintType.MUST),
        DatasetFactory.createConstraint("nome", fileName, fileName, ConstraintType.SHOULD),
        DatasetFactory.createConstraint("descricao", fileName, fileName, ConstraintType.SHOULD),
        DatasetFactory.createConstraint("pasta", idPasta, idPasta, ConstraintType.SHOULD)
    ], null, {
        success: function (data) {
                if (!data || data == "" || data == null) {
                    throw "Houve um erro na comunicação com o webservice de criação de documentos. Tente novamente!";
        } else {
            if (data.values[0][0] == "false") {
                throw "Erro ao criar arquivo. Favor entrar em contato com o administrador do sistema. Mensagem: " + data.values[0][1];
            } else {
                console.log("### GEROU docID = " + data.values[0].Resultado);
                $("#idDocMedicaoGerada").val(data.values[0].Resultado);

                SalvarNumeroUltimoPDF(data.values[0].Resultado);
                /* if (idInput == "inputFileMedicao") {
                    BuscaUrlDoc(data.values[0].Resultado).then(function (url) {
                        $("#pdfBoletimMedicao").attr("src", url + "#view=FitV");
                        myLoading1.hide();
                    });
                } */
            }
        }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(jqXHR, textStatus, errorThrown);
        }
    });
}

function SalvarNumeroUltimoPDF(docID){
    var medicaoID = $("#medicaoID").val();
    var c1 = DatasetFactory.createConstraint("OPERACAO", "SETULTIMOPDF", "SETULTIMOPDF", ConstraintType.MUST);
    var c2 = DatasetFactory.createConstraint("MEDICAOID", medicaoID, medicaoID, ConstraintType.MUST);
    var c3 = DatasetFactory.createConstraint("DOCID", docID, docID, ConstraintType.MUST);
    var retorno = DatasetFactory.getDataset("dsMedicoes", null, [c1,c2,c3], null);    
}

function BuscaUrlDoc(id) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: parent.WCMAPI.serverURL + "/api/public/2.0/documents/getDownloadURL/" + id,
            contentType: "application/json",
            method: "GET",
            error: function (x, e) {
                console.log(x);
                console.log(e);
                FLUIGC.toast({
                    message: "Erro ao buscar documento: " + e,
                    type: "warning"
                });
                reject("Erro ao buscar boletim de medição!");
            },
            success: function (data) {
                resolve(data.content);
            }
        });
    });
}

function BuscaMedicao(IDMOV = null) {
    var constraints = [];

    if (IDMOV != null) {
        constraints.push(DatasetFactory.createConstraint("Operacao", "BuscaMedicaoPorMovimento", "BuscaMedicaoPorMovimento", ConstraintType.MUST));
        constraints.push(DatasetFactory.createConstraint("IDMOV", IDMOV, IDMOV, ConstraintType.MUST));
    }
    else {
        constraints.push(DatasetFactory.createConstraint("Operacao", "BuscaMedicao", "BuscaMedicao", ConstraintType.MUST));
    }
    constraints.push(DatasetFactory.createConstraint("CODCOLIGADA", $("#coligada").val(), $("#coligada").val(), ConstraintType.MUST));
    constraints.push(DatasetFactory.createConstraint("CODIGOCONTRATO", $("#CodigoContrato").val(), $("#CodigoContrato").val(), ConstraintType.MUST));

    var ds = DatasetFactory.getDataset("DatasetMedicoes", null, constraints, null);

    if (ds && ds.values && ds.values.length > 0) {
        $("#movimento").val(ds.values[0].IDMOV);
        $("#valorMedicao").val(ds.values[0].VALORBRUTO);
        $("#dataCompetenciaMedicao").val(ds.values[0].DATACOMPETENCIA);
        $("#produtoMedicao").val(ds.values[0].CODIGOPRD);
        $("#localEstoqueMedicao").val(ds.values[0].LOCALESTOQUE);
        $("#ObjMedicao").val(JSON.stringify(ds.values));

        PreencheInfoMedicao(ds.values[0]);

        var ObjContrato = JSON.parse($("#ObjContrato").val());
        if (ObjContrato.RETENCAO == "true") {
            BuscaRetencao();
        }
        else {
            $("#spanValorRetencao").text("Sem retenção");
            $("#popoverRetencaoAcumulada").attr("data-content", "<b>Retenção:</b> Sem retenção");
        }
        return ds.values;
    }
    else {
        FLUIGC.toast({
            message: "Medição não encontrada!",
            type: "warning"
        });
    }
}

function BuscaTodasMedicoes() {
    DatasetFactory.getDataset("DatasetMedicoes", null, [
        DatasetFactory.createConstraint("Operacao", "BuscaTodasMedicoes", "BuscaTodasMedicoes", ConstraintType.MUST),
        DatasetFactory.createConstraint("CODCOLIGADA", $("#coligada").val(), $("#coligada").val(), ConstraintType.MUST),
        DatasetFactory.createConstraint("CODIGOCONTRATO", $("#CodigoContrato").val(), $("#CodigoContrato").val(), ConstraintType.MUST)
    ], null, {

        success: (ds => {
            var content = "";
            content += "<table class='table table-bordered'>";
            content += "<thead>";
            content += "<tr>";
            content += "<th>Movimento</th>";
            content += "<th>Sequencial</th>";
            content += "<th>Competência</th>";
            content += "<th>Valor</th>";
            content += "<th></th>";
            content += "</tr>";
            content += "</thead>";
            content += "<tbody>";

            for (var i = 0; i < ds.values.length; i++) {
                const medicao = ds.values[i];
                console.log(FormataValor(medicao.VALORBRUTO))
                content += "<tr>";

                content += "<td>" + medicao.IDMOV + "</td>";
                content += "<td>" + medicao.SEQMEDICAO + "</td>";
                content += "<td>" + medicao.DATACOMPETENCIA + "</td>";
                content += "<td>" + FormataValor(medicao.VALORBRUTO) + "</td>";
                content += `<td style="text-align:'center'">`;
                content += `<button class="btn btn-success" onClick="BuscaMedicao(` + medicao.IDMOV + `); myModal.remove();">Selecionar</button>`;
                content += `</td>`;
                content += "</tr>";
            }

            content += "</tbody>";
            content += "</table>";

            myModal = FLUIGC.modal({
                title: 'Selecione a Medição',
                content: content,
                size: 'full',
                id: 'fluig-modal',
                actions: [{
                    'label': 'Close',
                    'autoClose': true
                }]
            }, function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(data);
                }
            });
        })
    });
}

function BuscaRetencao() {
    var c1 = DatasetFactory.createConstraint("Operacao", "BuscaRetencao", "BuscaRetencao", ConstraintType.MUST);
    var c2 = DatasetFactory.createConstraint("CODCOLIGADA", $("#coligada").val(), $("#coligada").val(), ConstraintType.MUST);
    var c3 = DatasetFactory.createConstraint("CODIGOCONTRATO", $("#CodigoContrato").val(), $("#CodigoContrato").val(), ConstraintType.MUST);
    var ds = DatasetFactory.getDataset("DatasetMedicoes", null, [c1, c2, c3], null);

    var acumuladoRetencao = 0;
    for (var i = 0; i < ds.values.length; i++) {
        console.log(ds.values[i].DATACOMPETENCIA.split(" ")[0] + " - " + $("#dataCompetenciaMedicao").val())
        if (ds.values[i].DATACOMPETENCIA < $("#dataCompetenciaMedicao").val()) {
            acumuladoRetencao += parseFloat(ds.values[i].VALORBRUTO);
        }
        else if (ds.values[i].DATACOMPETENCIA.split(" ")[0] == $("#dataCompetenciaMedicao").val()) {
            if (isNaN(ds.values[i].VALORBRUTO) || ds.values[i].VALORBRUTO <= 0) {
                $("#spanValorRetencao").css("color", "red");
            }
            else {
                $("#spanValorRetencao").css("color", "black");
            }
            console.log(ds.values[i].VALORBRUTO);
            console.log(FormataValor(ds.values[i].VALORBRUTO));
            $("#spanValorRetencao").text(FormataValor(ds.values[i].VALORBRUTO));
            $("#valorRetencao").val(ds.values[i].VALORBRUTO);
            acumuladoRetencao += parseFloat(ds.values[i].VALORBRUTO);
        }
    }

    if ($("#spanValorRetencao").text() == "" || $("#spanValorRetencao").text() == null) {
        $("#spanValorRetencao").text("Retenção não encontrada");
        $("#spanValorRetencao").css("color", "red");
    }
    $("#popoverRetencaoAcumulada").attr("data-content", "<b>Retenção Acumulada: </b>" + FormataValor(acumuladoRetencao));
}

function PreencherUltimoPdfId(){
    var medicaoID = $("#medicaoID").val();
    var c1 = DatasetFactory.createConstraint("OPERACAO", "GETULTIMOPDF", "GETULTIMOPDF", ConstraintType.MUST);
    var c2 = DatasetFactory.createConstraint("MEDICAOID", medicaoID, medicaoID, ConstraintType.MUST);
    var results = DatasetFactory.getDataset("dsMedicoes", null, [c1,c2], null);    
    
    if (results.values && results.values.length > 0){
        $("#idDocMedicaoGerada").val(results.values[0].ULTIMOPDFID);   
    }
}


function PreencheInfoMedicao(values) {
    $("#spanMovimento").text(values.IDMOV);
    $("#spanNumeroMedicao").text(values.SEQMEDICAO);
    $("#spanCompetencia").text(values.DATACOMPETENCIA);
    $("#spanValorNF").text(FormataValor(values.VALORBRUTO));
    $("#spanLocalEstoque").text(values.LOCALESTOQUE);
    var ObjContrato = JSON.parse($("#ObjContrato").val());
    if (ObjContrato.RETENCAO == "true") {
        if ($("#valorRetencao").val() != "") {
            $("#spanValorRetencao").text(FormataValor($("#valorRetencao").val()));
        }
        else{
            BuscaRetencao();
        }
    }
    else {
        $("#spanValorRetencao").text("Sem retenção");
        $("#popoverRetencaoAcumulada").attr("data-content", "<b>Retenção:</b> Sem retenção");
    }

}

function FormataValor(valor) {
    valor = parseFloat(valor);
    return valor.toLocaleString("pt-br", { style: "currency", currency: "BRL" });
}

function arredondarPara0_5(num) {
  return Math.round(num * 2) / 2;
}

function arredondar(valor, casas) {
    return Number(valor).toFixed(casas);
}

function LinkParaDownload() {
    BuscaUrlDoc($("#idDocMedicao").val()).then(function (url) {
        $("#linkBoletimMedicao").find("a").attr("href", url);
    });
}

function validaCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g, "");
    if (cnpj == "") return false;

    if (cnpj.length != 14) return false;

    // Elimina CNPJs invalidos conhecidos
    if (cnpj == "00000000000000" || cnpj == "11111111111111" || cnpj == "22222222222222" || cnpj == "33333333333333" || cnpj == "44444444444444" || cnpj == "55555555555555" || cnpj == "66666666666666" || cnpj == "77777777777777" || cnpj == "88888888888888" || cnpj == "99999999999999") return false;

    // Valida DVs
    tamanho = cnpj.length - 2;
    numeros = cnpj.substring(0, tamanho);
    digitos = cnpj.substring(tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != digitos.charAt(0)) return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != digitos.charAt(1)) return false;

    return true;
}

function BuscaFornecedor() {
    var cnpj = $("#CNPJFornecedor").val();

    if (validaCNPJ(cnpj) == true) {
        var c1 = DatasetFactory.createConstraint("CGCCFO", cnpj, cnpj, ConstraintType.MUST);
        var fornecedor = DatasetFactory.getDataset("FCFO", null, [c1], null).values[0];
        if (fornecedor != undefined) {
            $("#codFornecedor").val(fornecedor.CODCFO);
            $("#nomeFornecedor").val(fornecedor.NOME);
            $("#cidadeFornecedor").val(fornecedor.CIDADE);
            $("#estadoFornecedor").val(fornecedor.CODETD);
            BuscaContratosDoFornecedor(cnpj);
            $("#divListaContratos").show();
            $("#hiddenCNPJFornecedor").val(cnpj);
        }
        else {
            $("#CNPJFornecedor").val("");
            $("#hiddenCNPJFornecedor").val("");
            FLUIGC.toast({
                message: "Fornecedor não cadastrado no RM!",
                type: "warning"
            });
        }
    }
    else {
        $("#CNPJFornecedor").val("");
        $("#hiddenCNPJFornecedor").val("");
        FLUIGC.toast({
            message: "CNPJ inválido!",
            type: "warning"
        });
    }
}

function FormataDataParaDD_MM_AAAA(data) {
    data = data.split(" ")[0].split("-");
    return data[2] + "/" + data[1] + "/" + data[0];
}

function VerificaSeMedicaoPodeSerAprovada() {
    var medicao = BuscaMedicao($("#movimento").val());
    console.log(medicao);
    if (medicao[0].SEQMEDICAO != 1 && medicao[0].STATUSCONTRATO == "PENDENTE OBRA") {
        return 'Contratos com o status "PENDENTE OBRA" só podem ter a primeira medição aprovada. Favor regularizar a situação do contrato.';
    }
    else if (medicao[0].STATUSCONTRATO == "SEM CONTRATO") {
        return 'Contratos com o status "SEM CONTRATO" não podem ter medições aprovadas. Favor regularizar a situação do contrato.';
    }
    else {
        return true;
    }
}

function ValidaAntesDeEnviarAtividade() {
    var formMode = $("#formMode").val();
    var atividade = $("#atividade").val();

    if (formMode == "ADD") {
        if ($("#idDocMedicao").val() == null || $("#idDocMedicao").val() == "") {
            $([document.documentElement, document.body]).animate({
                scrollTop: $("#idDocMedicao").offset().top - (screen.height * 0.15)
            },700);
            throw "Boletim de Medição não anexado!";
        }
        if ($("#idDocMemoCalculo").val() == null || $("#idDocMemoCalculo").val() == "") {
            $([document.documentElement, document.body]).animate({
                scrollTop: $("#idDocMedicao").offset().top - (screen.height * 0.15)
            },700);
            throw "Memória de Cálculo não anexada!";
        }
        if ($("#medicaoTemDescontoExtra").val() == "true" && $("#textJustificativaDescontos").val() == "") {
            $([document.documentElement, document.body]).animate({
                scrollTop: $("#textJustificativaDescontos").offset().top - (screen.height * 0.15)
            },700);
            throw "Necessário informar a Justificativa dos Descontos!";
        }

    }
    else if (formMode == "MOD") {
        if (atividade == 4) {//Se atividade inicio
            if ($("#idDocMedicao").val() == null || $("#idDocMedicao").val() == "") {
                $([document.documentElement, document.body]).animate({
                    scrollTop: $("#idDocMedicao").offset().top - (screen.height * 0.15)
                },700);
                throw "Boletim de Medição não anexado!";
            }
        }
        else if (atividade == 5) {//Se atividade inclusão da medição
            if ($("#optAprovacaoRetornar").val() != "Retornar") {
                if ($("#movimento").val() == null || $("#movimento").val() == "") {
                    throw "Medição não encontrada.";
                }
            }
            if ($("#idDocMedicao").val() == null || $("#idDocMedicao").val() == "") {
                $([document.documentElement, document.body]).animate({
                    scrollTop: $("#idDocMedicao").offset().top - (screen.height * 0.15)
                },700);
                throw "Boletim de Medição não anexado!";
            }
        }
        else if (atividade == 17) {//Se atividade inclusão da documentação
            var medicao = JSON.parse($("#ObjMedicao").val())[0];
            if (medicao.STATUSCONTRATO == "PENDENTE OBRA" && medicao.SEQMEDICAO != 1) {
                return 'Contratos com o <b>STATUS</b> "<b>PENDENTE OBRA</b>" só podem ter a <b>PRIMEIRA MEDIÇÃO APROVADA</b>. Favor regularizar a situação do contrato.';
            }

            if ($("#produtoMedicao").val().substring(0,2) == "41" || $("#produtoMedicao").val().substring(0,2) == "40"){
                var valida = true;
                $(".campoContab, .campoRH").each(function(){
                    if ($(this).val() == null || $(this).val() == "") {
                        $(this).addClass("has-error");
                        if (valida) {
                            $([document.documentElement, document.body]).animate({
                                scrollTop: $(this).offset().top - (screen.height * 0.15)
                            },700);
                            valida = false;
                        }
                    }
                });
                if (valida == false) {
                    return "Campo não preenchido.";
                }
            }

            if ($("#checkboxAssinaturaPendente").is(":checked")) {
                if($("#idDocMedicao").val() == idDocBoletim){
                    return "Necessário anexar o Boletim de Medição assinado.";
                }
            }
            if ($("#idDocMedicao").val() == null || $("#idDocMedicao").val() == "") {
                $([document.documentElement, document.body]).animate({
                    scrollTop: $("#idDocMedicao").offset().top - (screen.height * 0.15)
                },700);
                throw "Boletim de Medição não anexado!";
            }
        }
        else if (atividade == 26) {//Se atividade Análise da documentação
        }
    }
    return true;
}

function BuscaColigada(CODCOLIGADA = null) {
    var constraints = [];

    if (CODCOLIGADA != null) {
        constraints.push(DatasetFactory.createConstraint("CODCOLIGADA", CODCOLIGADA, CODCOLIGADA, ConstraintType.MUST));
    }
    var ds = DatasetFactory.getDataset("Coligadas", null, constraints, null);
    return ds.values[0];
}

function BuscaDataAtual() {
    var data = new Date();

    var dia = data.getDate();
    if (dia < 10) {
        dia = "0" + dia;
    }

    var mes = data.getMonth() + 1;
    if (mes < 10) {
        mes = "0" + mes;
    }
    return dia + "/" + mes + "/" + data.getFullYear();
}

function BuscaNomeUsuario(user) {
    var c1 = DatasetFactory.createConstraint("colleagueId", user, user, ConstraintType.MUST);
    var ds = DatasetFactory.getDataset("colleague", null, [c1], null);
    return ds.values[0]["colleagueName"];
}

function BuscaLogoColigada() {
    $.ajax({
        method: "GET",
        url:"http://fluig.castilho.com.br:1010/api/public/ecm/document/listDocument/401359", //Prod
        //url: "http://homologacao.castilho.com.br:2020/api/public/ecm/document/listDocument/22520", //Homolog
        error: function (x, e) {
            console.log(x);
            console.log(e);
            if (x.status == 500) {
                alert("Busca logo da coligada: Erro Interno do Servidor: entre em contato com o Administrador.");
            }
        },
        success: function (retorno) {
            for (var i = 0; i < retorno.content.length; i++) {
                if (retorno.content[i].description == "LogoColigada-" + $("#coligada").val()) {
                    $("#divImageColigada").find("img").attr("src", retorno.content[i].fileURL);
                    $("#divImageColigada").show();
                }
            }
        },
    });
}

function novaMedicao() {
    $("#divListaContratos, #divSelectFornecedorCNPJ, #divSelectFornecedor").hide();
    $("#divCollapse").hide();
    $("#divImageColigada").hide();
    clicarBotao("btnSolicitarNovaMedicao");
}

function editarMedicao(medicaoID) {
    $("#divListaContratos, #divSelectFornecedorCNPJ, #divSelectFornecedor").hide();
    $("#divCollapse").hide();
    $("#divImageColigada").hide();
    $("#medicaoEditarID").val(medicaoID);
    clicarBotao("btnSolicitarEdicaoMedicao");
}

function entregarAssinado(medicaoID) {
    $("#medicaoID").val(medicaoID);
    $("#divListaContratos, #divSelectFornecedorCNPJ, #divSelectFornecedor").hide();
    $("#divCollapse").show();
    clicarBotao("btnMostrarWorkFlow");
    VerificaSeInfomacoesTerceiro();
    exibirMedicaoGerada();

    var temDescontoExtra = verificaSeTemDescontosExtras();
    if (temDescontoExtra) {
        $("#medicaoTemDescontoExtra").val("true");
        $("#divJustificativaDescontoExtra").show();
    }else{
        $("#medicaoTemDescontoExtra").val("false");
        $("#divJustificativaDescontoExtra").hide();
    }
}

function exibirMedicaoGerada(){
    if (!($("#idDocMedicaoGerada").val() > 0)){
        PreencherUltimoPdfId();
    }
    BuscaUrlDoc($("#idDocMedicaoGerada").val()).then(url => {
        $("#pdfBoletimMedicaoGerada").attr("src", url + "#view=FitV");
    }).catch(err => {
        FLUIGC.toast({
            title: "Erro ao buscar boletim de medição gerada: ",
            message: err,
            type: "warning"
        });
    });
    
    $("#divBoletimMedicaoGerada").show();
}

function verificaSeTemDescontosExtras(){
    var medicaoID = $("#medicaoID").val();

    var ds = DatasetFactory.getDataset("dsMedicoes", null,[
        DatasetFactory.createConstraint("OPERACAO", "SELECTWHEREMEDICAOID", "SELECTWHEREMEDICAOID", ConstraintType.MUST),
        DatasetFactory.createConstraint("MEDICAOID", medicaoID, medicaoID, ConstraintType.MUST),
    ],null);

    if (ds.values[0]?.DESCONTOS_EXTRA != null && parseFloat(ds.values[0]?.DESCONTOS_EXTRA) > 0) {
        return true;
    }
    else{
        return false;
    }
}

async function removerMedicao(medicaoID){
    let dsMedicao = await ExecutaDataset(
        "dsMedicoes",
        null,[
        DatasetFactory.createConstraint("OPERACAO", "REMOVERMEDICAOPORID", "REMOVERMEDICAOPORID", ConstraintType.SHOULD),
        DatasetFactory.createConstraint("MEDICAOID", medicaoID, medicaoID, ConstraintType.MUST),
        ], null
    );
    
    if(dsMedicao){
        FLUIGC.toast({
            message: "Medição removida com sucesso!",
            type: "success"
        });
    } else {
        FLUIGC.toast({
            message: "Erro ao remover medição!",
            type: "warning"
        });
    }
}

function VerificaSeInsereDocumentacao() {
    if ($("#produtoMedicao").val().substring(0, 2) != "40" && $("#produtoMedicao").val().substring(0, 2) != "41") {
        $("#atabChecklist").closest("li").hide();
    }
}

function VerificaPermissaoVisualizacao(){
    var user = $("#userCode").val();
    var obra = $("#obra").val();

    var c1 = DatasetFactory.createConstraint("colleagueId", user, user, ConstraintType.MUST);
    var c2 = DatasetFactory.createConstraint("groupId", "Controladoria", "Controladoria", ConstraintType.SHOULD);
    var c3 = DatasetFactory.createConstraint("groupId", "Administrador TI", "Administrador TI", ConstraintType.SHOULD);
    var c4 = DatasetFactory.createConstraint("groupId", obra, obra, ConstraintType.SHOULD);

    var callback = {
        success: function (ds) {
            console.log(ds);
            if (ds.values.length > 0) {
                BuscaLogoColigada();
                VerificaSeInfomacoesTerceiro();
                $(".checkboxDocumentacao").on("click", ()=>{return false;});
                $("#divObraSelect, #divListaContratos, #divInputFileMedicao, #divCodigoContrato, #divSelectFornecedor, #divAvisoStatusContrato, #divDecisao").hide();

                var atividade = $("#atividade").val();
                if (atividade == 4){
                    $("#btnAtualizarMedicao").hide();
                    if ($("#isMobile").val() == "true") {
                        LinkParaDownload();
                        $("#linkBoletimMedicao").show();
                        $("#divBoletimMedicao").hide();
                    }
                    else{
                        BuscaUrlDoc($("#idDocMedicao").val()).then(function(url){
                            $("#pdfBoletimMedicao").attr("src", url + "#view=FitV");
                        });
                        $("#linkBoletimMedicao").hide();
                        $("#divBoletimMedicao").show();
                    }
                    PreencheInfoContrato(JSON.parse($("#ObjContrato").val()));
                }
                if (atividade == 5) {
                    $("#btnAtualizarMedicao").hide();
                    if ($("#isMobile").val() == "true") {
                        LinkParaDownload();
                        $("#linkBoletimMedicao").show();
                        $("#divBoletimMedicao").hide();
                    }
                    else{
                        BuscaUrlDoc($("#idDocMedicao").val()).then(function(url){
                            $("#pdfBoletimMedicao").attr("src", url + "#view=FitV");
                        });
                        $("#linkBoletimMedicao").hide();
                        $("#divBoletimMedicao").show();
                    }
                    PreencheInfoContrato(JSON.parse($("#ObjContrato").val()));
                }
                else{
                    $("#btnAtualizarMedicao").hide();
                    if ($("#isMobile").val() == "true") {
                        LinkParaDownload();
                        $("#linkBoletimMedicao").show();
                        $("#divBoletimMedicao").hide();
                    }
                    else{
                        BuscaUrlDoc($("#idDocMedicao").val()).then(function(url){
                            $("#pdfBoletimMedicao").attr("src", url + "#view=FitV");
                        });
                        $("#linkBoletimMedicao").hide();
                        $("#divBoletimMedicao").show();
                    }
                    PreencheInfoContrato(JSON.parse($("#ObjContrato").val()));
                    PreencheInfoMedicao(JSON.parse($("#ObjMedicao").val())[0]);
                    VerificaSeInsereDocumentacao();
                }
            }
            else{
                $("#divObraSelect, #divListaContratos, #divInputFileMedicao, #divCodigoContrato, #divSelectFornecedor, #divAvisoStatusContrato").hide();
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(jqXHR, textStatus, errorThrown);
        }
    }

    DatasetFactory.getDataset("colleagueGroup", null, [c1,c2,c3,c4], null, callback);
}

function VerificaSeInfomacoesTerceiro(){
    if ($("#produtoMedicao").val().substring(0,2) == "41" || $("#produtoMedicao").val().substring(0,2) == "40"){
        if ($("#atividade").val() == 4 || $("#atividade").val() == 0 || $("#atividade").val() == 17) {
            $("#divInfoTerceiro").show();
        }
        else{
            $(".campoRH, .campoContab").hide();
            $(".campoRH, .campoContab").each(function(){
                if ($("#formMode").val() != "VIEW") {
                    $(this).siblings("span").text($(this).val());
                }
                else{
                    $(this).siblings("span").text($(this).text());
                }
            });
        }
    }else{
        $("#divInfoTerceiro").hide();
    }
}

function BuscaInfoDoc(id){
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: parent.WCMAPI.serverURL + "/api/public/ecm/document/activedocument/" + id,
            contentType: "application/json",
            method: "GET",
            error: function (x, e) {
                console.log(x);
                console.log(e);
                FLUIGC.toast({
                    message: "Erro ao buscar documento: " + e,
                    type: "warning"
                });
                reject("Erro ao buscar boletim de medição!");
            },
            success: function (data) {
                resolve(data.content);
            }
        });
    });
}

async function BuscaPermissoesUsuario() {
    var user = $("#userCode").val();
    var constraints = [];

    if (await VerificaSeUsuarioTemPermissaoGeral(user)) {
        constraints.push(DatasetFactory.createConstraint("permissaoGeral", "true", "true", ConstraintType.MUST));
    }
    else {
        constraints.push(DatasetFactory.createConstraint("usuario", user, user, ConstraintType.MUST));
    }

    var ds = await ExecutaDataset("BuscaPermissaoColigadasUsuario", null, constraints, null, true);
    if (ds.length > 0) {
        var retorno = [];

        var coligadaGroup = null;
        for (var i = 0; i < ds.length; i++) {
            var CCUSTO = ds[i];
            if (coligadaGroup != CCUSTO.NOMEFANTASIA) {
                coligadaGroup = CCUSTO.NOMEFANTASIA;

                retorno.push({
                    label: CCUSTO.CODCOLIGADA + " - " + CCUSTO.NOMEFANTASIA,
                    options: []
                });
            }


            retorno[retorno.length - 1].options.push({
                label: CCUSTO.CODCCUSTO + " - " + CCUSTO.perfil,
                value: CCUSTO.CODCOLIGADA + " - " + CCUSTO.CODCCUSTO + " - " + CCUSTO.perfil
            });
        }

        return retorno;
    }
    else {
        return [{ value: "", label: "" }];
    }
}

function ObterNumeroAtividade() {
    var atividade = $("#atividade").val();
    console.log(atividade);
    return atividade;
}

function VerificaSeUsuarioTemPermissaoGeral(user) {
    return new Promise((resolve) => {
        if (user == "rodrigo.ramos") {
            resolve(true);
        }
        else {
            ExecutaDataset("colleagueGroup", null, [
                DatasetFactory.createConstraint("colleagueId", user, user, ConstraintType.MUST),
                DatasetFactory.createConstraint("groupId", "Controladoria", "Controladoria", ConstraintType.SHOULD),
                DatasetFactory.createConstraint("groupId", "Administrador TI", "Administrador TI", ConstraintType.SHOULD)
            ], null, true).then(ds => {
                if (ds.length > 0) {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
            }).catch(() => {
                resolve(false);
            })
        }
    });
}

async function obterMedicaoPeloID (medicaoID) {
    let dsMedicao = await ExecutaDataset(
        "dsMedicoes",
        null,[
        DatasetFactory.createConstraint("OPERACAO", "SELECTWHEREMEDICAOID", "SELECTWHEREMEDICAOID", ConstraintType.SHOULD),
        DatasetFactory.createConstraint("MEDICAOID", medicaoID, medicaoID, ConstraintType.MUST),
        ], null
    );
    return formatarObjetoMedicao(dsMedicao);

}

function ObterSourcesLogo(){
   $.ajax({
        method: "GET",
        url:"http://fluig.castilho.com.br:1010/api/public/ecm/document/listDocument/401359", //Prod
        //url: "http://homologacao.castilho.com.br:2020/api/public/ecm/document/listDocument/22520", //Homolog
        error: function (x, e) {
            console.log(x);
            console.log(e);
            if (x.status == 500) {
                alert("Busca logo da coligada: Erro Interno do Servidor: entre em contato com o Administrador.");
            }
        },
        success: function (retorno) {
            sourcesImagesLogo = retorno.content;
        },
    }); 
}

function BuscaSrcLogoColigada(CodigoColigada = "") {
    let imagem = sourcesImagesLogo.filter(a => a.description == "LogoColigada-" + CodigoColigada);
    if (imagem.length > 0) {
        return imagem[0].fileURL;
    } 
    else 
    {
        return '';
    }
    
}

ObterSourcesLogo();

function PrototipaNumeroPorExtenso() {
    String.prototype.extenso = function (c) {
        var ex = [
            ["Zero", "Um", "Dois", "Três", "Quatro", "Cinco", "Seis", "Sete", "Oito", "Nove", "Dez", "Onze", "Doze", "Treze", "Quatorze", "Quinze", "Dezesseis", "Dezessete", "Dezoito", "Dezenove"],
            ["Dez", "Vinte", "Trinta", "Quarenta", "Cinquenta", "Sessenta", "Setenta", "Oitenta", "Noventa"],
            ["Cem", "Cento", "Duzentos", "Trezentos", "Quatrocentos", "Quinhentos", "Seiscentos", "Setecentos", "Oitocentos", "Novecentos"],
            ["Mil", "Milhão", "Bilhão", "Trilhão", "Quadrilhão", "Quintilhão", "Sextilhão", "Setilhão", "Octilhão", "Nonilhão", "Decilhão", "Undecilhão", "Dodecilhão", "Tredecilhão", "Quatrodecilhão", "Quindecilhão", "Sedecilhão", "Septendecilhão", "Octencilhão", "Nonencilhão"]
        ];
        var a, n, v, i, n = this.replace(c ? /[^,\d]/g : /\D/g, "").split(","), e = " e ", $ = "Real", d = "Centavo", sl;
        for (var f = n.length - 1, l, j = -1, r = [], s = [], t = ""; ++j <= f; s = []) {
            j && (n[j] = (("." + n[j]) * 1).toFixed(2).slice(2));
            if (!(a = (v = n[j]).slice((l = v.length) % 3).match(/\d{3}/g), v = l % 3 ? [v.slice(0, l % 3)] : [], v = a ? v.concat(a) : v).length) continue;
            for (a = -1, l = v.length; ++a < l; t = "") {
                if (!(i = v[a] * 1)) continue;
                i % 100 < 20 && (t += ex[0][i % 100]) ||
                    i % 100 + 1 && (t += ex[1][(i % 100 / 10 >> 0) - 1] + (i % 10 ? e + ex[0][i % 10] : ""));
                s.push((i < 100 ? t : !(i % 100) ? ex[2][i == 100 ? 0 : i / 100 >> 0] : (ex[2][i / 100 >> 0] + e + t)) +
                    ((t = l - a - 2) > -1 ? " " + (i > 1 && t > 0 ? ex[3][t].replace("ão", "ões") : ex[3][t]) : ""));
            }
            a = ((sl = s.length) > 1 ? (a = s.pop(), s.join(" ") + e + a) : s.join("") || ((!j && (n[j + 1] * 1 > 0) || r.length) ? "" : ex[0][0]));
            a && r.push(a + (c ? (" " + (v.join("") * 1 > 1 ? j ? d + "s" : (/0{6,}$/.test(n[0]) ? "de " : "") + $.replace("l", "is") : j ? d : $)) : ""));
        }
        return r.join(e);
    }
}

function numeroPorExtenso(numero) {
    var ex = [
        ["", "Um", "Dois", "Três", "Quatro", "Cinco", "Seis", "Sete", "Oito", "Nove", "Dez", "Onze", "Doze", "Treze", "Quatorze", "Quinze", "Dezesseis", "Dezessete", "Dezoito", "Dezenove"],
        ["", "Dez", "Vinte", "Trinta", "Quarenta", "Cinquenta", "Sessenta", "Setenta", "Oitenta", "Noventa"],
        ["", "Cem", "Duzentos", "Trezentos", "Quatrocentos", "Quinhentos", "Seiscentos", "Setecentos", "Oitocentos", "Novecentos"],
        ["Mil", "Milhão", "Bilhões", "Trilhões", "Quadrilhões", "Quintilhões", "Sextilhões", "Setilhões", "Octilhões", "Nonilhões", "Decilhões", "Undecilhões", "Dodecilhões", "Tredecilhões", "Quatrodecilhões", "Quindecilhões", "Sedecilhões", "Septendecilhões", "Octencilhões", "Nonencilhões"]
    ];

    numero = numero.toFixed(2).toString().replace('.', ',');
    var partes = numero.split(',');
    var inteiro = partes[0];
    var centavos = partes[1];

    var numeroExtenso = [];

    function getCentena(valor) {
        var texto = '';
        if (valor.length === 3) {
            if (valor[0] === '1' && valor.slice(1) === '00') {
                texto = ex[2][1];
            } else {
                texto = (valor[0] === '1' ? "Cento" : ex[2][parseInt(valor[0])]) + (parseInt(valor.slice(1)) > 0 && parseInt(valor[0]) > 0 ? " e " : "") + getDezena(valor.slice(1));
            }
        } else {
            texto = getDezena(valor);
        }
        return texto;
    }

    function getDezena(valor) {
        var texto = '';
        if (parseInt(valor) < 20) {
            texto = ex[0][parseInt(valor)];
        } else {
            texto = ex[1][parseInt(valor[0])] + (parseInt(valor[1]) > 0 ? " e " + ex[0][parseInt(valor[1])] : "");
        }
        return texto;
    }

    function getMilhar(valor) {
        var tamanho = valor.length;
        if (tamanho > 3) {
            var milhar = valor.slice(0, -3);
            var resto = valor.slice(-3);
            var milharTexto = getGrandeNumero(milhar, 1);
            var restoTexto = getCentena(resto);
            return milharTexto + (parseInt(resto) > 0 ? " e " + restoTexto : "");
        } else {
            return getCentena(valor);
        }
    }

    function getGrandeNumero(valor, escala) {
        if (valor.length <= 3) {
            return getMilhar(valor);
        }
        var parteAlta = valor.slice(0, -3);
        var parteBaixa = valor.slice(-3);
        var textoParteAlta = getGrandeNumero(parteAlta, escala + 1);
        var textoParteBaixa = getMilhar(parteBaixa);
        return textoParteAlta + " " + ex[3][escala] + (parseInt(parteBaixa) > 0 ? " e " + textoParteBaixa : "");
    }

    if (parseInt(inteiro) > 0) {
        numeroExtenso.push(getGrandeNumero(inteiro, 0)  + (parseInt(inteiro) > 1 ? " Reais" : " Real"));
    }

    if (parseInt(centavos) > 0) {
        numeroExtenso.push("e " + getDezena(centavos) + " Centavos");
    }

    var valorExtenso = numeroExtenso.join(' ');
    return valorExtenso;
}

function ExecutaDataset(DatasetName, Fields, Constraints, Order, AceitaRetornarVazio = false) {
    return new Promise((resolve, reject) => {
        DatasetFactory.getDataset(DatasetName, Fields, Constraints, Order, {
            success: (ds => {
                try {
                    if ((DatasetName == 'dsMedicoes' || DatasetName == 'CadastroDeEquipamentos')){
                        resolve(ds.values);
                    }
                    else if (!ds || !ds.values || (ds.values.length == 0 && !AceitaRetornarVazio) || (ds.values[0][0] == "deu erro! " && ds.values[0][1] != "com.microsoft.sqlserver.jdbc.SQLServerException: A instrução não retornou um conjunto de resultados.")) {
                        console.error("Erro ao executar o Dataset: " + DatasetName);
                        console.error(ds);
                        FLUIGC.toast({
                            title: "Erro ao executar o Dataset: " + DatasetName,
                            message: "",
                            type: "warning"
                        });
                        reject();
                    }
                    else {
                        resolve(ds.values);
                    }
                } catch (error) {
                    console.error(error);

                    reject();
                }

            }),
            error: (e => {
                console.error("Erro ao executar o Dataset: " + DatasetName);
                console.error(e);
                FLUIGC.toast({
                    title: "Erro ao executar o Dataset: " + DatasetName,
                    message: "",
                    type: "warning"
                });
                reject();
            })
        })
    });
}

function formatarObjetoMedicao(registros){
	var medicao = {
			MEDICAOID: registros[0].MEDICAOID,
			IDCNT: registros[0].IDCNT,
			OBRA: registros[0].OBRA,
			FORNECEDOR: registros[0].FORNECEDOR,
			CNPJ: registros[0].CNPJ,
            CODIGOCONTRATO: registros[0].CODIGOCONTRATO,
            CATEGORIAPRODUTO: registros[0].CATEGORIAPRODUTO == "   -   " ? null : registros[0].CATEGORIAPRODUTO,
            CATEGORIAPRODUTOID: registros[0].CATEGORIAPRODUTOID == "   -   " ? null : registros[0].CATEGORIAPRODUTOID, 
			PERIODOINICIAL: registros[0].PERIODOINICIAL == "   -   " ? null : FormataData(registros[0].PERIODOINICIAL),
			PERIODOFINAL: registros[0].PERIODOFINAL == "   -   " ? null : FormataData(registros[0].PERIODOFINAL),
			NUMEROMEDICAO: registros[0].NUMEROMEDICAO == "   -   " ? 0 : registros[0].NUMEROMEDICAO,
			DATACOMPETENCIA: FormataData(registros[0].DATACOMPETENCIA),
			ACUMULADOANTERIOR: registros[0].ACUMULADOANTERIOR,
			PRESENTEMEDICAO: registros[0].PRESENTEMEDICAO,
			ACUMULADOATUAL: registros[0].ACUMULADOATUAL,
			DESCONTOANTERIOR: registros[0].DESCONTOANTERIOR == "   -   " ? 0 : registros[0].DESCONTOANTERIOR,
            DESCONTOATUAL: registros[0].DESCONTOATUAL,
            SEGUNDAASSINATURA: registros[0].SEGUNDAASSINATURA,
            TERCEIRAASSINATURA: registros[0].TERCEIRAASSINATURA,
            POSSUIRETENCAO: registros[0].POSSUIRETENCAO != "true" ? false : true,
            RETENCAOANTERIOR: registros[0]?.RETENCAOANTERIOR > 0 ? registros[0]?.RETENCAOANTERIOR : 0,
            RETENCAOATUAL: registros[0]?.RETENCAOATUAL > 0 ? registros[0]?.RETENCAOATUAL : 0,
            POSSUIREIDI: registros[0]?.POSSUIREIDI != "true" ? false : true,
            TAXAREIDI: registros[0]?.TAXAREIDI > 0 ? registros[0]?.TAXAREIDI : 0,
            REIDIANTERIOR: registros[0]?.REIDIANTERIOR > 0 ? registros[0]?.REIDIANTERIOR : 0,
            REIDIATUAL: registros[0]?.REIDIATUAL > 0 ? registros[0]?.REIDIATUAL : 0,
            OPTANTEPELOSIMPLES: (registros[0]?.OPTANTEPELOSIMPLES == "true" ? true : false),
            DESCONTOS_EXTRA: (registros[0]?.DESCONTOS_EXTRA),
            ACUMULADOVALORDESCONTOEXTRA: (registros[0]?.ACUMULADO_DESCONTOS_EXTRA),
            Itens: []
	}
    
    medicao.Itens = formatarObjetoMedicaoItens(registros);

    return medicao;      
}

function formatarObjetoMedicaoItens(registros){
    var itens = [];
    var sequencia = 0;
	registros.filter(a => a.MEDICAOITEMID > 0).forEach((registro)=>{
        sequencia ++;
        itens.push({
            ID: registro.MEDICAOITEMID,
            EQUIPLOCID: registro.EQUIPLOCID,
            NSEQ: sequencia,
            DESCRICAO: registro.DESCRICAO,
            PREFIXO: registro.PREFIXO,
			MEDICAOITEMID: registro.MEDICAOITEMID,
            UNIDADE: registro.UNIDADE,
            UNIDADEPREENCHIDA: registro.UNIDADE != null && registro.UNIDADE != "" ? true : false,
			DIASTRABALHADOS: registro.DIASTRABALHADOS,
			VALORUNITARIO: registro.VALORUNITARIO,
			ACUMULADOFISICOANT: Number(registro.ACUMULADOFISICOANT),
            ACUMULADOFINANCEIROANT: Number(registro.ACUMULADOFINANCEIROANT),
            ACUMULADOFINANCEIROATUAL: Number(registro.ACUMULADOFINANCEIROATUAL),
            ACUMULADOFISICOATUAL: Number(registro.ACUMULADOFISICOATUAL),   
            ACUMULADOFINANCEIROPREENCHIDO: registro.ACUMULADOFINANCEIROANT > 0 ? true : false,
            ACUMULADOFISICOPREENCHIDO: registro.ACUMULADOFISICOANT > 0 ? true : false,
            PRESENTEFISICO: Number(registro.PRESENTEFISICO),
            PRESENTEFINANCEIRO: Number(registro.PRESENTEFINANCEIRO),
            HORASTRAB:"",
            PermiteExcluir:"",
            Ativo:"",
            HORAMINIMA:"",
            VALORFISICO: 0,
            VALORFINANCEIRO: 0
		})
    })    
    return itens;   
}

function convertStringMedicao(medicao){
    let medicaoTmp = {...medicao};
    let stringItens = [];
    if (medicao.itens > 10){
        for (let i = 0; i < medicao.itens.length; i += 10) {
            stringItens.push(JSON.stringify(medicao.itens.slice(i, i + 10)));
        }
        medicaoTmp.itens = null;
    }
    
    return {
        medicao: JSON.stringify(medicaoTmp),
        itens: JSON(stringItens)
    };
}

function toCurrency(numero, semCifrao = false) {
	numero = numero.toString();
    let partes = numero.toString().split('.');
    let parteInteira = partes[0];
    let parteDecimal = partes.length > 1 ? ',' + partes[1] : ',00';

    parteInteira = parteInteira.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return (semCifrao == true ? "" : "R$ ") + parteInteira + parteDecimal;
}

function FormataData(data) {
    return moment(data).format("DD/MM/YYYY")
}

function FormataDataISO(data){
    var dataMoment = moment(data, 'DD/MM/YYYY');
    return dataMoment.format('YYYY-MM-DD');
}

function verificaFevereiro(dateString) {
    var date = moment(dateString, "YYYY-MM-DD");
    return date.month() === 1;
}

function validarData(dateString, format = "YYYY-MM-DD") {
    return moment(dateString, format, true).isValid();
}

function obterDiferencaDias(dataInicial, dataFinal){
    const dataInicialAux = moment(dataInicial,'DD/MM/YYYY');
    const dataFinalAux = moment(dataFinal,'DD/MM/YYYY');
    return dataFinalAux.diff(dataInicialAux, 'days');
}

function validarPresenteMedicao(valor, unidade){
    if (unidade == 'mês'){
        return Number(valor / 30).toFixed(2);
    } else {
        return valor;
    }
}

function obterDataFinalLimite(dataInicial){
    const dataFinal = moment(dataInicial,'DD/MM/YYYY').add(30,"day");
    return FormataData(dataFinal);
}

function PrimeiroDiaDoMes() {
    var data = new Date();
    var primeiroDia = new Date(data.getFullYear(), data.getMonth(), 1);
    return FormataData(primeiroDia);
}

function geraId(length = 6) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

function getPeriodoIncioEFim() {
    //   Buscar o primeiro e ultimo dia dos mes
    var data = new Date();
    var primeiroDia = new Date(data.getFullYear(), data.getMonth() - 1, 1);
    var ultimoDia = new Date(data.getFullYear(), data.getMonth(), 0);

    return [FormataData(primeiroDia), FormataData(ultimoDia)];
}
function localePtBR() {
    moment.defineLocale('pt-br', {
        months: 'janeiro_fevereiro_março_abril_maio_junho_julho_agosto_setembro_outubro_novembro_dezembro'.split('_'),
        monthsShort: 'jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez'.split('_'),
        weekdays: 'domingo_segunda-feira_terça-feira_quarta-feira_quinta-feira_sexta-feira_sábado'.split('_'),
        weekdaysShort: 'dom_seg_ter_qua_qui_sex_sáb'.split('_'),
        weekdaysMin: 'dom_2ª_3ª_4ª_5ª_6ª_sáb'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D [de] MMMM [de] YYYY',
            LLL: 'D [de] MMMM [de] YYYY [às] LT',
            LLLL: 'dddd, D [de] MMMM [de] YYYY [às] LT'
        },
        calendar: {
            sameDay: '[Hoje às] LT',
            nextDay: '[Amanhã às] LT',
            nextWeek: 'dddd [às] LT',
            lastDay: '[Ontem às] LT',
            lastWeek: function () {
                return (this.day() === 0 || this.day() === 6) ?
                    '[Último] dddd [às] LT' : // Saturday + Sunday
                    '[Última] dddd [às] LT'; // Monday - Friday
            },
            sameElse: 'L'
        },
        relativeTime: {
            future: 'em %s',
            past: '%s atrás',
            s: 'segundos',
            m: 'um minuto',
            mm: '%d minutos',
            h: 'uma hora',
            hh: '%d horas',
            d: 'um dia',
            dd: '%d dias',
            M: 'um mês',
            MM: '%d meses',
            y: 'um ano',
            yy: '%d anos'
        },
        ordinal: '%dº'
    });
}


