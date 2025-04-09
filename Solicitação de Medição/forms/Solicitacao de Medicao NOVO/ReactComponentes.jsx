const useState = React.useState;
const useEffect = React.useEffect;

var DataTableContratos = null;

function AppRoot() {
    const [Atividade, setAtividade] = useState($("#atividade").val());

    return <ErrorBoundary>{Atividade == 0 && <AtividadeInicio />}</ErrorBoundary>;
}

function AtividadeInicio() {
    const atividadesAprovacao = [5,30,37,40,26,22];

    const [CCUSTO, setCCUSTO] = useState({
        COLIGADA: "",
        CODCCUSTO: "",
        NOME: "",
    });
    const [Fornecedor, setFornecedor] = useState({
        CODCFO: "",
        CGCCFO: "",
        NOMEFANTASIA: "",
    });
    const [Contrato, setContrato] = useState({});
    const [medicaoEditarID, setMedicaoEditarID] = useState();

    function onChangeContrato(e){
        setContrato(e);
    }

    function novaMedicao(){
        let dados = obterInformacoesContrato();
        if (!atividadesAprovacao.includes(dados.atividade)){
            setCCUSTO(dados.ccusto);
            setContrato(dados.contrato);
            setFornecedor(dados.fornecedor);
            setTimeout(() => {
            var botaoNovaMedicao = document.getElementById("bntNovaMedicao");
            botaoNovaMedicao.click();
        }, 200);
        }
    }

    function editarMedicao(){
        let dados = obterInformacoesContrato();
        if (!atividadesAprovacao.includes(dados.atividade)){
            setCCUSTO(dados.ccusto);
            setContrato(dados.contrato);
            setFornecedor(dados.fornecedor);
            setMedicaoEditarID(dados.medicaoEditarID);
            setTimeout(() => {
            var botaoEditarMedicao = document.getElementById("btnEditarMedicao");
            botaoEditarMedicao.click();
        }, 200);
        }
    }

    return (
        <div>
            <button hidden={true} name="btnSolicitarNovaMedicao" id="btnSolicitarNovaMedicao" className={"btn btn-primary"} onClick={() => novaMedicao()}></button>
            <button hidden={true} name="btnSolicitarEdicaoMedicao" id="btnSolicitarEdicaoMedicao" className={"btn btn-primary"} onClick={() => editarMedicao()}></button>
            {Contrato.IDCNT && <InicioMedicao onChangeContrato={onChangeContrato} Contrato={Contrato} CCUSTO={CCUSTO} Fornecedor={Fornecedor} medicaoEditarID={medicaoEditarID}/>}
        </div>
    );
}
