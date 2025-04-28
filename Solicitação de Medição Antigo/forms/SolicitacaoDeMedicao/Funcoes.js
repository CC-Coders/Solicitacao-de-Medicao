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
    else {
        DatasetFactory.getDataset("colleagueGroup", null, [
            DatasetFactory.createConstraint("colleagueId", $("#userCode").val(), $("#userCode").val(), ConstraintType.MUST),
            DatasetFactory.createConstraint("groupId", "Obra", "Obra", ConstraintType.MUST, true),
        ], null, {
            success: (ds => {
                $("#obraSelect").html("<option></option>");
                ds.values.forEach(obra => {
                    DatasetFactory.getDataset("GCCUSTO", null, [
                        DatasetFactory.createConstraint("NOME", obra["colleagueGroupPK.groupId"], obra["colleagueGroupPK.groupId"], ConstraintType.MUST)
                    ], null, {
                        success: (ccusto => {
                            $("#obraSelect").append("<option value='" + ccusto.values[0].CODCOLIGADA + " - " + ccusto.values[0].CODCCUSTO + " - " + ccusto.values[0].NOME + "'>" + ccusto.values[0].CODCCUSTO + " - " + ccusto.values[0].NOME + "</option>");
                        }),
                        error: (error => {
                            FLUIGC.toast({
                                title: "Erro ao buscar obras: ",
                                message: error,
                                type: "warning"
                            });
                        })
                    })
                })
            }),
            error: (error => {
                FLUIGC.toast({
                    title: "Erro ao buscar obras: ",
                    message: error,
                    type: "warning"
                });
            })
        });
    }
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
    console.log(medicoes);
    return medicoes;
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
    $("#spanCNPJFornecedor").text(values.CGCCFO);
    $("#spanStatusContrato").text(values.STATUS);
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

