const useState = React.useState;
const useEffect = React.useEffect;

function BoletimMedicao({ Contrato, Medicao, CCUSTO, Fornecedor, onChangeMedicao, totalizarValores, onRemoverItem, updateDescontoSisma }) {
    const [IsViewMode, setIsViewMode] = useState(false);

    function onAdicionarItem() {
        var MedicaoTemp = [...Medicao];

        MedicaoTemp.Itens.push({
            ID: geraId(),
            NSEQ: MedicaoTemp.Itens.length + 1,
            DESCRICAO:"",
            CODUNIDADE:"",
            VALORUNITARIO:"",
            QUANTIDADE:"",
            DIASTRABALHADOS:"0",
            ACUMULADOANTERIOR:"",
            HORASTRAB:"",
            PermiteExcluir:"",
            Ativo:"",
            HORAMINIMA:""
        });

        onChangeMedicao(MedicaoTemp);
    }

    function onChangeItem(nSeq, columnName, newValue) {
        const MedicaoTemp = { ...Medicao };
        const itemIndex = MedicaoTemp.Itens.findIndex(item => item.NSEQ === nSeq);
        const MESFEVEREIRO = verificaFevereiro(Medicao.PERIODOINICIAL) && verificaFevereiro(Medicao.PERIODOFINAL);
        const BISEXTO = moment(Medicao.PERIODOINICIAL, "YYYY-MM-DD").isLeapYear();
        let diasReferencia = 30;
        let itemEditado = MedicaoTemp.Itens[itemIndex];
        const unidadesDia = ["MÊS","DIA"];

        if (itemIndex !== -1) {
            itemEditado[columnName] = newValue;
            if (!(itemEditado["DIASTRABALHADOS"] >= 0)){
                itemEditado["DIASTRABALHADOS"] = 0;
            }

            if (columnName == "DIASTRABALHADOS" || columnName == "UNIDADE" || columnName == "ACUMULADOFISICOANT"){
                obterTotalDiasMedicao();
                if (columnName == "DIASTRABALHADOS" && unidadesDia.includes(itemEditado.UNIDADE.toUpperCase()) && Medicao.TOTALDIASMEDICAO < newValue){
                    FLUIGC.toast({
                        title: "Os dias trabalhos não devem ser maior que a quantidade de dias no intervalo medido",
                        message: "",
                        type: "warning"
                    });
                    return;
                }

                if (MESFEVEREIRO){
                    diasReferencia = BISEXTO ? 29 : 28;

                } else {
                    diasReferencia = Medicao.TOTALDIASMEDICAO > 31 ? 31 : 30;
                }

                
                if (columnName == "DIASTRABALHADOS" && (newValue.split('.')[1] > 0)){
                    if (unidadesDia.includes(itemEditado.UNIDADE.toUpperCase())){
                        itemEditado["DIASTRABALHADOS"] = arredondarPara0_5(newValue);
                    } else if(itemEditado.UNIDADE.toUpperCase() == "TONELADA" || itemEditado.UNIDADE.toUpperCase() == "HORA"){
                        if (newValue.split('.')[1].length > 2){
                            itemEditado["DIASTRABALHADOS"] = arredondar(newValue,2);
                        }
                    }
                }

                let VALORFISICO = columnName == "DIASTRABALHADOS" ? newValue: itemEditado["DIASTRABALHADOS"];
                if (itemEditado.UNIDADE == "MÊS" && columnName == "DIASTRABALHADOS"){
                    if (Number(newValue) == 31 && Medicao.TOTALDIASMEDICAO == 31){
                        VALORFISICO = 1.00;
                    } else {
                        VALORFISICO = (newValue / diasReferencia).toFixed(15);
                    }
                } else if (itemEditado.UNIDADE == "MÊS"){
                    VALORFISICO = (itemEditado.DIASTRABALHADOS / diasReferencia).toFixed(15);
                } else {
                    VALORFISICO = itemEditado.DIASTRABALHADOS;
                }
                itemEditado.PRESENTEFISICO = VALORFISICO;
                let acumuladoFisico = Number(itemEditado.ACUMULADOFISICOANT) + Number(VALORFISICO);
                itemEditado.ACUMULADOFISICOATUAL = acumuladoFisico.toFixed(15);
                let acumuladoFinanceiro = Number(itemEditado.ACUMULADOFINANCEIROANT) + (Number(VALORFISICO) * Number(itemEditado.VALORUNITARIO));
                itemEditado.ACUMULADOFINANCEIROATUAL = acumuladoFinanceiro;
            }
            alterarValorFinanceiro(MedicaoTemp.Itens[itemIndex]);
            totalizarValores(MedicaoTemp);
            onChangeMedicao(MedicaoTemp);
        }
    }

    function obterTotalDiasMedicao() {
        const TOTALDIASMEDICAO = obterDiferencaDias(Medicao.PERIODOINICIAL, Medicao.PERIODOFINAL) + 1;
        if (!TOTALDIASMEDICAO > 0){
            FLUIGC.toast({
                    title: "Data do intervalo de medição não preenchida!",
                    message: "",
                    type: "warning"
                });
        }
        Medicao.TOTALDIASMEDICAO = TOTALDIASMEDICAO > 31 ? 31 : TOTALDIASMEDICAO;
    }

    function alterarValorFinanceiro(item) {
        if (item.UNIDADE.includes("MÊS")){
            if (Medicao.TOTALDIASMEDICAO < item.DIASTRABALHADOS){
                FLUIGC.toast({
                    title: "A quantidade de dias trabalhados é menor que o período selecionado na medição!",
                    message: "",
                    type: "warning"
                });
                item.DIASTRABALHADOS = 0;
                item.PRESENTEFISICO = 0;
            }
            item.PRESENTEFINANCEIRO = arredondar(item.PRESENTEFISICO * item.VALORUNITARIO, 2);
        } else if (item.UNIDADE.includes("DIA")) {
            item.PRESENTEFINANCEIRO = arredondar(item.DIASTRABALHADOS * item.VALORUNITARIO, 2);
        } else {
            item.PRESENTEFINANCEIRO = arredondar(item.PRESENTEFISICO * item.VALORUNITARIO, 2);
        }
        item.ACUMULADOFINANCEIROATUAL = Number(item.PRESENTEFISICO) * Number(item.VALORUNITARIO) + Number(item.ACUMULADOFINANCEIROANT);
    }

    function onChangePropMedicao(atributo, valor){
        let medicaoTemp = { ...Medicao };
        medicaoTemp[atributo] = valor;
        if (atributo == 'PERIODOINICIAL' || atributo == 'PERIODOFINAL'){
            const TOTALDIASMEDICAO = obterDiferencaDias(medicaoTemp.PERIODOINICIAL, medicaoTemp.PERIODOFINAL) + 1;
            if (TOTALDIASMEDICAO <= 0){
                FLUIGC.toast({
                    title: "Verificar o período da medição!",
                    message: "",
                    type: "warning"
                });
            }

            if (TOTALDIASMEDICAO > 31){
                medicaoTemp.PERIODOFINAL = obterDataFinalLimite(medicaoTemp.PERIODOINICIAL);
                FLUIGC.toast({
                    title: "Período da medição maior que o limite máximo (31 dias)!",
                    message: "",
                    type: "warning"
                });
            }

            medicaoTemp.Itens.forEach((item) => {
                medicaoTemp.TOTALDIASMEDICAO = TOTALDIASMEDICAO;
                item.ACUMULADOFISICOATUAL = Number(item.ACUMULADOFISICOANT) + Number(item.PRESENTEFISICO);
                alterarValorFinanceiro(item);
            });

            medicaoTemp.PRESENTEMEDICAO = medicaoTemp.Itens.map(a => a.PRESENTEFINANCEIRO).reduce((accum, cur) => accum + cur, 0);

            medicaoTemp.atualizadoDescontoSisma = true;
        }

        if (["POSSUIREIDI","TAXAREIDI","POSSUIRETENCAO"].includes(atributo)){
            totalizarValores(medicaoTemp);
        }

        onChangeMedicao(medicaoTemp);
    }

    return (
        <>
            <BoletimMedicaoHead
                Contrato={Contrato}
                Medicao={Medicao}
                CCUSTO={CCUSTO}
                Fornecedor={Fornecedor}
                IsViewMode={IsViewMode}
                onChangePropMedicao={onChangePropMedicao}
                alterarValorFinanceiro={alterarValorFinanceiro} />

            <BoletimDeMedicaoBody
                Medicao={Medicao}
                MostraColunasDeTempo={true}
                MostraColunasAcumulado={true}
                HoverColunasAcumulado={false}
                AdicionarNovoItem={onAdicionarItem}
                IsViewMode={IsViewMode}
                onRemoverItem={onRemoverItem}
                onChangeItem={onChangeItem}
                onChangeMedicao={onChangeMedicao}
                onChangePropMedicao={onChangePropMedicao}
                totalizarValores={totalizarValores}
                alterarValorFinanceiro={alterarValorFinanceiro} />
        </>
    );
}

