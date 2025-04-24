const useState = React.useState;
const useEffect = React.useEffect;

function InicioMedicao({ Contrato, onChangeContrato, CCUSTO, Fornecedor, medicaoEditarID }) {
    const [Medicao, setMedicao] = useState(null);
    const [DescontosSisma, setDescontosSisma] = useState(null);
    const [itensRemover, setItensRemover] = useState([]);


    async function handleNovaMedicao() {
        var dsEquipamentos = await ExecutaDataset(
            "CadastroDeEquipamentos",
            ["IDSOLICITACAO", "DESCRICAO", "FABRICANTE", "MODELO", "ANO", "PLACA", "PREFIXO", "VALORLOCACAO", "UNIDADE", "ACUMULADOFINANCEIROANT", "ACUMULADOFISICOANT"],
            [
                DatasetFactory.createConstraint("OPERACAO", "SELECTWHERECONTRATOEOBRA", "SELECTWHERECONTRATOEOBRA", ConstraintType.SHOULD),
                DatasetFactory.createConstraint("CODCCUSTO", CCUSTO.CODCCUSTO, CCUSTO.CODCCUSTO, ConstraintType.SHOULD),
                DatasetFactory.createConstraint("CODCONTRATO", Contrato.CODIGOCONTRATO, Contrato.CODIGOCONTRATO, ConstraintType.SHOULD),
            ],
            null
        );

        var dsContratoItens = await ExecutaDataset(
            "CadastroDeEquipamentos",
            ["CONTRATOITEMID", "CONTRATO", "PREFIXO", "TIPOITEM", "CHASSI", "PLACA", "DESCRICAO", "UNIDADE", "VALOR", "ACUMULADOATUAL", "ACUMULADOFISICO"],
            [
                DatasetFactory.createConstraint("OPERACAO", "SELECTITEMWHERECONTRATO", "SELECTITEMWHERECONTRATO", ConstraintType.SHOULD),
                DatasetFactory.createConstraint("CODCONTRATO", Contrato.CODIGOCONTRATO, Contrato.CODIGOCONTRATO, ConstraintType.SHOULD),
            ],
            null
        );

        var dsUltimaMedicao = await ExecutaDataset(
            "dsMedicoes",
            null,
            [
                DatasetFactory.createConstraint("OPERACAO", "ULTIMAMEDICAOWHERECODCONTRATOOBRA", "ULTIMAMEDICAOWHERECODCONTRATOOBRA", ConstraintType.SHOULD),
                DatasetFactory.createConstraint("CODIGOCONTRATO", Contrato.CODIGOCONTRATO, Contrato.CODIGOCONTRATO, ConstraintType.SHOULD),
                DatasetFactory.createConstraint("GCCUSTO", CCUSTO.CODCCUSTO, CCUSTO.CODCCUSTO, ConstraintType.SHOULD),
            ],
            null
        );

        var ultimaMedicao = null;
        var contratoDesconto = null;
        if (dsUltimaMedicao.length > 0) {
            ultimaMedicao = dsUltimaMedicao[0];
        } else {
            let dsContratoDesconto = await ExecutaDataset(
                "dsMedicoes",
                null,
                [
                    DatasetFactory.createConstraint("OPERACAO", "BUSCARDESCONTO", "BUSCARDESCONTO", ConstraintType.SHOULD),
                    DatasetFactory.createConstraint("CODIGOCONTRATO", Contrato.CODIGOCONTRATO, Contrato.CODIGOCONTRATO, ConstraintType.SHOULD),
                ],
                null
            );
            if (dsContratoDesconto.length > 0) {
                contratoDesconto = dsContratoDesconto[0];
            }
        }

        var ultimaMedicoesItens = await ExecutaDataset(
            "dsMedicoes",
            null,
            [
                DatasetFactory.createConstraint("OPERACAO", "ULTIMASMEDICOESITENSWHERECODCONTRATO", "ULTIMASMEDICOESITENSWHERECODCONTRATO", ConstraintType.SHOULD),
                DatasetFactory.createConstraint("CODIGOCONTRATO", Contrato.CODIGOCONTRATO, Contrato.CODIGOCONTRATO, ConstraintType.SHOULD),
            ],
            null
        );

        ultimaMedicoesItens = formatarObjetoMedicaoItens(ultimaMedicoesItens);

        var itens = [];
        var prefixos = [];

        let numeroSequencia = 1;

        dsEquipamentos.forEach((equipamento) => {
            const valorFinanceiroAnterior = Number(equipamento.ACUMULADOFINANCEIROANT ?? 0);
            const valorFisicoAnterior = Number(equipamento.ACUMULADOFISICOANT ?? 0);
            if (equipamento.EXTRA == "true") {
                var descricaoExibicao = `${equipamento.PREFIXO} - ${equipamento.DESCRICAO}`;
            } else {
                var descricaoExibicao = `${equipamento.DESCRICAO}, MARCA: ${equipamento.FABRICANTE}, Modelo: ${equipamento.MODELO}, ANO: ${equipamento.ANO}, PLACA: ${equipamento.PLACA}, PREFIXO: ${equipamento.PREFIXO}`;
            }
            itens.push({
                ID: equipamento.IDSOLICITACAO,
                EQUIPLOCID: equipamento.ID,
                PREFIXO: equipamento.PREFIXO,
                NSEQ: numeroSequencia,
                DESCRICAO: (descricaoExibicao ?? equipamento.DESCRICAO),
                DESCRICAOEXIBICAO: (descricaoExibicao ?? equipamento.DESCRICAO),
                CODUNIDADE: "",
                VALORUNITARIO: equipamento.VALORLOCACAO,
                QUANTIDADE: "",
                UNIDADE: equipamento.UNIDADE,
                UNIDADEPREENCHIDA: equipamento.UNIDADE != "" ? true : false,
                DIASTRABALHADOS: "0",
                ACUMULADOFINANCEIROANT: valorFinanceiroAnterior,
                ACUMULADOFISICOANT: valorFisicoAnterior,
                ACUMULADOFISICOPREENCHIDO: valorFisicoAnterior > 0 ? true : false,
                ACUMULADOFINANCEIROPREENCHIDO: valorFinanceiroAnterior > 0 ? true : false,
                ACUMULADOFINANCEIROATUAL: valorFinanceiroAnterior,
                ACUMULADOFISICOATUAL: valorFisicoAnterior,
                PRESENTEFISICO: 0,
                PRESENTEFINANCEIRO: 0,
                HORASTRAB: "",
                PermiteExcluir: "",
                Ativo: "",
                HORAMINIMA: "",
                EXTRA: equipamento.EXTRA
            });
            numeroSequencia++;
            prefixos.push(equipamento.PREFIXO);
        });


        dsContratoItens.forEach((item) => {
            var descricaoExibicao = item.PREFIXO ? `${item.PREFIXO} - ${item.DESCRICAO}` : item.DESCRICAO;
            itens.push({
                ID: item.CONTRATOITEMID,
                CONTRATOITEMID: item.CONTRATOITEMID,
                PREFIXO: item.PREFIXO,
                NSEQ: numeroSequencia,
                DESCRICAO: descricaoExibicao,
                DESCRICAOEXIBICAO: descricaoExibicao,
                CODUNIDADE: "",
                VALORUNITARIO: item.VALOR,
                QUANTIDADE: "",
                UNIDADE: item.UNIDADE,
                UNIDADEPREENCHIDA: item.UNIDADE != "" ? true : false,
                DIASTRABALHADOS: "0",
                ACUMULADOFINANCEIROANT: item.ACUMULADOATUAL > 0 ? arredondar(Number(item.ACUMULADOATUAL), 2) : 0,
                ACUMULADOFISICOANT: item.ACUMULADOFISICO > 0 ? Number(item.ACUMULADOFISICO) : 0,
                ACUMULADOFISICOPREENCHIDO: item.ACUMULADOFISICO > 0 ? true : false,
                ACUMULADOFINANCEIROPREENCHIDO: item.ACUMULADOATUAL > 0 ? true : false,
                ACUMULADOFINANCEIROATUAL: item.ACUMULADOATUAL > 0 ? arredondar(Number(item.ACUMULADOATUAL), 2) : 0,
                ACUMULADOFISICOATUAL: item.ACUMULADOFISICO > 0 ? Number(item.ACUMULADOFISICO) : 0,
                PRESENTEFISICO: 0,
                PRESENTEFINANCEIRO: 0,
                HORASTRAB: "",
                PermiteExcluir: "",
                Ativo: "",
                HORAMINIMA: "",
                EXTRA: 1
            });
            numeroSequencia++;
            prefixos.push(item.PREFIXO);
        });

        if (ultimaMedicoesItens.length > 0) {
            ultimaMedicoesItens.forEach((medicao) => {
                if (medicao.EQUIPLOCID > 0) {
                    var item = itens.filter(a => a.EQUIPLOCID == medicao.EQUIPLOCID);
                } else {
                    var item = itens.filter(a => a.PREFIXO == medicao.PREFIXO);
                }

                if (!item && (!medicao.prefixo || medicao.prefixo == "")) {
                    item = itens.filter(a => a.DESCRICAO == medicao.DESCRICAO);
                }

                if (item.length > 0) {
                    item[0].ACUMULADOFISICOANT = medicao.ACUMULADOFISICOATUAL;
                    item[0].ACUMULADOFINANCEIROANT = medicao.ACUMULADOFINANCEIROATUAL;
                    item[0].ACUMULADOFISICOATUAL = medicao.ACUMULADOFISICOATUAL;
                    item[0].ACUMULADOFINANCEIROATUAL = medicao.ACUMULADOFINANCEIROATUAL;
                    item[0].ACUMULADOFINANCEIROPREENCHIDO = medicao.ACUMULADOFINANCEIROATUAL > 0 ? true : false;
                    item[0].ACUMULADOFISICOPREENCHIDO = medicao.ACUMULADOFISICOATUAL > 0 ? true : false;
                }
            });
        }

        prefixos = [...new Set(prefixos.filter(a => a != "" && a != null))];

        var dsDescontosSisma = await ExecutaDataset(
            "dsMedicoes",
            null,
            [
                DatasetFactory.createConstraint("OPERACAO", "BUSCARDESCONTODETALHADO", "BUSCARDESCONTODETALHADO", ConstraintType.SHOULD),
                DatasetFactory.createConstraint("PREFIXOS", prefixosQuery, prefixosQuery, ConstraintType.SHOULD),
                DatasetFactory.createConstraint("GCCUSTO", CCUSTO.CODCCUSTO, CCUSTO.CODCCUSTO, ConstraintType.SHOULD),
            ],
            null
        );

        let periodoInicial = FormataData(moment(ultimaMedicao?.PERIODOFINAL).add(1, 'days'));
        let periodoFinal = FormataData(moment(ultimaMedicao?.PERIODOFINAL).add(1, 'days').endOf('month'));

        let descontosSismaFiltrados = [];
        let descontoAtual = 0;
        if (prefixos.length > 0) {
            var prefixosQuery = prefixos.reduce((accum, cur) => accum + "'" + cur + "',", "(");
            var prefixosQuery = prefixosQuery.slice(0, -1) + ")";
            descontosSismaFiltrados = dsDescontosSisma
                .filter(a => prefixos.includes(a.num_equipamento)
                    && a.dt_ordem >= FormataDataISO(periodoInicial)
                    && a.dt_ordem <= FormataDataISO(periodoFinal)
                );
            descontoAtual = descontosSismaFiltrados.reduce((acumulado, item) => acumulado + Number(item.vlr_total), 0);
        }

        setDescontosSisma(dsDescontosSisma);

        var totalAcumulado = itens.reduce((acumulador, item) => acumulador + (item.ACUMULADOFINANCEIROANT > 0 ? Number(item.ACUMULADOFINANCEIROANT) : 0), 0);

        let contratoAtual = { ...Contrato };
        contratoAtual.medicoes = [];

        let descontoAnterior = contratoDesconto?.VALORDESCONTO ??
            (Number(ultimaMedicao?.DESCONTOANTERIOR ?? 0) + Number(ultimaMedicao?.DESCONTOATUAL ?? 0));

        var novaMedicao = {
            primeiraMedicao: (ultimaMedicao ? false : true),
            fornecedor: Fornecedor,
            contrato: contratoAtual,
            ccusto: CCUSTO,
            COLIGADA: CCUSTO.COLIGADA,
            OBRA: CCUSTO.CODCCUSTO,
            FORNECEDOR: Fornecedor.NOMEFANTASIA,
            CNPJ: Fornecedor.CGCCFO,
            NUMEROMEDICAO: Number(ultimaMedicao?.NUMEROMEDICAO ?? 0) > 0 ? Number(ultimaMedicao?.NUMEROMEDICAO ?? 0) + 1 : 1,
            DATACOMPETENCIA: FormataData(moment()),
            DATACOMPETENCIAFORMATADA: moment().format("YYYY-MM-DD"),
            PERIODOINICIAL: periodoInicial,
            PERIODOFINAL: periodoFinal,
            IDCNT: Contrato.IDCNT,
            CODIGOCONTRATO: Contrato.CODIGOCONTRATO,
            IDMOV: -1,
            Itens: itens,
            ACUMULADOANTERIOR: totalAcumulado,
            PRESENTEMEDICAO: 0,
            ACUMULADOATUAL: 0,
            DESCONTOANTERIOR: descontoAnterior,
            DESCONTOATUAL: descontoAtual,
            SEGUNDAASSINATURA: ultimaMedicao?.SEGUNDAASSINATURA ?? "",
            TERCEIRAASSINATURA: ultimaMedicao?.TERCEIRAASSINATURA ?? "",
            CATEGORIAPRODUTOID: ultimaMedicao?.CATEGORIAPRODUTOID > 0 ? ultimaMedicao?.CATEGORIAPRODUTOID : null,
            CATEGORIAPRODUTO: ultimaMedicao?.CATEGORIAPRODUTOID > 0 ? ultimaMedicao?.CATEGORIAPRODUTO : "",
            POSSUIRETENCAO: false,
            PERCENTUALRETENCAO: ultimaMedicao?.PERCENTUALRETENCAO ?? 0.05,
            descontosSismaFiltrados: descontosSismaFiltrados,
            RETENCAOANTERIOR: Number(ultimaMedicao?.RETENCAOANTERIOR ?? 0) + Number(ultimaMedicao?.RETENCAOATUAL ?? 0),
            RETENCAOATUAL: 0,
            POSSUIREIDI: ultimaMedicao?.POSSUIREIDI ? (ultimaMedicao?.POSSUIREIDI == "true" ? true : false) : false,
            TAXAREIDI: ultimaMedicao?.TAXAREIDI > 0 ? ultimaMedicao?.TAXAREIDI : 0,
            REIDIANTERIOR: Number(ultimaMedicao?.REIDIANTERIOR ?? 0) + Number(ultimaMedicao?.REIDIATUAL ?? 0),
            REIDIATUAL: 0,
            OPTANTEPELOSIMPLES: (Fornecedor.OPTANTEPELOSIMPLES == "1" ? true : false),
            VALORDESCONTOEXTRA:0,
            ACUMULADOVALORDESCONTOEXTRA:ultimaMedicao?.ACUMULADO_DESCONTOS_EXTRA ?? 0,
        };

        totalizarValores(novaMedicao);

        setMedicao(novaMedicao)
    }

    async function handleEditarMedicao() {
        let dsMedicoes = await ExecutaDataset(
            "dsMedicoes",
            [],
            [
                DatasetFactory.createConstraint("OPERACAO", "SELECTWHEREMEDICAOID", "SELECTWHEREMEDICAOID", ConstraintType.SHOULD),
                DatasetFactory.createConstraint("MEDICAOID", medicaoEditarID, medicaoEditarID, ConstraintType.SHOULD),
            ],
            null
        );

        let medicaoFormatada = formatarObjetoMedicao(dsMedicoes);

        let numeroSequencia = 1
        let itens = [];
        var prefixos = [];


        medicaoFormatada.Itens.forEach((item) => {
            const valorFinanceiroAtual = Number(item.ACUMULADOFINANCEIROATUAL ?? 0);
            const valorFinanceiroAnterior = Number(item.ACUMULADOFINANCEIROANT ?? 0);
            const valorFisicoAtual = Number(item.ACUMULADOFISICOATUAL ?? 0);
            const valorFisicoAnterior = Number(item.ACUMULADOFISICOANT ?? 0);
            itens.push({
                ID: item.CONTRATOITEMID,
                EQUIPLOCID: item.ID,
                MEDICAOITEMID: item.MEDICAOITEMID,
                CONTRATOITEMID: item.CONTRATOITEMID,
                PREFIXO: item.PREFIXO,
                NSEQ: numeroSequencia,
                DESCRICAO: item.DESCRICAO,
                DESCRICAOEXIBICAO: item.DESCRICAO,
                CODUNIDADE: "",
                VALORUNITARIO: item.VALORUNITARIO,
                QUANTIDADE: "",
                UNIDADE: item.UNIDADE,
                UNIDADEPREENCHIDA: item.UNIDADE != "" ? true : false,
                DIASTRABALHADOS: item.DIASTRABALHADOS,
                ACUMULADOFINANCEIROANT: item.ACUMULADOFINANCEIROANT,
                ACUMULADOFISICOANT: item.ACUMULADOFISICOANT,
                ACUMULADOFINANCEIROATUAL: item.ACUMULADOFINANCEIROATUAL,
                ACUMULADOFISICOATUAL: item.ACUMULADOFISICOATUAL,
                ACUMULADOFISICOPREENCHIDO: valorFisicoAnterior > 0 ? true : false,
                ACUMULADOFINANCEIROPREENCHIDO: valorFinanceiroAnterior > 0 ? true : false,
                PRESENTEFISICO: item.PRESENTEFISICO,
                PRESENTEFINANCEIRO: item.PRESENTEFINANCEIRO,
                HORASTRAB: "",
                PermiteExcluir: "",
                Ativo: "",
                HORAMINIMA: ""
            });
            numeroSequencia++;
            prefixos.push(item.PREFIXO);
        });

        var totalAcumulado = itens.reduce((acumulador, item) => acumulador + (item.ACUMULADOFINANCEIROANT > 0 ? Number(item.ACUMULADOFINANCEIROANT) : 0), 0);

        prefixos = [...new Set(prefixos.filter(a => a != "" && a != null))];

        var dsDescontosSisma = await ExecutaDataset(
            "dsMedicoes",
            null,
            [
                DatasetFactory.createConstraint("OPERACAO", "BUSCARDESCONTODETALHADO", "BUSCARDESCONTODETALHADO", ConstraintType.SHOULD),
                DatasetFactory.createConstraint("PREFIXOS", prefixosQuery, prefixosQuery, ConstraintType.SHOULD),
                DatasetFactory.createConstraint("GCCUSTO", CCUSTO.CODCCUSTO, CCUSTO.CODCCUSTO, ConstraintType.SHOULD),
            ],
            null
        );

        let descontosSismaFiltrados = [];
        let descontoAtual = 0;
        if (prefixos.length > 0) {
            var prefixosQuery = prefixos.reduce((accum, cur) => accum + "'" + cur + "',", "(");
            var prefixosQuery = prefixosQuery.slice(0, -1) + ")";
            descontosSismaFiltrados = dsDescontosSisma
                .filter(a => prefixos.includes(a.num_equipamento)
                    && a.dt_ordem >= FormataDataISO(medicaoFormatada.PERIODOINICIAL)
                    && a.dt_ordem <= FormataDataISO(medicaoFormatada.PERIODOFINAL)
                );
        }

        setDescontosSisma(dsDescontosSisma);

        let contratoAtual = { ...Contrato };
        contratoAtual.medicoes = [];
        var novaMedicao = {
            fornecedor: Fornecedor,
            contrato: contratoAtual,
            ccusto: CCUSTO,
            COLIGADA: medicaoFormatada.COLIGADA,
            FORNECEDOR: medicaoFormatada.FORNECEDOR,
            CNPJ: medicaoFormatada.CNPJ,
            OBRA: medicaoFormatada.OBRA,
            MEDICAOID: medicaoFormatada.MEDICAOID,
            NUMEROMEDICAO: Number(medicaoFormatada.NUMEROMEDICAO ?? 0) > 0 ? Number(medicaoFormatada.NUMEROMEDICAO ?? 0) : 1,
            DATACOMPETENCIA: medicaoFormatada.DATACOMPETENCIA,
            DATACOMPETENCIAFORMATADA: medicaoFormatada.DATACOMPETENCIA,
            PERIODOINICIAL: medicaoFormatada.PERIODOINICIAL,
            PERIODOFINAL: medicaoFormatada.PERIODOFINAL,
            IDCNT: medicaoFormatada.IDCNT,
            CODIGOCONTRATO: medicaoFormatada.CODIGOCONTRATO,
            IDMOV: -1,
            Itens: itens,
            ACUMULADOANTERIOR: totalAcumulado,
            PRESENTEMEDICAO: medicaoFormatada.PRESENTEMEDICAO,
            ACUMULADOATUAL: medicaoFormatada.ACUMULADOATUAL,
            DESCONTOANTERIOR: medicaoFormatada.DESCONTOANTERIOR,
            DESCONTOATUAL: medicaoFormatada.DESCONTOATUAL,
            SEGUNDAASSINATURA: medicaoFormatada.SEGUNDAASSINATURA ?? "",
            TERCEIRAASSINATURA: medicaoFormatada.TERCEIRAASSINATURA ?? "",
            CATEGORIAPRODUTOID: medicaoFormatada.CATEGORIAPRODUTOID > 0 ? medicaoFormatada.CATEGORIAPRODUTOID : null,
            CATEGORIAPRODUTO: medicaoFormatada.CATEGORIAPRODUTOID > 0 ? medicaoFormatada.CATEGORIAPRODUTO : "",
            POSSUIRETENCAO: medicaoFormatada.POSSUIRETENCAO,
            PERCENTUALRETENCAO: medicaoFormatada.PERCENTUALRETENCAO ?? 0.05,
            descontosSismaFiltrados: descontosSismaFiltrados ?? [],
            RETENCAOANTERIOR: medicaoFormatada.RETENCAOANTERIOR,
            RETENCAOATUAL: medicaoFormatada.RETENCAOATUAL,
            POSSUIREIDI: medicaoFormatada.POSSUIREIDI == "true" ? true : false,
            TAXAREIDI: medicaoFormatada.TAXAREIDI,
            REIDIANTERIOR: medicaoFormatada.REIDIANTERIOR,
            REIDIATUAL: medicaoFormatada.REIDIATUAL,
            OPTANTEPELOSIMPLES: (Fornecedor.OPTANTEPELOSIMPLES == "1" ? true : false),
            VALORDESCONTOEXTRA: medicaoFormatada.DESCONTOS_EXTRA,
            ACUMULADOVALORDESCONTOEXTRA: medicaoFormatada.ACUMULADOVALORDESCONTOEXTRA,
        };

        totalizarValores(novaMedicao);
        setMedicao(novaMedicao)
    }

    function validarFormulario(medicaoOriginal) {
        let medicao = { ...medicaoOriginal };
        if (!(validarData(medicao.DATACOMPETENCIA, "DD/MM/YYYY") && validarData(medicao.PERIODOINICIAL, "DD/MM/YYYY") && validarData(medicao.PERIODOFINAL, "DD/MM/YYYY"))) {
            FLUIGC.toast({
                title: "Verificar data não preenchida ou inválida",
                message: "",
                type: "warning"
            });
            return false;
        }

        let itensSemMedicao = medicao.Itens.filter(a => !(a.DIASTRABALHADOS > 0));

        if (itensSemMedicao.length > 0) {
            if (!confirm("Existem itens sem medição. Deseja prosseguir com medição zerada?")) {
                return false;
            }
            itensSemMedicao.forEach(item => {
                item.DIASTRABALHADOS = 0;
                item.PRESENTEFISICO = 0;
            })
        }

        if (!(medicao.NUMEROMEDICAO > 0)) {
            FLUIGC.toast({
                title: "Numero da medição não informado",
                message: "",
                type: "warning"
            });
            return false;
        }

        if (!(Medicao.CATEGORIAPRODUTOID > 0)) {
            FLUIGC.toast({
                title: "Categoria de serviço/produto não informada",
                message: "",
                type: "warning"
            });
            return false;
        }

        return true;
    }

    async function handleSalvarMedicao() {
        var medicao = { ...Medicao };
        totalizarValores(medicao);
        setMedicao(medicao);

        if (!validarFormulario(medicao)) {
            return;
        }

        medicao.DATACOMPETENCIAFORMATADA = FormataDataISO(medicao.DATACOMPETENCIA);
        medicao.PERIODOINICIALFORMATADA = FormataDataISO(medicao.PERIODOINICIAL);
        medicao.PERIODOFINALFORMATADA = FormataDataISO(medicao.PERIODOFINAL);

        var dsMedicoesAtualizadas = null;
        var JSONMEDICAO = JSON.stringify(medicao);
        if (medicao.MEDICAOID > 0) {
            dsMedicoesAtualizadas = await ExecutaDataset(
                "dsMedicoes",
                [],
                [
                    DatasetFactory.createConstraint("OPERACAO", "UPDATE", "UPDATE", ConstraintType.SHOULD),
                    DatasetFactory.createConstraint("JSONMEDICAO", JSONMEDICAO, JSONMEDICAO, ConstraintType.MUST),
                ],
                null
            );
        } else {
            var dsMedicoesAtualizadas = await ExecutaDataset(
                "dsMedicoes",
                null,
                [
                    DatasetFactory.createConstraint("OPERACAO", "INSERT", "INSERT", ConstraintType.SHOULD),
                    DatasetFactory.createConstraint("JSONMEDICAO", JSONMEDICAO, JSONMEDICAO, ConstraintType.MUST),
                ],
                null
            );

            if (!dsMedicoesAtualizadas || dsMedicoesAtualizadas.length == 0) {
                FLUIGC.toast({
                    title: "Data Erro ao salvar medição!",
                    message: "",
                    type: "error"
                });
                return;
            }

            let dsMedicaoInsert = formatarObjetoMedicao(dsMedicoesAtualizadas);

            if (!(dsMedicaoInsert.MEDICAOID > 0)) {
                FLUIGC.toast({
                    title: "Erro ao salvar medição!",
                    message: "",
                    type: "error"
                });
                return;
            }

            medicao.MEDICAOID = dsMedicaoInsert.MEDICAOID;
            medicao.Itens = dsMedicaoInsert.Itens;
        }

        if (dsMedicoesAtualizadas) {
            var medicaoFormatada = formatarObjetoMedicao(dsMedicoesAtualizadas);
            $("#medicaoID").val(medicaoFormatada.MEDICAOID);
            medicaoFormatada.fornecedor = medicao.fornecedor;
            medicaoFormatada.ccusto = medicao.ccusto;
            medicaoFormatada.contrato = medicao.contrato;
            gerarPDF(medicaoFormatada);
            $("#medicaoID").val(medicaoFormatada.MEDICAOID);
            setMedicao(null);
            let contratoAux = {};
            onChangeContrato(contratoAux);
        }

        window.parent.$("#workflowActions").show();
        retornarSelecaoInicial();
    }

    function totalizarValores(medicao) {
        medicao.ACUMULADOANTERIOR = medicao.Itens.reduce((acumulador, item) => acumulador + (item.ACUMULADOFINANCEIROANT > 0 ? Number(item.ACUMULADOFINANCEIROANT) : 0), 0);
        medicao.PRESENTEMEDICAO = medicao.Itens.reduce((acumulador, item) => acumulador + (item.PRESENTEFINANCEIRO > 0 ? Number(item.PRESENTEFINANCEIRO) : 0), 0);
        medicao.ACUMULADOATUAL = medicao.ACUMULADOANTERIOR + medicao.PRESENTEMEDICAO;
        medicao.RETENCAOATUAL = Number(Number(medicao.PRESENTEMEDICAO) - Number(medicao.DESCONTOATUAL) - Number(medicao.VALORDESCONTOEXTRA))  * (medicao.POSSUIRETENCAO ? medicao.PERCENTUALRETENCAO : 0);
        medicao.REIDIATUAL = Number(medicao.PRESENTEMEDICAO - medicao.RETENCAOATUAL - Number(medicao.DESCONTOATUAL) - Number(medicao.VALORDESCONTOEXTRA)) * Number(medicao.TAXAREIDI) / 100;
        console.log(medicao)
    }

    function updateDescontoSisma(medicao) {
        let medicaoTemp = medicao ? medicao : { ...Medicao };
        let prefixos = medicaoTemp.Itens.map(a => a.PREFIXO);

        prefixos = [...new Set(prefixos.filter(a => a != "" && a != null))];

        if (prefixos.length > 0) {
            let dataInicial = FormataDataISO(medicaoTemp.PERIODOINICIAL);
            let dataFinal = FormataDataISO(medicaoTemp.PERIODOFINAL);
            let descontosSismaFiltrados = DescontosSisma
                .filter(a => prefixos.includes(a.num_equipamento)
                    && moment(a.dt_ordem) >= moment(dataInicial)
                    && moment(a.dt_ordem) <= moment(dataFinal)
                );
            var descontoAtual = descontosSismaFiltrados.reduce((acumulado, item) => acumulado + Number(item.vlr_total), 0);

            medicaoTemp.descontosSismaFiltrados = descontosSismaFiltrados;
            medicaoTemp.DESCONTOATUAL = descontoAtual;
        }

        return medicaoTemp;
    }

    function onChangeMedicao(e) {
        if (e.atualizadoDescontoSisma) {
            e = updateDescontoSisma(e);
        }
        var MedicaoTemp = { ...Medicao, ...e };
        setMedicao(MedicaoTemp);
        totalizarValores(MedicaoTemp);
    }

    async function onRemoverItem(id) {
        var MedicaoTemp = { ...Medicao };
        var itensRemoverTemp = [...itensRemover];
        if (!confirm("Confirma a remoção deste item?")) {
            return
        }
        let itemRemover = MedicaoTemp.Itens.filter(a => a.ID == id);
        if (itemRemover && itemRemover.length > 0) {
            itensRemoverTemp.push(itemRemover[0]);
        }
        var novaListaItens = MedicaoTemp.Itens.filter(a => a.ID != id);
        for (i = 0; i < novaListaItens.length; i++) {
            novaListaItens[i].NSEQ = i + 1;
        }

        MedicaoTemp.Itens = novaListaItens;

        MedicaoTemp.atualizadoDescontoSisma = true;

        totalizarValores(MedicaoTemp);
        onChangeMedicao(MedicaoTemp);
        setItensRemover(itensRemoverTemp);
    }

    return (
        <>
            {!Medicao && <button hidden={true} className="btn btn-info" onClick={handleNovaMedicao} id="bntNovaMedicao">
            </button>}
            {!Medicao && <button hidden={true} className="btn btn-info" onClick={handleEditarMedicao} id="btnEditarMedicao">
            </button>}
            <br />
            {Medicao &&
                <BoletimMedicao
                    Contrato={Contrato}
                    Medicao={Medicao}
                    CCUSTO={CCUSTO}
                    Fornecedor={Fornecedor}
                    onChangeMedicao={onChangeMedicao}
                    onRemoverItem={onRemoverItem}
                    totalizarValores={totalizarValores} />}
            <br />
            {Medicao &&
                <FormularioNovoItem
                    Medicao={Medicao}
                    onChangeMedicao={onChangeMedicao} />}
            <br />
            {Medicao &&
                <div className="col-md-offset-10">
                    <button className="btn btn-success" onClick={handleSalvarMedicao}>
                        Salvar Medição
                    </button>
                </div>
            }
        </>
    );
}