function BuscaUrlDoc(id) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: "http://fluig.castilho.com.br:1010" + "/api/public/2.0/documents/getDownloadURL/" + id,//Prod
            //url: "http://homologacao.castilho.com.br:2020" + "/api/public/2.0/documents/getDownloadURL/" + id,//Homolog
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
    var found = false;
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
            found = true;
        }
    }

    if ($("#spanValorRetencao").text() == "" || $("#spanValorRetencao").text() == null || found == false) {
        $("#spanValorRetencao").text("Retenção não encontrada");
        $("#spanValorRetencao").css("color", "red");
    }
    $("#popoverRetencaoAcumulada").attr("data-content", "<b>Retenção Acumulada: </b>" + FormataValor(acumuladoRetencao));
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
            }, 700);
            throw "Boletim de Medição não anexado!";
        }
        if ($("#idDocMemoCalculo").val() == null || $("#idDocMemoCalculo").val() == "") {
            $([document.documentElement, document.body]).animate({
                scrollTop: $("#idDocMedicao").offset().top - (screen.height * 0.15)
            }, 700);
            throw "Memória de Cálculo não anexada!";
        }
    }
    else if (formMode == "MOD") {
        if (atividade == 4) {//Se atividade inicio
            if ($("#idDocMedicao").val() == null || $("#idDocMedicao").val() == "") {
                $([document.documentElement, document.body]).animate({
                    scrollTop: $("#idDocMedicao").offset().top - (screen.height * 0.15)
                }, 700);
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
                }, 700);
                throw "Boletim de Medição não anexado!";
            }
        }
        else if (atividade == 9) {//Se atividade inclusão da documentação
            var medicao = JSON.parse($("#ObjMedicao").val())[0];
            if (medicao.STATUSCONTRATO == "PENDENTE OBRA" && medicao.SEQMEDICAO != 1) {
                return 'Contratos com o <b>STATUS</b> "<b>PENDENTE OBRA</b>" só podem ter a <b>PRIMEIRA MEDIÇÃO APROVADA</b>. Favor regularizar a situação do contrato.';
            }

            if ($("#produtoMedicao").val().substring(0, 2) == "41" || $("#produtoMedicao").val().substring(0, 2) == "40") {
                var valida = true;
                $(".campoContab, .campoRH").each(function () {
                    if ($(this).val() == null || $(this).val() == "") {
                        $(this).addClass("has-error");
                        if (valida) {
                            $([document.documentElement, document.body]).animate({
                                scrollTop: $(this).offset().top - (screen.height * 0.15)
                            }, 700);
                            valida = false;
                        }
                    }
                });
                if (valida == false) {
                    return "Campo não preenchido.";
                }
            }

            if ($("#checkboxAssinaturaPendente").is(":checked")) {
                if ($("#idDocMedicao").val() == idDocBoletim) {
                    return "Necessário anexar o Boletim de Medição assinado.";
                }
            }
            if ($("#idDocMedicao").val() == null || $("#idDocMedicao").val() == "") {
                $([document.documentElement, document.body]).animate({
                    scrollTop: $("#idDocMedicao").offset().top - (screen.height * 0.15)
                }, 700);
                throw "Boletim de Medição não anexado!";
            }
        }
        else if (atividade == 10) {//Se atividade Análise da documentação
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
        url: "http://fluig.castilho.com.br:1010/api/public/ecm/document/listDocument/401359", //Prod
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

function VerificaSeInsereDocumentacao() {
    if ($("#produtoMedicao").val().substring(0, 2) != "40" && $("#produtoMedicao").val().substring(0, 2) != "41") {
        $("#atabChecklist").closest("li").hide();
    }
}

function VerificaPermissaoVisualizacao() {
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
                $(".checkboxDocumentacao").on("click", () => { return false; });
                $("#divObraSelect, #divListaContratos, #divInputFileMedicao, #divCodigoContrato, #divSelectFornecedor, #divAvisoStatusContrato, #divDecisao, #divInputFileMemoCalculo").hide();

                var atividade = $("#atividade").val();
                if (atividade == 4) {
                    $("#btnAtualizarMedicao").hide();
                    if ($("#isMobile").val() == "true") {
                        LinkParaDownload();
                        $("#linkBoletimMedicao").show();
                        $("#divBoletimMedicao").hide();
                    }
                    else {
                        BuscaUrlDoc($("#idDocMedicao").val()).then(function (url) {
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
                    else {
                        BuscaUrlDoc($("#idDocMedicao").val()).then(function (url) {
                            $("#pdfBoletimMedicao").attr("src", url + "#view=FitV");
                        });
                        $("#linkBoletimMedicao").hide();
                        $("#divBoletimMedicao").show();
                    }
                    PreencheInfoContrato(JSON.parse($("#ObjContrato").val()));
                }
                else {
                    $("#btnAtualizarMedicao").hide();
                    if ($("#isMobile").val() == "true") {
                        LinkParaDownload();
                        $("#linkBoletimMedicao").show();
                        $("#divBoletimMedicao").hide();
                    }
                    else {
                        BuscaUrlDoc($("#idDocMedicao").val()).then(function (url) {
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
            else {
                $("#divObraSelect, #divListaContratos, #divInputFileMedicao, #divCodigoContrato, #divSelectFornecedor, #divAvisoStatusContrato").hide();
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(jqXHR, textStatus, errorThrown);
        }
    }

    DatasetFactory.getDataset("colleagueGroup", null, [c1, c2, c3, c4], null, callback);
}

function VerificaSeInfomacoesTerceiro() {
    if ($("#produtoMedicao").val().substring(0, 2) == "41" || $("#produtoMedicao").val().substring(0, 2) == "40") {
        if ($("#atividade").val() == 4 || $("#atividade").val() == 0 || $("#atividade").val() == 9) {
            $("#divInfoTerceiro").show();
        }
        else {
            $(".campoRH, .campoContab").hide();
            $(".campoRH, .campoContab").each(function () {
                if ($("#formMode").val() != "VIEW") {
                    $(this).siblings("span").text($(this).val());
                }
                else {
                    $(this).siblings("span").text($(this).text());
                }
            });
        }
    } else {
        $("#divInfoTerceiro").hide();
    }
}

function BuscaInfoDoc(id) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: "http://fluig.castilho.com.br:1010" + "/api/public/ecm/document/activedocument/" + id,//Prod
            //url: "http://homologacao.castilho.com.br:2020" + "/api/public/ecm/document/activedocument/" + id,//Homolog
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