const useState = React.useState;
const useEffect = React.useEffect;


function ModalDescontos({
    Medicao,
    onCloseModal,
    isModalDescontoOpen
}){
    return (
        <div>
            <Modal classeModal="modal-descontos" isOpen={isModalDescontoOpen} onClose={() => onCloseModal()}>
                <div className="table-container">
                    <table className={'table fixed-table table-striped table-hover'}>
                        <thead>
                            <tr>
                                <th>Prefixo</th>
                                <th>Desc. Item</th>
                                <th>Fornecedor</th>
                                <th>Data</th>
                                <th>OS</th>
                                <th>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Medicao.descontosSismaFiltrados.map((Item, index) => { 
                                const anterior = index > 0 ? Medicao.descontosSismaFiltrados[index - 1] : null;
                                const condicaoTotal = anterior && !(Item.dt_ano == anterior.dt_ano && Item.dt_mes == anterior.dt_mes);
                                const condicaoUltimo = (index + 1) == Medicao.descontosSismaFiltrados.length;
     
                                return (
                                    <React.Fragment key={index}>
                                        {condicaoTotal && (
                                            <tr key={`total-${index}`}>
                                                <td colSpan="4" style={{textAlign: "end", fontWeight: "bolder"}}>
                                                    Total Mês: {
                                                        moment().month(anterior.dt_mes - 1).format('MMMM')
                                                    } de {anterior.dt_ano}
                                                </td>
                                                <td colSpan="2" style={{textAlign: "end", fontWeight: "bolder"}}>
                                                    <MoneySpan
                                                        value={Medicao.descontosSismaFiltrados
                                                            .filter(a => 
                                                                a.dt_ano == anterior.dt_ano &&
                                                                a.dt_mes == anterior.dt_mes)
                                                            .reduce((accum,cur) => accum + Number(cur.vlr_total),0)
                                                        }>
                                                    </MoneySpan>
                                                </td>
                                            </tr>
                                        )}
                                        <tr key={`item-${index}`} className="rowItem">
                                            <td>{Item.num_equipamento}</td>
                                            <td>{Item.des_material}</td>
                                            <td>{Item.des_fornecedor}</td>
                                            <td>{FormataData(Item.dt_ordem)}</td>
                                            <td>{Item.num_OS}</td>
                                            <td>
                                                <MoneySpan value={Item.vlr_total}></MoneySpan>
                                            </td>
                                        </tr>
                                        {condicaoUltimo && (
                                            <tr key={`total-utlimo-${index}`}>
                                                <td colSpan="4" style={{textAlign: "end", fontWeight: "bolder"}}>
                                                    Total Mês: {
                                                        moment().month(Item.dt_mes - 1).format('MMMM')
                                                    } de {Item.dt_ano}
                                                </td>
                                                <td colSpan="2" style={{textAlign: "end", fontWeight: "bolder"}}>
                                                    <MoneySpan
                                                        value={Medicao.descontosSismaFiltrados
                                                            .filter(a => 
                                                                a.dt_ano == Item.dt_ano &&
                                                                a.dt_mes == Item.dt_mes)
                                                            .reduce((accum,cur) => accum + Number(cur.vlr_total),0)
                                                        }>
                                                    </MoneySpan>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="4"></td>
                                <td style={{textAlign: "end", fontWeight: "bolder"}}>Total:</td>
                                <td style={{textAlign: "end", fontWeight: "bolder"}}>
                                    <MoneySpan
                                        value={Medicao.descontosSismaFiltrados
                                            .reduce((accum,cur) => accum + Number(cur.vlr_total), 0)}
                                    ></MoneySpan>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </Modal>
        </div>
    );
}
