table = null;
myLoading1 = null;
idDocBoletim = null;
$(document).ready(function () {
    console.clear();
    var formMode = $("#formMode").val();
    var atividade = $("#atividade").val();

    if (formMode == "ADD") {
        $("#divListaContratos, #divDecisao, #divInfoMedicao, #divBoletimMedicao, #linkBoletimMedicao, #divCollapse, #divCodigoContrato, #divSelectFornecedor, #divAvisoStatusContrato, #divImageColigada, #divInfoTerceiro, #btnAtualizarMedicao, #divAlertBoletimMedicao, #btnBuscarMedicoes").hide();
        BuscaObras();
        $("#atabChecklist").closest("li").hide();

        setTimeout(() => {
            table = $("#tableContratos").DataTable({
                "pageLength": 25,
                "columns": [
                    {
                        "className": 'details-control',
                        "orderable": false,
                        "data": null,
                        "defaultContent": '',
                        "targets": 1
                    },
                    {
                        "data": "CODIGOCONTRATO",
                        "className": 'dt-body-nowrap'
                    },
                    { "data": "FORNECEDOR" },
                    {
                        "data": "CGCCFO",
                        "className": 'dt-body-nowrap'
                    },
                    { "data": "TIPOCONTRATO" },
                    { "data": "CONTRATO" },
                    { "data": "STATUS" },
                    {
                        "data": "DATACOMPETENCIA",
                        "render": function (data, type, row) {
                            if (row.CODCCUSTO == $("#ccusto").val()) {
                                var dataAtual = new Date();
                                dataAtual = dataAtual.getFullYear() + "-" + ((dataAtual.getMonth() + 1).length == 1 ? (dataAtual.getMonth() + 1) : "0" + (dataAtual.getMonth() + 1));
                                var dataCompetencia = data.split(" ")[0].split("-");
                                dataCompetencia = dataCompetencia[0] + "-" + dataCompetencia[1];
                                console.log(dataAtual + " : " + dataCompetencia);
                                if (dataAtual == dataCompetencia) {
                                    return "<button class='btn btn-success btnSolicitarContrato' data-toggle='tooltip' data-placement='top' title='Última medição: " + dataCompetencia + "'>Solicitar</button>";
                                } else {
                                    return "<button class='btn btn-primary btnSolicitarContrato' data-toggle='tooltip' data-placement='top' title='Última medição: " + dataCompetencia + "'>Solicitar</button>";
                                }
                            }
                            else {
                                return "";
                            }
                        },
                        "className": 'dt-body-center'
                    },
                ],
                "language": {
                    url: "https://cdn.datatables.net/plug-ins/1.10.21/i18n/Portuguese-Brasil.json"
                }
            });
            table.on('draw', () => {
                $(".btnSolicitarContrato").off("click");
                $(".details-control").off("click");
                $(".btnSolicitarContrato").on("click", function () {
                    var tr = $(this).closest("tr");
                    var row = table.row(tr);
                    var values = row.data();
    
                    PreencheInfoContrato(values);
                    $("#divListaContratos, #divSelectFornecedorCNPJ, #divSelectFornecedor").hide();
                    $("#divCollapse").show();
                    $("#ObjContrato").val(JSON.stringify(values));
                    $("#CodigoContrato").val(values.CODIGOCONTRATO);
                    VerificaSeInfomacoesTerceiro();
                });
                $(".details-control").on("click", function () {
                    var tr = $(this).closest("tr");
                    var row = table.row(tr);
                    var values = row.data();
    
                    if (row.child.isShown()) {
                        row.child.hide();
                        tr.removeClass("shown");
                        $(tr).find("td:first").attr("rowspan", 1);
                        $(tr).find("td:last").attr("rowspan", 1);
                    } else {
                        row.child(showDetails(BuscaMedicoesAnterioresDoContrato(values.CODCOLIGADA, values.IDCNT))).show();
                        tr.addClass("shown");
    
                        $(tr).find("td:first").attr("rowspan", 2);
                        $(tr).next("tr").find("td:first").attr("colspan", 6);
                        $(tr).find("td:last").attr("rowspan", 2);
                    }
                });
            });
    
        }, 2000);

   
        $("#dataSolicitacao").val(BuscaDataAtual());
        $("#usuarioSolicitante").val($("#userCode").val());
    }
    else if (formMode == "MOD") {
        $("#divObraSelect, #divListaContratos, #divInputFileMedicao, #divCodigoContrato, #divSelectFornecedor, #divAvisoStatusContrato, #divAlertBoletimMedicao, #divInputFileMemoCalculo, #AprovarPendente").hide();
        $(".checkboxDocumentacao").on("click", () => { return false; });
        if (atividade == 4) {
            $("#divDecisao, #divInfoMedicao, #linkBoletimMedicao").hide();
            $("#divInputFileMedicao").show();
            $("#atabChecklist").closest("li").hide();

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

            var ObjContrato = $("#ObjContrato").val();
            if (ObjContrato != null && ObjContrato != "") {
                PreencheInfoContrato(JSON.parse(ObjContrato));
            }
            else {
                $("#divInfoContrato").hide();
            }
        }
        else if (atividade == 5) {//Atividade Inclusão da Medição
            $("#divObraSelect, #AprovarPendente").show();
            var optSelected = $("#obraSelect").val();
            BuscaObras();
            $("#obraSelect").val(optSelected);

            $("#atabChecklist").closest("li").hide();
            if ($("#isMobile").val() == "true") {
                LinkParaDownload();
                $("#linkBoletimMedicao").show();
                $("#divBoletimMedicao").hide();
            }
            else {
                BuscaUrlDoc($("#idDocMedicao").val()).then(url => {
                    $("#pdfBoletimMedicao").attr("src", url + "#view=FitV");
                }).catch(err => {
                    FLUIGC.toast({
                        title: "Erro ao buscar boletim de medição: ",
                        message: err,
                        type: "warning"
                    });
                });
                $("#linkBoletimMedicao").hide();
                $("#divBoletimMedicao").show();
            }
            if ($("#valueTpSolic").val() != 2) {
                PreencheInfoContrato(JSON.parse($("#ObjContrato").val()));
            }
            else {
                $("#divCodigoContrato").show();
            }

            BuscaInfoDoc($("#idDocMedicao").val()).then(doc => {
                $("#inputFileMedicao").siblings("div").text(doc.description);
                $("#divInputFileMedicao").show();
            });

            $("#optAprovacaoAprovar, #optAprovacaoRetornar").on("click", function(){
                $("#checkboxAssinaturaPendente").prop("checked", false);
            });
            $("#optAprovacaoAprovarPendente").on("click", function(){
                $("#checkboxAssinaturaPendente").prop("checked", true);
            });
            $("#checkboxAssinaturaPendente").on("click", function(){
                $("#optAprovacaoAprovarPendente, #optAprovacaoAprovar, #optAprovacaoRetornar").prop("checked", false);
            });
        }
        else if (atividade == 9) {//Atividade Inclusão da Documentação
            $(".checkboxDocumentacao").off("click");

            $("#btnAtualizarMedicao, #divDecisao, #btnBuscarMedicoes").hide();
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

            var aprova = VerificaSeMedicaoPodeSerAprovada();
            if (aprova == true) {
                $("#divAvisoStatusContrato").hide();
            }
            else {
                $("#divAvisoStatusContrato").show();
                $("#divAvisoStatusContrato").find("div").text(aprova);
            }

            if ($("#checkboxAssinaturaPendente").is(":checked")) {
                BuscaInfoDoc($("#idDocMedicao").val()).then(doc => {
                    $("#inputFileMedicao").siblings("div").text(doc.description);
                    $("#divInputFileMedicao").show();
                    $("#divAlertBoletimMedicao").show();
                });
                idDocBoletim = $("#idDocMedicao").val();
            }

            PreencheInfoContrato(JSON.parse($("#ObjContrato").val()));
            VerificaSeInsereDocumentacao();
            $("#checkboxAssinaturaPendente").on("click", () => { return false; });
        }
        else if (atividade == 10 || atividade == 16 || atividade == 17 || atividade == 18 || atividade == 54) {
            $("#labelAprovarPendente").hide();

            if (atividade == 10) {
                $("#btnAtualizarMedicao").show();
            }
            else {
                $("#btnAtualizarMedicao").hide();
            }

            if (atividade == 54) {    
                BuscaInfoDoc($("#idDocMedicao").val()).then(doc => {
                    $("#inputFileMedicao").siblings("div").text(doc.description);
                    $("#divInputFileMedicao").show();
                });
            }


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
        VerificaSeInfomacoesTerceiro();
        BuscaLogoColigada();
    }
    else if (formMode == "VIEW") {
        VerificaPermissaoVisualizacao();
    }

    $("#obraSelect").on("change", function () {
        $("#divObraSelect").hide();
        var value = $(this).val().split(" - ");
        $("#coligada").val(value[0]);
        $("#ccusto").val(value[1]);
        $("#obra").val(value[2]);
        $("#poolGrupoObra").val("Pool:Group:" + value[2]);

        if (atividade != 5) {
            $("#divSelectFornecedor").show();
        }

        BuscaLogoColigada();
    });
    $("#CodContrato").on("blur", function () {
        BuscaContratoPorCodigo($(this).val());
    });
    $("#inputFileMedicao").on("change", function () {
        $("#idDocMedicao").val("");
        if ($(this)[0].files.length == 0) {
            $(this).siblings("div").html("Nenhum arquivo selecionado");
        } else if ($(this)[0].files.length == 1) {
            $(this).siblings("div").html("Carregando...");
            //CriaDocFluig($(this).attr("id"), 25076);//Homolog
            CriaDocFluig($(this).attr("id"), 468711);//Prod
        } else {
            $(this).siblings("div").html("Carregando...");
            //CriaDocFluig($(this).attr("id"), 25076);//Homolog
            CriaDocFluig($(this).attr("id"), 468711);//Prod
        }
    });
    $("#inputFileMemoCalculo").on("change", function () {
        $("#idDocMemoCalculo").val("");
        if ($(this)[0].files.length == 0) {
            $(this).siblings("div").html("Nenhum arquivo selecionado");
        } else if ($(this)[0].files.length == 1) {
            $(this).siblings("div").html("Carregando...");
            //CriaDocFluig($(this).attr("id"), 28210);//Homolog
            CriaDocFluig($(this).attr("id"), 570606);//Prod
        } else {
            $(this).siblings("div").html("Carregando...");
            //CriaDocFluig($(this).attr("id"), 28210);//Homolog
            CriaDocFluig($(this).attr("id"), 570606);//Prod
        }
    });
    $("#btnBuscarContratosFornecedor").on("click", () => {
        BuscaFornecedor();
    });
    $("#btnMedicaoSemContrato").on("click", () => {
        $("#divSelectFornecedor, #divInfoContrato, #divInfoMedicao").hide();
        $("#divCollapse").show();
        $("#valueTpSolic").val("2");
        VerificaSeInfomacoesTerceiro();
    });
    $(".campoContab, .campoRH").on("focus", function () {
        $(this).removeClass("has-error");
    });

    $("#btnAtualizarMedicao").on("click", () => { BuscaContratoPorCodigo($("#CodigoContrato").val()); BuscaMedicao(); });

    $("#btnBuscarMedicoes").on("click", ()=>{BuscaContratoPorCodigo($("#CodigoContrato").val()); BuscaTodasMedicoes()});
    $("[name='optAprovacao']").attr("checked", false);
    FLUIGC.popover('.bs-docs-popover-hover', { trigger: 'hover', placement: 'bottom', html: 'true' });
});