function BoletimMedicaoHead({ Contrato, Medicao, CCUSTO, Fornecedor, IsViewMode, alterarValorFinanceiro, onChangePropMedicao }) {
    const [categoriasProdutoMedicao, setCategoriasProdutoMedicao] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                var dsCategoriasProdutoMedicao = await ExecutaDataset(
                    "dsMedicoes",
                    null,
                    [
                        DatasetFactory.createConstraint("OPERACAO", "SELECTCATEGORIASPRODUTOMEDICAO", "SELECTCATEGORIASPRODUTOMEDICAO", ConstraintType.SHOULD),
                    ],
                    null
                );
                setCategoriasProdutoMedicao(dsCategoriasProdutoMedicao || []);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
                setCategoriasProdutoMedicao([]);
            }
        };

        fetchData();
    }, []);

    const handleCategoriaChange = (e) => {
        let descricao = ""
        if (e.target.value > 0){
            descricao = categoriasProdutoMedicao.filter(a => a.ID == e.target.value)[0].DESCRICAO;
        }
        onChangePropMedicao("CATEGORIAPRODUTO", descricao);
        onChangePropMedicao("CATEGORIAPRODUTOID", e.target.value);
    };

    return (
        <table className="table table-bordered table-boletim" style={{ marginBottom: "0px", overflowX: "scroll" }}>
            <thead>
                <tr>
                    <th style={{ verticalAlign: "middle" }} colSpan={4}>
                        <img src="https://www.castilho.com.br/logo-castilho.png" alt="" height="30px" align="left" style={{ margin: "10px" }} />
                        <h3 style={{ display: "inline-flex", margin: "10px" }}>Boletim de Medição</h3>
                    </th>
                    <th colSpan={1} style={{ verticalAlign: "middle" }}>
                        <select name="" id="" className="form-control" style={{ width: "fit-content", display: "inline-block" }}>
                            <option value="Parcial">Parcial</option>
                            <option value="Final">Final</option>
                        </select>
                    </th>
                </tr>
                <tr>
                    <th className="textAlignCenter" rowSpan={2} style={{ verticalAlign: "middle" }}>
                        <b>Centro de Custo</b>
                        <br />
                        {CCUSTO.CODCCUSTO} - {CCUSTO.NOME}
                    </th>
                    <th className="textAlignCenter">
                        <b>Código RM</b>
                        <br />
                        {Fornecedor.CODCFO}
                    </th>
                    <th rowSpan={2} className="textAlignCenter" style={{ verticalAlign: "middle", width: "40%" }}>
                        <b>Fornecedor</b>
                        <br />
                        {Fornecedor.CGCCFO}
                        <br />
                        {Fornecedor.NOMEFANTASIA}
                    </th>
                    <th>
                        <b>Contrato N.</b>
                        <br />
                        {Contrato.CODIGOCONTRATO}
                    </th>
                    <th style={{ verticalAlign: "middle" }}>
                        <b>Boletim Med N.</b>
                        <br />
                        {Medicao.primeiraMedicao && (
                            <NumberInput
                                value={Medicao.NUMEROMEDICAO}
                                onChange={(e) => onChangePropMedicao("NUMEROMEDICAO",e)}
                            ></NumberInput>
                        )}
                        {!Medicao.primeiraMedicao && (<span>{Medicao.NUMEROMEDICAO}</span>)}
                    </th>
                </tr>
                <tr>
                    <th className="textAlignCenter">
                        <b>Simples Nacional</b>
                        <br />
                        {Medicao.OPTANTEPELOSIMPLES == true ? "Sim" : "Não"}
                    </th>
                    <th>
                        <b>Período</b>
                        <br />
                        <div>
                            {!IsViewMode ? (
                                <>
                                    {!Medicao.primeiraMedicao && (
                                        <span>{Medicao.PERIODOINICIAL}{'\u00A0'} </span>
                                    )}
                                    {Medicao.primeiraMedicao && (
                                        <DatePicker value={Medicao.PERIODOINICIAL} onChangeValue={(e) => onChangePropMedicao("PERIODOINICIAL", e)} />
                                    )}
                                    a
                                    <DatePicker value={Medicao.PERIODOFINAL} onChangeValue={(e) => onChangePropMedicao("PERIODOFINAL", e)} />
                                </>
                            ) : (
                                <>
                                    {Medicao.PERIODOINICIAL} a {Medicao.PERIODOFINAL}
                                </>
                            )}
                        </div>
                    </th>
                    <th style={{ textAlign: "center" }}>
                        <b>Data</b>
                        <br />
                        {!IsViewMode ? (
                            <>
                                <DatePicker style={{ textAlign: "center" }} value={Medicao.DATACOMPETENCIA} onChangeValue={(e) => onChangePropMedicao("DATACOMPETENCIA", e)} />
                            </>
                        ) : (
                            <>{Medicao.DATACOMPETENCIA}</>
                        )}
                    </th>
                </tr>
                <tr className="text-center">
                    <th colSpan={3}>
                        <div style={{ display: "inline-flex", margin: "auto", padding: "8px", verticalAlign: "middle" }}>
                            <b style={{ whiteSpace: "nowrap", padding: "inherit" }}>Tipo de Serviço/Produto:</b>
                            <select
                                name="categoriasProdutoMedicao"
                                id="categoriasProdutoMedicao"
                                className="form-control"
                                style={{ marginLeft: "10px" }}
                                value={Medicao.CATEGORIAPRODUTOID}
                                onChange={(e) => handleCategoriaChange(e)}
                            >
                                <option value=""></option>
                                {Array.isArray(categoriasProdutoMedicao) && categoriasProdutoMedicao.map((categoria) => (
                                    <option key={categoria.ID} value={categoria.ID}>
                                        {categoria.DESCRICAO}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </th>
                    <th>
                        <b>REIDI</b>
                        <br/>
                        <div className={!Medicao.POSSUIREIDI ? "col-md-12 col-lg-12 col-sm-12" : "col-md-4 col-lg-4 col-sm-4"}>
                            <div className="switch switch-primary">
                                <input
                                    className="switch-input"
                                    type="checkbox"
                                    id="switch-1-2"
                                    checked={Medicao.POSSUIREIDI}
                                    onChange={() => onChangePropMedicao("POSSUIREIDI", !(Medicao.POSSUIREIDI ?? false))}/>
                                <label className="switch-button" htmlFor="switch-1-2">REIDI</label>
                            </div>
                        </div>
                        {Medicao.POSSUIREIDI && (
                            <div className="col-md-8 col-lg-8 col-sm-8">
                                <select
                                    value={Medicao.TAXAREIDI}
                                    onChange={(e) => onChangePropMedicao("TAXAREIDI",e.target.value)}>
                                        <option value=""></option>
                                        <option value="3.65">3,65%</option>
                                        <option value="9.25">9,25%</option>
                                </select>
                            </div>
                        )}
                    </th>
                    <th>
                        <b>Retenção</b>
                        <br/>
                        <div className="switch switch-primary">
                            <input
                                className="switch-input"
                                type="checkbox"
                                id="switch-1-1"
                                checked={Medicao.POSSUIRETENCAO}
                                onChange={() => onChangePropMedicao("POSSUIRETENCAO", !(Medicao.POSSUIRETENCAO ?? false))}/>
                            <label className="switch-button" htmlFor="switch-1-1">Retenção</label>
                        </div>
                    </th>
                </tr>
            </thead>
        </table>
    );
}

function BoletimDeMedicaoBody({
    Medicao,
    MostraColunasDeTempo,
    MostraColunasAcumulado,
    HoverColunasAcumulado,
    IsViewMode,
    onChangeItem,
    onChangePropMedicao,
    onRemoverItem
}) {
    let contemItemExclusao = Medicao.Itens?.filter(a => a.PERMITEEXCLUSAO).length > 0;

    function validarValorInputDias(item, valor) {
        if (["DIA","MÊS"].includes(item.UNIDADE)){
            valor = valor > Medicao.TOTALDIASMEDICAO ? Medicao.TOTALDIASMEDICAO : valor;
            onChangeItem(item.NSEQ, "DIASTRABALHADOS", valor);
        } else if (item.UNIDADE == "HORA"){
            const limiteHoras = Number(Medicao.TOTALDIASMEDICAO) * 24;
            valor = valor > limiteHoras ? limiteHoras : valor;
            onChangeItem(item.NSEQ, "DIASTRABALHADOS", valor);
        } else {
            onChangeItem(item.NSEQ, "DIASTRABALHADOS", valor);
        }
    }

    const [isModalOpen, setModalOpen] = useState(false);

    function onCloseModal(){
        setModalOpen(false);
    }

    function openModalDesconto(){
        setModalOpen(true);
    }

    return (
        <>
            <ModalDescontos
                Medicao={Medicao}
                isModalDescontoOpen={isModalOpen}
                onCloseModal={onCloseModal}>
            </ModalDescontos>
            <table className="table table-bordered table-boletim" style={{ maxWidth: "100%", marginBottom: "0px" }}>
                <thead>
                    <tr>
                        <th rowSpan={2} className="bg-gray">Item</th>
                        <th rowSpan={2} className="bg-gray">Descrição dos Serviços</th>
                        <th rowSpan={2} className="bg-gray">UNID.</th>
                        <th rowSpan={2} className="bg-gray">PREÇO UNIT (R$)</th>
                        <th colSpan={4 - (MostraColunasDeTempo ? 0 : 3) - (MostraColunasAcumulado ? 0 : 2)}className="semPadding bg-gray">
                            FISICO
                        </th>
                        <th colSpan={4 - (MostraColunasAcumulado ? 0 : 2)} className="semPadding bg-gray">
                            FINANCEIRO
                        </th>
                    </tr>
                    <tr>
                        {MostraColunasAcumulado && <th className={HoverColunasAcumulado ? "HoverCollumn bg-gray" : "bg-gray"}>ACUMULADO ANTERIOR</th>}

                        {MostraColunasDeTempo && (
                            <th className="bg-gray">MEDIÇÂO</th>
                        )}

                        <th className="bg-gray">PRESENTE MEDIÇÂO</th>
                        {MostraColunasAcumulado && (
                            <>
                                <th className={HoverColunasAcumulado ? "HoverCollumn bg-gray" : "bg-gray"}>ACUMULADO ATUAL</th>
                                <th className={HoverColunasAcumulado ? "HoverCollumn bg-gray" : "bg-gray"}>ACUMULADO ANTERIOR</th>
                            </>
                        )}

                        <th className="bg-gray">PRESENTE MEDIÇÂO</th>

                        {MostraColunasAcumulado && <th className={HoverColunasAcumulado ? "HoverCollumn bg-gray" : "bg-gray"}>ACUMULADO ATUAL</th>}
                        {contemItemExclusao && (<th className="bg-gray"><i className={"flaticon flaticon-trash icon-md"}></i></th>)}
                    </tr>
                </thead>
                <tbody>
                    {Medicao.Itens.map((Item) => {
                    return( <tr key={Item.NSEQ} className="rowItem">
                            <td>{Item.NSEQ}</td>
                            <td>{Item.DESCRICAO}</td>
                            {Item.UNIDADEPREENCHIDA && (<td>{Item.UNIDADE}</td>)}
                            {!Item.UNIDADEPREENCHIDA && (
                                <td>
                                    <select
                                        className={"form-control"}
                                        style={{ textAlign: "center", display: "inline" }}
                                        value={Item.UNIDADE}
                                        onChange={(e) => onChangeItem(Item.NSEQ, "UNIDADE", e.target.value)}>
                                            <option value=""></option>
                                            <option value="MÊS">MÊS</option>
                                            <option value="DIA">DIA</option>
                                            <option value="HORA">HORA</option>
                                            <option value="M">M</option>
                                            <option value="M²">M²</option>
                                            <option value="M³">M³</option>
                                            <option value="KM">KM</option>
                                            <option value="UN">UN</option>
                                            <option value="VB">VB</option>
                                            <option value="TONELADA">TONELADA</option>
                                            <option value="KMXTON">KM x Ton</option>
                                    </select>
                                </td>)}
                            <td>{Item.VALORUNITARIO.toString()}</td>

                            {MostraColunasAcumulado && (
                                <td>
                                    {Item.ACUMULADOFISICOPREENCHIDO && (
                                        <span className="ItemAcumuladoAnteriorFisico">{arredondar(Item.ACUMULADOFISICOANT, 2)}</span>
                                    )}
                                    {!Item.ACUMULADOFISICOPREENCHIDO && (
                                        <NumberInput
                                            QuantidadeDeCasasDecimais="15"
                                            value={Item.ACUMULADOFISICOANT}
                                            className="form-control"
                                            onChange={(newValue) => onChangeItem(Item.NSEQ, "ACUMULADOFISICOANT", newValue)}
                                            readOnly={IsViewMode}
                                        />
                                    )}
                                </td>
                            )}

                            {MostraColunasDeTempo && (
                                <>
                                    <td>
                                        {Item.UNIDADE != 'MÊS' && (
                                            <NumberInput
                                                value={Item.DIASTRABALHADOS}
                                                min="0"
                                                max="100"
                                                QuantidadeDeCasasDecimais="2"
                                                className="form-control"
                                                onChange={(newValue) => validarValorInputDias(Item, newValue)}
                                                readOnly={IsViewMode}
                                            />
                                        )}
                                        {Item.UNIDADE == 'MÊS' && (
                                            <NumberInput
                                                value={Item.DIASTRABALHADOS}
                                                min="0"
                                                max="100"
                                                className="form-control"
                                                onChange={(newValue) => validarValorInputDias(Item, newValue)}
                                                readOnly={IsViewMode}
                                            />
                                        )}
                                    </td>
                                </>
                            )}

                            <td className="bg-gray">{arredondar(Item.PRESENTEFISICO,2)}</td>

                            {MostraColunasAcumulado && (
                                <>
                                    <td className="ItemAcumuladoAtualFisico">{arredondar(Item.ACUMULADOFISICOATUAL,2)}</td>
                                    {Item.ACUMULADOFINANCEIROPREENCHIDO && (<td>
                                        <MoneySpan value={Item.ACUMULADOFINANCEIROANT} className="ItemAcumuladoAnteriorFinanceiro" />
                                    </td>)}
                                    {!Item.ACUMULADOFINANCEIROPREENCHIDO> 0 && (<td>
                                        <MoneyInput
                                            value={Item.ACUMULADOFINANCEIROANT}
                                            size={"100%"}
                                            className="form-control"
                                            onChange={(newValue) => onChangeItem(Item.NSEQ, "ACUMULADOFINANCEIROANT", newValue)}
                                            readOnly={IsViewMode}
                                        />
                                    </td>)}
                                </>
                            )}

                            <td className="valorTotalItem bg-gray">
                                <MoneySpan value={Item.PRESENTEFINANCEIRO} className="ItemPresenteFinanceiro" />
                            </td>

                            {MostraColunasAcumulado && (
                                <td>
                                    <MoneySpan value={arredondar(Item.ACUMULADOFINANCEIROATUAL, 2)} className="ItemAcumuladoAtualFinanceiro" />
                                </td>
                            )}
                            {contemItemExclusao && (<td>
                                {Item.PERMITEEXCLUSAO && <i className={"flaticon flaticon-trash icon-md"} onClick={() => onRemoverItem(Item.ID)}></i>}
                            </td>)}
                        </tr>)
                    })}
                </tbody>
                <tfoot>
                    <tr>
                        <th colSpan={6}></th>
                        <th colSpan={2} className="bg-gray">VALOR BRUTO MEDIÇÂO</th>
                        <th colSpan={1} className="bg-gray"><MoneySpan value={Medicao.ACUMULADOANTERIOR}></MoneySpan></th>
                        <th colSpan={1} className="bg-gray"><MoneySpan value={Medicao.PRESENTEMEDICAO}></MoneySpan></th>
                        <th colSpan={1} className="bg-gray"><MoneySpan value={Medicao.ACUMULADOATUAL}></MoneySpan></th>
                        {contemItemExclusao && (<th className="bg-gray"></th>)}
                    </tr>
                    <tr>
                        <th colSpan={6}
                        rowSpan={
                            Medicao.POSSUIRETENCAO && Medicao.POSSUIREIDI ? 6 :
                                (Medicao.POSSUIRETENCAO ? 5 :
                                    (Medicao.POSSUIREIDI ? 4 : 3)
                                )
                        }>
                            <span>VALOR LIQUIDO DA MEDIÇÃO</span>
                            <br/>
                        {!Medicao.POSSUIRETENCAO && (
                            <span>{numeroPorExtenso(Number(Medicao.PRESENTEMEDICAO) - Number(Medicao.DESCONTOATUAL))}</span>
                        )}
                        
                        {Medicao.POSSUIRETENCAO && (
                            <span>{numeroPorExtenso(Number(Medicao.PRESENTEMEDICAO) - Number(Medicao.DESCONTOATUAL) - Medicao.RETENCAOATUAL - Medicao.REIDIATUAL)}</span>
                        )}
                        </th>
                        <th colSpan={2} className="bg-gray">DESCONTOS
                            <button className="btn" onClick={() => openModalDesconto()}>
                                <i className="text-info flaticon flaticon-search icon-md" aria-hidden="true"></i>
                            </button>
                        </th>
                        <th className="bg-gray">
                            {Medicao.primeiraMedicao && (
                                <MoneyInput
                                    value={Medicao.DESCONTOANTERIOR}
                                    onChange={(newValue) => onChangePropMedicao("DESCONTOANTERIOR", newValue)}>
                                </MoneyInput>
                            )}
                            {!Medicao.primeiraMedicao && (
                                <MoneySpan value={Medicao.DESCONTOANTERIOR}></MoneySpan>
                            )}
                        </th>
                        <th className="bg-gray">
                            <MoneySpan value={Medicao.DESCONTOATUAL}></MoneySpan>
                        </th>
                        <th className="bg-gray"><MoneySpan value={Number(Medicao.DESCONTOANTERIOR) + Number(Medicao.DESCONTOATUAL)}></MoneySpan></th>
                        {contemItemExclusao && (<th className="bg-gray"></th>)}
                    </tr>
                    <tr>
                        <th colSpan={2} className="bg-gray">DESCONTOS EXTRA</th>
                        <th className="bg-gray">
                            <MoneySpan value={Number(Medicao.ACUMULADOVALORDESCONTOEXTRA)}></MoneySpan>
                        </th>
                        <th className="bg-gray">
                            <MoneyInput
                                    value={Medicao.VALORDESCONTOEXTRA}
                                    onChange={(newValue) => onChangePropMedicao("VALORDESCONTOEXTRA", newValue)}>
                            </MoneyInput>
                        </th>
                        <th className="bg-gray">
                        <MoneySpan value={Number(Medicao.ACUMULADOVALORDESCONTOEXTRA) + Number(Medicao.VALORDESCONTOEXTRA)}></MoneySpan>
                        </th>
                    </tr>
                    {Medicao.POSSUIRETENCAO && (<tr>
                        <th colSpan={2} className="bg-gray">TOTAL LIQUIDO</th>
                        <th className="bg-gray">
                            <MoneySpan value={Number(Medicao.ACUMULADOANTERIOR) - Number(Medicao.DESCONTOANTERIOR) - Number(Medicao.ACUMULADOVALORDESCONTOEXTRA)}></MoneySpan>
                        </th>
                        <th className="bg-gray">
                            <MoneySpan value={Number(Medicao.PRESENTEMEDICAO) - Number(Medicao.DESCONTOATUAL) - Number(Medicao.VALORDESCONTOEXTRA)}></MoneySpan>
                        </th>
                        <th className="bg-gray">
                            <MoneySpan value={Number(Medicao.ACUMULADOATUAL) - (Number(Medicao.DESCONTOANTERIOR) + Number(Medicao.DESCONTOATUAL) + Number(Medicao.ACUMULADOVALORDESCONTOEXTRA) +Number(Medicao.VALORDESCONTOEXTRA))}></MoneySpan>
                        </th>
                        {contemItemExclusao && (<th className="bg-gray"></th>)}
                    </tr>)}
                    {Medicao.POSSUIRETENCAO && (<tr>
                        <th colSpan={2} className="bg-gray">RETENÇÃO</th>
                        <th className="bg-gray">
                            {Medicao.primeiraMedicao && (
                                <MoneyInput
                                    value={Medicao.RETENCAOANTERIOR}
                                    onChange={(newValue) => onChangePropMedicao("RETENCAOANTERIOR", newValue)}>
                                </MoneyInput>
                            )}
                            {!Medicao.primeiraMedicao && (
                                <MoneySpan value={
                                    Number(Medicao.RETENCAOANTERIOR ?? 0)
                                }></MoneySpan>
                            )}
                        </th>
                        <th className="bg-gray">
                            <MoneySpan value={Medicao.RETENCAOATUAL}></MoneySpan>
                        </th>
                        <th className="bg-gray">
                            <MoneySpan value={Number(Medicao.RETENCAOANTERIOR) + Number(Medicao.RETENCAOATUAL)}></MoneySpan>
                        </th>
                        {contemItemExclusao && (<th className="bg-gray"></th>)}
                    </tr>)}
                    {Medicao.POSSUIREIDI && (<tr>
                        <th colSpan={2} className="bg-gray">REIDI ({(Medicao.TAXAREIDI != "" && Medicao.TAXAREIDI) ? Medicao.TAXAREIDI : "0"}%)</th>
                        {Medicao.primeiraMedicao && (
                                <MoneyInput
                                    value={Medicao.REIDIANTERIOR}
                                    onChange={(newValue) => onChangePropMedicao("REIDIANTERIOR", newValue)}>
                                </MoneyInput>
                            )}
                            {!Medicao.primeiraMedicao && (
                                <th className="bg-gray">
                                    <MoneySpan
                                        value={Medicao.REIDIANTERIOR}
                                    ></MoneySpan>
                                </th>
                            )}
                        <th className="bg-gray">
                            <MoneySpan
                                value={Medicao.REIDIATUAL}
                            ></MoneySpan>
                        </th>
                        <th className="bg-gray">
                            <MoneySpan value={Number(Medicao.REIDIANTERIOR) + Number(Medicao.REIDIATUAL)}></MoneySpan>
                        </th>
                        {contemItemExclusao && (<th className="bg-gray"></th>)}
                    </tr>)}
                    <tr>
                        <th colSpan={2} className="bg-gray">VALOR NOTA FISCAL</th>
                        <th className="bg-gray">
                            <MoneySpan value={
                                    Number(
                                        Number(Medicao.ACUMULADOANTERIOR)
                                        - Number(Medicao.DESCONTOANTERIOR)
                                        - Number(Medicao.ACUMULADOVALORDESCONTOEXTRA)
                                        - (Medicao.POSSUIRETENCAO ? Number(Medicao.RETENCAOANTERIOR) : 0)
                                        - (Medicao.POSSUIREIDI ? Number(Medicao.REIDIANTERIOR) : 0)
                                    )
                                }
                            ></MoneySpan>
                        </th>
                        <th className="bg-gray">
                            <MoneySpan
                                value={
                                    Number(
                                        Number(Medicao.PRESENTEMEDICAO)
                                        - Number(Medicao.DESCONTOATUAL)
                                        - Number(Medicao.VALORDESCONTOEXTRA)
                                        - (Medicao.POSSUIRETENCAO ? Number(Medicao.RETENCAOATUAL) : 0)
                                        - (Medicao.POSSUIREIDI ? Number(Medicao.REIDIATUAL) : 0)
                                    )
                                }
                            ></MoneySpan>
                        </th>
                        <th className="bg-gray">
                            <MoneySpan
                            value={
                                Number(
                                    Number(Medicao.ACUMULADOATUAL)
                                    - (Number(Medicao.DESCONTOANTERIOR)
                                        + Number(Medicao.DESCONTOATUAL)
                                    -( Number(Medicao.ACUMULADOVALORDESCONTOEXTRA)+ Number(Medicao.VALORDESCONTOEXTRA))
                                    )
                                    - (Medicao.POSSUIRETENCAO ? (Number(Medicao.RETENCAOANTERIOR) + Number(Medicao.RETENCAOATUAL)) : 0)
                                    - (Medicao.POSSUIREIDI ? (Number(Medicao.REIDIANTERIOR) + Number(Medicao.REIDIATUAL)) : 0)
                                )
                            }
                        ></MoneySpan>
                        </th>
                        {contemItemExclusao && (<th className="bg-gray"></th>)}
                    </tr>
                    {Medicao.TOTALDIASMEDICAO > 0 && (
                        <tr>
                            <td colSpan={12}><span className="text-info text-left">*Valor mÁximo para mediÇÃo de item com unidade MÊS ou DIA corresponde ao total de dias da medição.</span></td>
                        </tr>
                    )}
                </tfoot>
            </table>
        </>
    );
}
