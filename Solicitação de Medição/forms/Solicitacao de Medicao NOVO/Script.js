table = null;
myLoading1 = null;
idDocBoletim = null;
let myModal;
$(document).ready(function () {
    console.clear();
    var formMode = $("#formMode").val();
    var atividade = $("#atividade").val();

    if (formMode == "ADD") {
        window.parent.$("#workflowActions").hide();

        $("#divListaContratos, #divDecisao, #divInfoMedicao, #divBoletimMedicao, #linkBoletimMedicao, #divCollapse, #divCodigoContrato, #divSelectFornecedor, #divAvisoStatusContrato, #divImageColigada, #divInfoTerceiro, #btnAtualizarMedicao, #divAlertBoletimMedicao, #btnBuscarMedicoes, #divBoletimMedicaoGerada").hide();
        BuscaObras();
        $("#atabChecklist").closest("li").hide();

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
                    "data": "DATACOMPETENCIA" ?? "",
                    "render": function (data, type, row) {
                        if (row.CODCCUSTO == $("#ccusto").val()) {
                            var dataAtual = new Date();
                            dataAtual = dataAtual.getFullYear() + "-" + ((dataAtual.getMonth() + 1).length == 1 ? (dataAtual.getMonth() + 1) : "0" + (dataAtual.getMonth() + 1));
                            var dataCompetencia = data.split(" ")[0].split("-");
                            dataCompetencia = dataCompetencia[0] + "-" + dataCompetencia[1];
                            
                            if (row.STATUS != "ENCERRADO"){
                                if (dataAtual == dataCompetencia) {
                                    return "<button class='btn btn-success btnSolicitarContrato' data-toggle='tooltip' data-placement='top' title='Última medição: " + dataCompetencia + "'>Solicitar</button>";
                                } else {
                                    return "<button class='btn btn-primary btnSolicitarContrato' data-toggle='tooltip' data-placement='top' title='Última medição: " + dataCompetencia + "'>Solicitar</button>";
                                }
                            } else {
                                return null;
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
                $("#ObjContrato").val(JSON.stringify(values));
                $("#CodigoContrato").val(values.CODIGOCONTRATO);
                VerificaSeInfomacoesTerceiro();
                
                let medicoesPendentes = BuscarMedicoesPendentesPorContrato(values.CODIGOCONTRATO);
                if (medicoesPendentes.length > 0) {
                    let processoID = medicoesPendentes[0].PROCESSOID;

                    myModal = FLUIGC.modal({
                        title: 'Medições Pendentes',
                        content: '<table class="table table-striped">' +
                                '<thead>' +
                                '<tr>' +
                                    '<th>Numero Medicao</th>' +
                                    '<th>Modificação</th>' +
                                    '<th>Período inicial</th>' +
                                    '<th>Periodo final</th>' +
                                    '<th colspan="2">Ação</th>' +
                                '</tr>' +
                                '</thead>' +
                                '<tbody>' +
                                medicoesPendentes.map(item => 
                                    '<tr>' +
                                        '<td>' + item.NUMEROMEDICAO + '</td>' +
                                        '<td>' + FormataData(item.DATACOMPETENCIA) + '</td>' +
                                        '<td>' + FormataData(item.PERIODOINICIAL) + '</td>' +
                                        '<td>' + FormataData(item.PERIODOFINAL) + '</td>' +
                                        '<td><button class="btn btn-primary" onclick="editarMedicao(' + item.MEDICAOID + ')" data-dismiss="modal"><i class="fluigicon fluigicon-fileedit icon-sm" aria-hidden="true"></i> Editar</button></td>' +
                                        '<td><button class="btn btn-primary" onclick="entregarAssinado(' + item.MEDICAOID + ')" data-dismiss="modal"><i class="fluigicon fluigicon-download icon-sm" aria-hidden="true"></i> Entregar Assinado</button></td>' +
                                        '<td><button class="btn btn-primary" onclick="removerMedicao(' + item.MEDICAOID + ')" data-dismiss="modal"><i class="text-danger fluigicon fluigicon-trash icon-sm" aria-hidden="true"></i> Remover</button></td>' +
                                    '</tr>'
                                ).join('') +
                                '</tbody>' +
                                '</table>' +
                                '<div class="row">' +
                                    '<div class="col-md-offset-8 col-lg-offset-8">' +
                                        //'<button class="btn btn-primary" onclick="novaMedicao()" data-dismiss="modal"><i class="fluigicon fluigicon-plus icon-sm" aria-hidden="true"></i> Nova Medição</button>' +
                                    '</div>' +
                                '</div>',
                        size: 'large',
                        id: 'fluig-modal',
                    }, function(err, data) {
                        if(err) {
                            // Tratamento de erro
                            console.error('Erro ao abrir o modal:', err);
                        } else {
                            // Ações com os dados recebidos
                            console.log('Modal aberto com sucesso:', data);
                        }
                    });
                    return;
                }

                $("#divListaContratos, #divSelectFornecedorCNPJ, #divSelectFornecedor").hide();
                $("#divCollapse").show();
                $("#divCollapse").hide();
                $("#divImageColigada").hide();

                clicarBotao("btnSolicitarNovaMedicao");
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

        $("#dataSolicitacao").val(BuscaDataAtual());
        $("#usuarioSolicitante").val($("#userCode").val());
    }
    else if (formMode == "MOD") {
        exibirMedicaoGerada();
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
                $("#divBoletimMedicaoGerada").show();
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
        else if (atividade == 17) {//Atividade Inclusão da Documentação
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
        else if (atividade == 26 || atividade == 30 || atividade == 37 || atividade == 40 || atividade == 22) {
            $("#labelAprovarPendente").hide();

            if (atividade == 26) {
                $("#btnAtualizarMedicao").show();
            }
            else {
                $("#btnAtualizarMedicao").hide();
            }

            if (atividade == 22) {    
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
        exibirMedicaoGerada();
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
    $("#inputFileMemoCalculo").on("change", function () {6 
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
    $("#btnMostrarWorkFlow").on("click", () => {
        window.parent.$("#workflowActions").show();
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