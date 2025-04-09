const useState = React.useState;
const useEffect = React.useEffect;


function FormularioNovoItem({
    Medicao,
    onChangeMedicao
}
){
    const [tipoInclusao, setTipoInclusao] = useState("EQUIPAMENTO")

    const [NovoItem, setNovoItem] = useState({
        prefixo: "",
        equipamento: "",
        unidade: "",
        marca: "",
        modelo: "",
        ano: "",
        placa: "",
        valor: "",
        chassi: "",
        valorEquipamento: ""
    });

    function limparFormulario(){
        setNovoItem({
            prefixo: "",
            equipamento: "",
            unidade: "",
            marca: "",
            modelo: "",
            ano: "",
            placa: "",
            valor: "",
            chassi: "",
            valorEquipamento: ""
        });
    }

    function handleChange(campo, valor) {
        if(campo == "ano"){
            valor = valor.replace(/\D/g, '');
            if (valor > 2100){
                valor = moment().format('YYYY');
            }
        } else if (campo == "placa"){
            valor = valor.replace(/[^a-zA-Z0-9]/g, '');
        }

        if(campo == "prefixo"){
            valor = valor.trim();
            if (valor.length > 8){
                return
            }
        }
        var novoItemTemp = {...NovoItem};
        novoItemTemp[campo] = valor;
        setNovoItem(novoItemTemp);
    };

    function validarData(valor){
        if (valor < 1900 || valor > 2100){
            valor = moment().format('YYYY');
            var novoItemTemp = {...NovoItem};
            novoItemTemp.ano = valor;
            setNovoItem(novoItemTemp);
        }
    }

    function adicionarItem(){
        let validacao = validarFormularioItem();
        if (validacao){
            var medicaoTemp = { ...Medicao };
            incluirItem(medicaoTemp)
        }
    }

    function validarFormularioItem(){
        if (tipoInclusao == "EQUIPAMENTO"){
            if(!NovoItem.prefixo || NovoItem.prefixo == ""){
                FLUIGC.toast({
                    title: "Prefixo n�o informado",
                    message: "",
                    type: "warning"
                });
                focarCampo("novoItemPrefixo");
                return false;
            } else if(!NovoItem.valorEquipamento || NovoItem.valorEquipamento == ""){
                FLUIGC.toast({
                    title: "Valor n�o informado",
                    message: "",
                    type: "warning"
                });
                focarCampo("novoItemValorEquipamento");
                return false;
            } else if((!NovoItem.valorExtra || NovoItem.valorExtra == "") && NovoItem.extra){
                FLUIGC.toast({
                    title: "Valor da hora extra n�o informado",
                    message: "",
                    type: "warning"
                });
                focarCampo("novoItemValorExtra");
                return false;
            } else if(!NovoItem.marca || NovoItem.marca == ""){
                FLUIGC.toast({
                    title: "Marca n�o informada",
                    message: "",
                    type: "warning"
                });
                focarCampo("novoItemMarca");
                return false;
            } else if(!NovoItem.modelo || NovoItem.modelo == ""){
                FLUIGC.toast({
                    title: "Modelo n�o informado",
                    message: "",
                    type: "warning"
                });
                focarCampo("novoItemModelo");
                return false;
            } else if(!NovoItem.ano || NovoItem.ano == ""){
                FLUIGC.toast({
                    title: "Ano n�o informado",
                    message: "",
                    type: "warning"
                });
                focarCampo("novoItemAno");
                return false;
            } else if(!NovoItem.chassi || NovoItem.chassi == ""){
                FLUIGC.toast({
                    title: "Chassi n�o informado",
                    message: "",
                    type: "warning"
                });
                focarCampo("novoItemChassi");
                return false;
            } else if(!NovoItem.placa || NovoItem.placa == ""){
                FLUIGC.toast({
                    title: "Placa ou s�rie n�o informado",
                    message: "",
                    type: "warning"
                });
                focarCampo("novoItemSerie");
                return false;
            }
        }

        if (!NovoItem.equipamento || NovoItem.equipamento == ""){
            if (tipoInclusao == "OUTROS"){
                FLUIGC.toast({
                    title: "Item sem descri��o",
                    message: "",
                    type: "warning"
                });
                focarCampo("novoItemDescricao");
            } else {
                FLUIGC.toast({
                    title: "Equipamento n�o informado",
                    message: "",
                    type: "warning"
                });
                focarCampo("novoItemEquipamento");
            }
            return false;
        } else if(!NovoItem.unidade || NovoItem.unidade == ""){
            FLUIGC.toast({
                title: "Unidade n�o informada",
                message: "",
                type: "warning"
            });
            focarCampo("novoItemselectUnidade");
            return false;
        } else if(!NovoItem.valor || NovoItem.valor == ""){
            FLUIGC.toast({
                title: "Valor n�o informado",
                message: "",
                type: "warning"
            });
            focarCampo("novoItemValor");
            return false;
        } else {
            return true;
        }
    }

    async function incluirItem(medicaoTemp){
        if (Medicao.Itens.filter(a => a.PREFIXO.includes(NovoItem.prefixo) && !a.EXTRA).length > 0 && tipoInclusao == "EQUIPAMENTO"){
            FLUIGC.toast({
                title: "Prefixo j� adicionado como equipamento. Pode ser adicionado como EXTRA!",
                message: "",
                type: "warning"
            });
            return;
        }

        let descricaoItem = `${NovoItem.equipamento}, MARCA: ${NovoItem.marca}, Modelo: ${NovoItem.modelo}, ANO: ${NovoItem.ano}, PLACA: ${NovoItem.placa}, PREFIXO: ${NovoItem.prefixo}`;

        if (Medicao.Itens.filter(a => a.DESCRICAO.includes(descricaoItem)).length > 0){
            FLUIGC.toast({
                title: "J� existe um item cadastrado com estes dados na medi��o",
                message: "",
                type: "warning"
            });
            return;
        }

        if (tipoInclusao == "OUTROS"){
            try{
                incluirExtra(medicaoTemp);
        
                limparFormulario();
                onChangeMedicao(medicaoTemp);
            } catch (error) {
                console.error(error);
            }
        } else {
            var numeroSequencia = medicaoTemp.Itens.length + 1;
            medicaoTemp.Itens.push({
                ID: Number(Number(medicaoTemp.Itens[medicaoTemp.Itens.length - 1]?.ID ?? 0) + 1),
                NSEQ: numeroSequencia,
                DESCRICAO: descricaoItem,
                DESCRICAOEQUIPAMENTO: NovoItem.equipamento,
                CODUNIDADE:"",
                VALORUNITARIO: Number(NovoItem.valor),
                QUANTIDADE:"",
                UNIDADE: NovoItem.unidade,
                UNIDADEPREENCHIDA: NovoItem.UNIDADE != "" ? true : false,
                DIASTRABALHADOS:"0",
                ACUMULADOFINANCEIROANT: "0.00", 
                ACUMULADOFINANCEIROATUAL: 0,
                ACUMULADOFISICOANT: 0,
                ACUMULADOFISICOATUAL: 0,
                ACUMULADOFINANCEIROPREENCHIDO: false,
                ACUMULADOFISICOPREENCHIDO:  false,
                PRESENTEFISICO: 0,
                PRESENTEFINANCEIRO: 0,
                HORASTRAB:"",
                PermiteExcluir:"",
                Ativo:"",
                HORAMINIMA:"",
                VALORFISICO: 0,
                VALORFINANCEIRO: 0,
                PERMITEEXCLUSAO: true,
                NOVOITEM: true,
                PREFIXO: NovoItem.prefixo,
                EQUIPAMENTO: NovoItem.equipamento,
                UNIDADE: NovoItem.unidade,
                MARCA: NovoItem.marca,
                MODELO: NovoItem.modelo,
                ANO: NovoItem.ano,
                PLACA: NovoItem.placa,
                CHASSI: NovoItem.chassi,
                VALOR: Number(NovoItem.valor),
                VALOREQUIPAMENTO: Number(NovoItem.valorEquipamento),
                FORNECEDOR: medicaoTemp.fornecedor.NOMEFANTASIA,
                CPFCNPJ: medicaoTemp.fornecedor.CGCCFO,
                FABRICANTE: NovoItem.marca,
                EXTRA: 0
            });
    
            if (NovoItem.extra){
                incluirExtra(medicaoTemp);
            }

            limparFormulario();
            medicaoTemp.atualizadoDescontoSisma = true;
            onChangeMedicao(medicaoTemp);
        }
    }

    function incluirExtra(medicaoTemp){
        let descricaoItem = `${NovoItem.prefixo}${NovoItem.prefixo ? " - ":""}${NovoItem.equipamento}`;
        
        if (NovoItem.extra && tipoInclusao != "OUTROS") {
            descricaoItem = `${NovoItem.prefixo} - HORAS EXTRAS`;
        }

        if (Medicao.Itens.filter(a => a.DESCRICAO.includes(descricaoItem)).length > 0){
            FLUIGC.toast({
                title: "N�o foi possivel incluir. J� existe um item cadastrado com estes dados na medi��o!",
                message: "",
                type: "warning"
            });
            throw "Erro -- Descri��o j� existente";
        }

        var numeroSequencia = medicaoTemp.Itens.length + 1;
        medicaoTemp.Itens.push({
            ID: Number(Number(medicaoTemp.Itens[medicaoTemp.Itens.length - 1]?.ID ?? 0) + 1),
            NSEQ: numeroSequencia,
            DESCRICAO: descricaoItem,
            DESCRICAOEQUIPAMENTO: NovoItem.equipamento,
            CODUNIDADE:"",
            QUANTIDADE:"",
            UNIDADEPREENCHIDA: true,
            DIASTRABALHADOS:"0",
            ACUMULADOFINANCEIROANT: "0.00", 
            ACUMULADOFINANCEIROATUAL: 0,
            ACUMULADOFISICOANT: 0,
            ACUMULADOFISICOATUAL: 0,
            ACUMULADOFINANCEIROPREENCHIDO: false,
            ACUMULADOFISICOPREENCHIDO:  false,
            PRESENTEFISICO: 0,
            PRESENTEFINANCEIRO: 0,
            HORASTRAB:"",
            PermiteExcluir:"",
            Ativo:"",
            HORAMINIMA:"",
            VALORFISICO: 0,
            VALORFINANCEIRO: 0,
            PERMITEEXCLUSAO: true,
            NOVOITEM: true,
            PREFIXO: NovoItem.prefixo,
            EQUIPAMENTO: NovoItem.equipamento,
            UNIDADE: tipoInclusao == "OUTROS" ? NovoItem.unidade :'HORA',
            MARCA: NovoItem.marca,
            MODELO: NovoItem.modelo,
            ANO: NovoItem.ano > 0 ? NovoItem.ano : 0,
            PLACA: NovoItem.placa,
            CHASSI: NovoItem.chassi,
            VALOR: Number(tipoInclusao == "OUTROS" ? NovoItem.valor : NovoItem.valorExtra),
            VALORUNITARIO: Number(tipoInclusao == "OUTROS" ? NovoItem.valor : NovoItem.valorExtra),
            VALOREQUIPAMENTO: Number(NovoItem.valorEquipamento),
            FORNECEDOR: medicaoTemp.fornecedor.NOMEFANTASIA,
            CPFCNPJ: medicaoTemp.fornecedor.CGCCFO,
            FABRICANTE: NovoItem.marca,
            EXTRA: 1
        });
    }

    function focarCampo(idDoCampo) {
        var campo = document.getElementById(idDoCampo);
        if (campo) {
            campo.focus();
        } else {
            console.error("Campo n�o encontrado com o ID:", idDoCampo);
        }
    }

    function handleChangeTipoInclusao(value){
        setTipoInclusao(value);
        limparFormulario();
    }

    return (
        <div className={"panel panel-primary"}>
            <div className={"panel-heading"}>
                <h3 className={"panel-title"}>Inserção Novo Item</h3>
            </div>
            <div className={"panel-body"}>
                <div className="row">
                    <div className={"form-group col-md-4 col-lg-4"}>
                        <label htmlFor={"novoItemselTipoInclusao"}>Tipo Inclusão</label>
                        <select 
                            id={"novoItemselTipoInclusao"}
                            name={"novoItemselectUnidade"}
                            className={"form-control"}
                            style={{ textAlign: "center", display: "inline" }} 
                            value={tipoInclusao} 
                            onChange={(e) => handleChangeTipoInclusao(e.target.value)}>
                                <option value="EQUIPAMENTO">Equipamento</option>
                                <option value="OUTROS">Outros</option>
                            </select>
                    </div>
                </div>
                {tipoInclusao == "EQUIPAMENTO" && (
                    <div>
                        <div className="row">
                            <div className={"form-group col-md-3 col-lg-3 no-horizontal-padding"}>
                                <div className={"form-group col-md-7 col-lg-7"}>
                                    <label htmlFor={"novoItemPrefixo"}>Prefixo</label>
                                    <input 
                                        id={"novoItemPrefixo"}
                                        maxLength="8"
                                        name={"novoItemPrefixo"}
                                        className={"form-control"}
                                        type={"text"}
                                        value={NovoItem.prefixo}
                                        onChange={(e) => handleChange("prefixo",e.target.value)}
                                    />
                                </div>
                                <div className={"form-group col-md-5 col-lg-5 "}>
                                    <b>H. Extra</b>
                                    <br/>
                                    <div className="switch switch-primary">
                                        <input 
                                            className="switch-input" 
                                            type="checkbox" 
                                            id="novoItemExtra" 
                                            checked={NovoItem.extra}
                                            onChange={() => handleChange("extra",!NovoItem.extra)}/>
                                        <label className="switch-button" htmlFor="novoItemExtra">Extra</label>
                                    </div>
                                </div>
                            </div>
                            <div className={"form-group col-md-3 col-lg-3"}>
                                <label htmlFor={"novoItemEquipamento"}>Equipamento</label>
                                <input
                                    id={"novoItemEquipamento"} 
                                    name={"novoItemEquipamento"} 
                                    maxLength="255"
                                    className={"form-control"}
                                    type={"text"}
                                    value={NovoItem.equipamento}
                                    onChange={(e) => handleChange("equipamento",e.target.value)}
                                />
                            </div>
                            <div className={"form-group col-md-2 col-lg-2"}>
                                <label htmlFor={"novoItemselectUnidade"}>Unidade</label>
                                <select 
                                    id={"novoItemselectUnidade"}
                                    name={"novoItemselectUnidade"}
                                    className={"form-control"}
                                    style={{ textAlign: "center", display: "inline" }} 
                                    value={NovoItem.unidade} 
                                    onChange={(e) => handleChange("unidade",e.target.value)}>
                                        <option value=""></option>
                                        <option value="M�S">M�S</option>
                                        <option value="DIA">DIA</option>
                                        <option value="HORA">HORA</option>
                                        <option value="M">M</option>
                                        <option value="M�">M�</option>
                                        <option value="M�">M�</option>
                                        <option value="KM">KM</option>
                                        <option value="UN">UN</option>
                                        <option value="TONELADA">TONELADA</option>
                                        <option value="VB">VB</option>
                                <option value="KMXTON">KM x Ton</option>
                                    </select>
                            </div>
                            <div className={"form-group col-md-2 col-lg-2"}>
                                <label htmlFor={"novoItemMarca"}>Marca</label>
                                <input 
                                    id={"novoItemMarca"}
                                    name={"novoItemMarca"}
                                    maxLength="255"
                                    className={"form-control"}
                                    type={"text"}
                                    value={NovoItem.marca}
                                    onChange={(e) => handleChange("marca",e.target.value)}
                                />
                            </div>
                            <div className={"form-group col-md-2 col-lg-2"}>
                                <label htmlFor={"novoItemModelo"}>Modelo</label>
                                <input 
                                    id={"novoItemModelo"}
                                    name={"novoItemModelo"}
                                    maxLength="255"
                                    className={"form-control"}
                                    type={"text"}
                                    value={NovoItem.modelo}
                                    onChange={(e) => handleChange("modelo",e.target.value)}
                                />
                            </div>
                        </div>

                        <div className={"row"}>
                            <div className={"form-group col-md-2 col-lg-2"}>
                                <label htmlFor={"novoItemAno"}>Ano</label>
                                <input 
                                    min="1900"
                                    max="2100"
                                    id={"novoItemAno"}
                                    name={"novoItemAno"}
                                    className={"form-control"}
                                    type={"text"}
                                    value={NovoItem.ano}
                                    onChange={(e) => handleChange("ano",e.target.value)}
                                    onBlur={(e) => validarData(e.target.value)}
                                />
                            </div>
                            <div className={"form-group col-md-2 col-lg-2"}>
                                <label htmlFor={"novoItemSerie"}>Chassi</label>
                                <input 
                                    id={"novoItemChassi"}
                                    name={"novoItemChassi"}
                                    maxLength="50"
                                    className={"form-control"}
                                    type={"text"}
                                    value={NovoItem.chassi}
                                    onChange={(e) => handleChange("chassi",e.target.value)}
                                />
                            </div>
                            <div className={"form-group col-md-2 col-lg-2"}>
                                <label htmlFor={"novoItemSerie"}>Placa/Serie</label>
                                <input 
                                    id={"novoItemSerie"}
                                    name={"novoItemSerie"}
                                    maxLength="30"
                                    className={"form-control"}
                                    type={"text"}
                                    value={NovoItem.placa}
                                    onChange={(e) => handleChange("placa",e.target.value)}
                                />
                            </div>
                            <div className={"form-group col-md-2 col-lg-2"}>
                                <label htmlFor={"novoItemValorEquipamento"}>Valor Equipamento</label>
                                <NumberInput 
                                    id={"novoItemValorEquipamento"}
                                    name={"novoItemValorEquipamento"}
                                    className={"form-control"}
                                    type={"text"}
                                    value={NovoItem.valorEquipamento}
                                    onChange={(value) => handleChange("valorEquipamento", value)}
                                />
                            </div>
                            <div className={"form-group col-md-2 col-lg-2"}>
                                <label htmlFor={"novoItemValor"}>Valor Loca��o</label>
                                <NumberInput 
                                    id={"novoItemValor"}
                                    name={"novoItemValor"}
                                    className={"form-control"}
                                    type={"text"}
                                    value={NovoItem.valor}
                                    onChange={(value) => handleChange("valor", value)}
                                />
                            </div>
                            {NovoItem.extra && (
                                <div className={"form-group col-md-2 col-lg-2"}>
                                    <label htmlFor={"novoItemValorExtra"}>Valor H. Extra</label>
                                    <NumberInput 
                                        id={"novoItemValorExtra"}
                                        name={"novoItemValorExtra"}
                                        className={"form-control"}
                                        type={"text"}
                                        value={NovoItem.valorExtra}
                                        onChange={(value) => handleChange("valorExtra", value)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )} 

                {tipoInclusao == "OUTROS" && (
                    <div>
                        <div className={"form-group col-md-2 col-lg-2 no-horizontal-padding"}>
                            <div className={"form-group"}>
                                <label htmlFor={"novoItemPrefixo"}>Prefixo</label>
                                <input 
                                    id={"novoItemPrefixo"}
                                    name={"novoItemPrefixo"}
                                    className={"form-control"}
                                    type={"text"}
                                    value={NovoItem.prefixo}
                                    onChange={(e) => handleChange("prefixo",e.target.value)}
                                />
                                <span className="text-info">*N�o obrigat�rio</span>
                            </div>
                        </div>
                        <div className={"form-group col-md-3 col-lg-3"}>
                            <label htmlFor={"novoItemEquipamento"}>Descricao</label>
                            <input
                                id={"novoItemDescricao"} 
                                name={"novoItemDescricao"} 
                                className={"form-control"}
                                type={"text"}
                                value={NovoItem.equipamento}
                                onChange={(e) => handleChange("equipamento",e.target.value)}
                            />
                        </div>
                        <div className={"form-group col-md-2 col-lg-2"}>
                            <label htmlFor={"novoItemselectUnidade"}>Unidade</label>
                            <select 
                                id={"novoItemselectUnidade"}
                                name={"novoItemselectUnidade"}
                                className={"form-control"}
                                style={{ textAlign: "center", display: "inline" }} 
                                value={NovoItem.unidade} 
                                onChange={(e) => handleChange("unidade",e.target.value)}>
                                <option value=""></option>
                                <option value="M�S">M�S</option>
                                <option value="DIA">DIA</option>
                                <option value="HORA">HORA</option>
                                <option value="M">M</option>
                                <option value="M�">M�</option>
                                <option value="M�">M�</option>
                                <option value="UN">UN</option>
                                <option value="TONELADA">TONELADA</option>
                                <option value="VB">VB</option>
                                <option value="KMXTON">KM x Ton</option>
                            </select>
                        </div>
                        <div className={"form-group col-md-2 col-lg-2"}>
                            <label htmlFor={"novoItemValor"}>Valor Loca��o</label>
                            <NumberInput 
                                id={"novoItemValor"}
                                name={"novoItemValor"}
                                className={"form-control"}
                                type={"text"}
                                value={NovoItem.valor}
                                onChange={(value) => handleChange("valor", value)}
                            />
                        </div>
                    </div>
                )}

                <div className="row">
                    <div className={"form-group col-md-2 col-lg-2 col-md-offset-10"}>
                        <br />
                        <button 
                            id={"btnAdicionar"}
                            name={"btnAdicionar"}
                            className={"btn btn-primary"}
                            onClick={() => adicionarItem()}
                        ><i className={"flaticon flaticon-add-plus icon-md"}></i> Adicionar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
