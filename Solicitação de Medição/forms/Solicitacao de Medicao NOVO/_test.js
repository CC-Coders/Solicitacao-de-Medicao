jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

// Script Automatizado
async function init() {
    return new Promise((resolve, reject) => {
        // Dependency injection
        sessionStorage.clear();
        simulaInput($("#userCode")[0], "gabriel.persike");

        // Renderiza o AppRoot
        setTimeout(async () => {
        	   ReactDOM.render(React.createElement(AppRoot), document.getElementById("AppRoot"), async () => {
                   setTimeout(async () => {
                       resolve();
                   }, 800);
               });
        }, 400);
     
    });
}
async function SelecionaCCUSTOAndFornecedor() {
    return new Promise(async (resolve, reject) => {
        try {
            await SimulaSelect($("#SelectCCusto")[0], "1.2.021");
            await SimulaSelect($("#SelectFornecedor")[0], "15.618.785/0001-38");
            resolve();
        } catch (error) {
            console.error(error);
            reject()
        }
    });
}
function SimulaSelecaoDeContratoECriacaoDeMedicao(CODIGOCONTRATO, Medicoes) {
    return new Promise(async (resolve) => {
        try {

            SelecionaContrato(CODIGOCONTRATO);
            await SimulaUsuarioInserindoMedicoes(Medicoes);
            await SimulaClickEmBotao($("#btnSalvarMedicao"));

            resolve();
        } catch (error) {
            resolve();
        }
    });
}
function SimulaUsuarioInserindoMedicoes(Medicoes) {
    return new Promise(async (resolve) => {
        try {

            var i = 0;
            for (const Medicao of Medicoes) {
                if (i > 0) {
                    await SimulaClickEmBotao($("#btnNovaMedicao"));
                    await SimulaClickEmBotao($("#btnNextMedicao"));
                }

                await PreencheMedicao(Medicao.Itens);
                await LancaDescontosExtras(Medicao.Descontos);

                i++;
            }
            resolve();
        } catch (error) {
            resolve();
        }

    });
}

async function PreencheMedicao(itens) {
    while ($(".rowItem").length < itens.length) {
        await SimulaClickEmBotao($("#btnAdicionarItem"));
    }

    for (let i = 0; i < itens.length; i++) {
        const Item = itens[i];
        var ROW = $(".rowItem:eq(" + i + ")");

        if (Item.Ativo == false) {
            var InputAtivo = $(ROW).find(".checkboxItemAtivo");
            console.log($(InputAtivo).is(":checked"))
            if ($(InputAtivo).is(":checked")) {
                InputAtivo[0].click();
            }
        }
        else {
            var InputDescricao = $(ROW).find(".DESCRICAO");
            await simulaInput(InputDescricao[0], Item.DESCRICAO);

            var InputDescricao = $(ROW).find(".CODUND");
            await simulaInput(InputDescricao[0], Item.CODUND);

            var InputQuantidade = $(ROW).find(".quantidade");
            await simulaInput(InputQuantidade[0], Item.Quantidade);

            var InpurValorUnitario = $(ROW).find(".valorUnitario");
            await simulaInput(InpurValorUnitario[0], Item.ValorUnitario);
        }
    }

    await SimulaClickEmBotao($("#btnSalvarMedicao"));
}

async function LancaDescontosExtras(Descontos) {
    for (const Desconto of Descontos) {
        await SimulaClickEmBotao($("#btnAdicionarNovoDescontoExtra"));

        var row = $(".tableOutrosDescontos>tbody>tr:last");
        await simulaInput($(row).find(".DESCRICAO")[0], Desconto.DESCRICAO);
        await simulaInput($(row).find(".QUANTIDADE")[0], Desconto.QUANTIDADE);
        await simulaInput($(row).find(".VALOR_UNIT")[0], Desconto.VALOR_UNIT);
    }
}


// Testes
describe("Simulando Usuário inserindo Medições", () => {
    beforeAll((done) => {
        setTimeout(async () => {
            await init();
            await SelecionaCCUSTOAndFornecedor();
            done();
        }, 50);
    });

    describe("Verifica o 1º Contrato", () => {
        beforeAll((done) => {
            setTimeout(async () => {
                if ($("#ViewBoletimDeMedicao").length > 0) {
                    await SimulaClickEmBotao($(".btnVoltar")[0]);
                }

                setTimeout(async () => {
                    var Medicoes = [
                        {
                            Descontos: [
                                {
                                    "DESCRICAO": "Desconto por conta dos dias que o equipamento ficou parado",
                                    "VALOR_UNIT": "250,00",
                                    "QUANTIDADE": "4,00"
                                },
                                {
                                    "DESCRICAO": "Desconto pelos dias de chuva",
                                    "VALOR_UNIT": "50,00",
                                    "QUANTIDADE": "8,00"
                                }
                            ],
                            Itens: [
                                {
                                    DESCRICAO: "Drenagem",
                                    Quantidade: "1,0000",
                                    ValorUnitario: "7500,00",
                                    CODUND: "m²"
                                },
                                {
                                    DESCRICAO: "Terraplanagem Planetaria a Laser 2000 Power",
                                    Quantidade: "0,774",
                                    ValorUnitario: "7500,00",
                                    CODUND: "MES"
                                },
                                {
                                    DESCRICAO: "Estudo Geologico",
                                    Quantidade: "0,065",
                                    ValorUnitario: "15000,00",
                                    CODUND: "UN"
                                }
                            ]
                        },
                        {
                            Descontos: [
                                {
                                    "DESCRICAO": "Desconto por conta dos dias que o equipamento ficou parado",
                                    "VALOR_UNIT": "250,00",
                                    "QUANTIDADE": "12,00"
                                }
                            ],
                            Itens: [
                                {
                                    DESCRICAO: "Drenagem",
                                    Quantidade: "1,0000",
                                    ValorUnitario: "1000,00",
                                    CODUND: "m²"
                                },
                                {
                                    DESCRICAO: "Terraplanagem",
                                    Quantidade: "1,0000",
                                    ValorUnitario: "2000,00",
                                    CODUND: "MES"
                                },
                                {
                                    Ativo: false
                                }

                            ]
                        }, {
                            Descontos: [

                            ],
                            Itens: [
                                {
                                    DESCRICAO: "Drenagem",
                                    Quantidade: "2,0000",
                                    ValorUnitario: "3000,00",
                                    CODUND: "m²"
                                },
                                {
                                    DESCRICAO: "Terraplanagem",
                                    Quantidade: "4,0000",
                                    ValorUnitario: "2000,00",
                                    CODUND: "MES"
                                },
                                {
                                    Ativo: false

                                }
                            ]
                        },
                        {
                            Descontos: [],
                            Itens: []
                        }
                    ];
                    await SimulaSelecaoDeContratoECriacaoDeMedicao("1.2.021-006/16", Medicoes);
                    done();
                }, 1000);

            }, 100);
        });

        describe("Verifica a 1ª Medição", () => {
            beforeAll((done) => {
                SimulaClickEmBotao($(".btnPage0"));
                setTimeout(async () => {
                    done();
                }, 500);
            });

            describe("Verifica os Itens", () => {
                describe("Verifica a 1ª Linha", () => {
                    it('Deveria Calcular o valor da 1ª linha como R$7.500,00', () => {
                        var Row = $(".rowItem:eq(0)");
                        var result = $(Row).find(".valorTotalItem").text();
                        expect(result).toBe("R$7.500,00");
                    });

                    it('Deveria Calcular o Fisico Acumulado Atual da 1ª linha como 1', () => {
                        var Row = $(".rowItem:eq(0)");
                        var result = $(Row).find(".ItemAcumuladoAtualFisico").text();
                        expect(result).toBe("1");
                    });
                });

                it('Deveria calcular o valor da 2ª linha como R$5.805,00', () => {
                    var Row2 = $(".rowItem:eq(1)");
                    var result2 = $(Row2).find(".valorTotalItem").text();
                    expect(result2).toBe("R$5.805,00");
                });

                it('Deveria calcular o valor da 3ª linha como R$975,00', () => {
                    var Row3 = $(".rowItem:eq(2)");
                    var result3 = $(Row3).find(".valorTotalItem").text();
                    expect(result3).toBe("R$975,00");
                });

                it("Deveria ter 3 linhas Ativas e 0 Não Ativa", () => {
                    var countAtivo = 0;
                    var countNaoAtivo = 0;

                    $(".rowItem").each(function () {
                        console.log($(this).find(".checkboxItemAtivo"))
                        if (!$(this).find(".checkboxItemAtivo").is(":checked") && $(this).find(".checkboxItemAtivo").length == 1) {
                            countNaoAtivo++;
                        }
                        else {
                            countAtivo++;
                        }
                    });

                    expect(countAtivo).toBe(3);
                    expect(countNaoAtivo).toBe(0);
                });

            });

            describe("Veriica os Valores Totais", () => {
                it("Deveria Calcular o VALOR LIQUIDO como Valor Bruto - Descontos - Retencao ((R$14.280,00) - (R$1.380,33) - (R$714,00)) = R$12.185,67", () => {
                    var result = $(".valorLiquidoMedicao").text().trim();
                    expect(result).toBe("R$12.185,67");
                });
                it('Deveria Calcular o VALOR BRUTO da Medição com base nos Itens (R$14.280,00)', () => {
                    var result = $(".valorTotalMedicao").text();
                    expect(result).toBe("R$14.280,00");
                });
                it('Deveria calcular o VALOR BRUTO ACUMULADO ANTERIOR como R$0,00', () => {
                    var result = $(".AcumuladoAnterior").text();
                    expect(result).toBe("R$0,00");
                });
                it('Deveria calcular o VALOR BRUTO ACUMULADO ATUAL como R$14.280,00', () => {
                    var result = $(".AcumuladoAtual").text();
                    expect(result).toBe("R$14.280,00");
                });
                it('Deveria calcular o DESCONTO ACUMULADO ANTERIOR como R$0,00', () => {
                    var result = $(".DescontoAcumuladoAnterior").text();
                    expect(result).toBe("R$0,00");
                });
                it('Deveria calcular o DESCONTO ACUMULADO ATUAL como R$1.380,33', () => {
                    var result = $(".DescontoAcumuladoAtual").text();
                    expect(result).toBe("R$1.380,33");
                });

                it('Deveria calcular o LIQUIDO ACUMULADO ANTERIOR como R$0,00', () => {
                    var result = $(".LiquidoAcumuladoAnterior").text();
                    expect(result).toBe("R$0,00");
                });
                it('Deveria calcular o LIQUIDO ACUMULADO ATUAL como R$12.185,67', () => {
                    var result = $(".LiquidoAcumuladoAtual").text();
                    expect(result).toBe("R$12.185,67");
                });
                it('Deveria calcular a RETENÇÂO como "R$714,00"', () => {
                    var result = $(".ValorRetencao").text();
                    expect(result).toBe("R$714,00");
                });


            });
        });

        describe("Verifica a 2ª Medição", () => {
            beforeAll((done) => {
                SimulaClickEmBotao($(".btnPage1"));

                setTimeout(async () => {
                    done();
                }, 500);
            });

            describe("Verifica os Itens", () => {
                it('Deveria calcular o valor da 1ª linha como R$1.000,00', () => {
                    var Row1 = $(".rowItem:eq(0)");
                    var result1 = $(Row1).find(".valorTotalItem").text();
                    expect(result1).toBe("R$1.000,00");
                });

                it('Deveria calcular o valor da 2ª linha como R$2.000,00', () => {
                    var Row2 = $(".rowItem:eq(1)");
                    var result2 = $(Row2).find(".valorTotalItem").text();
                    expect(result2).toBe("R$2.000,00");
                });


                it("Deveria ter 2 linhas Ativas e 1 Não Ativa", () => {
                    var countAtivo = 0;
                    var countNaoAtivo = 0;

                    $(".rowItem").each(function () {
                        if ($(this).find(".checkboxItemAtivo").is(":checked")) {
                            countAtivo++;
                        }
                        else {
                            countNaoAtivo++;
                        }
                    });

                    expect(countAtivo).toBe(2);
                    expect(countNaoAtivo).toBe(1);

                });
            });

            describe("Veriica os Valores Totais", () => {
                it("Deveria calcular o VALOR LIQUIDO como Valor Bruto - Descontos - Retenção ((R$3.000,00) - (R$500,00) - (R$150,00)) = R$2.350,00", () => {
                    var result = $(".valorLiquidoMedicao").text().trim();
                    expect(result).toBe("R$2.350,00");
                });
                it('Deveria calcular o VALOR BRUTO da medição com base no valor dos itens (R$3.000,00)', () => {
                    var result = $(".valorTotalMedicao").text();
                    expect(result).toBe("R$3.000,00");
                });
                it('Deveria calcular o VALOR BRUTO ACUMULADO ANTERIOR como R$14.280,00', () => {
                    var result = $(".AcumuladoAnterior").text();
                    expect(result).toBe("R$14.280,00");
                });
                it('Deveria calcular o VALOR BRUTO ACUMULADO ATUAL como R$17.280,00', () => {
                    var result = $(".AcumuladoAtual").text();
                    expect(result).toBe("R$17.280,00");
                });
                it('Deveria calcular o DESCONTO ACUMULADO ANTERIOR como R$1.380,33', () => {
                    var result = $(".DescontoAcumuladoAnterior").text();
                    expect(result).toBe("R$1.380,33");
                });
                it('Deveria calcular o DESCONTO ACUMULADO ATUAL anterior como R$1.880,33', () => {
                    var result = $(".DescontoAcumuladoAtual").text();
                    expect(result).toBe("R$1.880,33");
                });
                it('Deveria calcular o LIQUIDO ACUMULADO ANTERIOR como R$12.185,67', () => {
                    var result = $(".LiquidoAcumuladoAnterior").text();
                    expect(result).toBe("R$12.185,67");
                });
                it('Deveria calcular o LIQUIDO ACUMULADO ATUAL anterior como R$14.535,67', () => {
                    var result = $(".LiquidoAcumuladoAtual").text();
                    expect(result).toBe("R$14.535,67");
                });
                it('Deveria calcular a RETENÇÂO como "R$150,00"', () => {
                    var result = $(".ValorRetencao").text();
                    expect(result).toBe("R$150,00");
                });
            });
        });

        describe("Verifica a 3ª Medição", () => {
            beforeAll((done) => {
                SimulaClickEmBotao($(".btnPage2")).then(() => {
                    setTimeout(async () => {
                        done();
                    }, 200);
                });
            });

            describe("Verifica os Itens", () => {
                it('Deveria calcular o valor da 1ª linha como R$6.000,00', () => {
                    var Row1 = $(".rowItem:eq(0)");
                    var result1 = $(Row1).find(".valorTotalItem").text();
                    expect(result1).toBe("R$6.000,00");
                });

                it('Deveria calcular o valor da 2ª linha como R$8.000,00', () => {
                    var Row2 = $(".rowItem:eq(1)");
                    var result2 = $(Row2).find(".valorTotalItem").text();
                    expect(result2).toBe("R$8.000,00");
                });


                it("Deveria ter 2 linhas Ativas e 1 Não Ativa", () => {
                    var countAtivo = 0;
                    var countNaoAtivo = 0;

                    $(".rowItem").each(function () {
                        if ($(this).find(".checkboxItemAtivo").is(":checked")) {
                            countAtivo++;
                        }
                        else {
                            countNaoAtivo++;
                        }
                    });

                    expect(countAtivo).toBe(2);
                    expect(countNaoAtivo).toBe(1);

                });
            });

            describe("Veriica os Valores Totais", () => {
                it("Deveria calcular o VALOR LIQUIDO como Valor Bruto - Descontos - RETENÇÂO ((R$14.000,00) - (R$1.000,00) - (R$700,00)) = R$12.300,00", () => {
                    var result = $(".valorLiquidoMedicao").text().trim();
                    expect(result).toBe("R$12.300,00");
                });
                it('Deveria calcular o VALOR BRUTO da medição com base no valor dos itens (R$14.000,00)', () => {
                    var result = $(".valorTotalMedicao").text();
                    expect(result).toBe("R$14.000,00");
                });

                it('Deveria calcular o VALOR BRUTO ACUMULADO ANTERIOR como R$17.280,00', () => {
                    var result = $(".AcumuladoAnterior").text();
                    expect(result).toBe("R$17.280,00");
                });
                it('Deveria calcular o VALOR BRUTO ACUMULADO ATUAL como R$31.280,00', () => {
                    var result = $(".AcumuladoAtual").text();
                    expect(result).toBe("R$31.280,00");
                });

                it('Deveria calcular o DESCONTO ACUMULADO ANTERIOR como R$1.880,33', () => {
                    var result = $(".DescontoAcumuladoAnterior").text();
                    expect(result).toBe("R$1.880,33");
                });
                it('Deveria calcular o DESCONTO ACUMULADO ATUAL anterior como R$2.880,33', () => {
                    var result = $(".DescontoAcumuladoAtual").text();
                    expect(result).toBe("R$2.880,33");
                });
                it('Deveria calcular o LIQUIDO ACUMULADO ANTERIOR como R$14.535,67', () => {
                    var result = $(".LiquidoAcumuladoAnterior").text();
                    expect(result).toBe("R$14.535,67");
                });
                it('Deveria calcular o LIQUIDO ACUMULADO ATUAL anterior como R$26.835,67', () => {
                    var result = $(".LiquidoAcumuladoAtual").text();
                    expect(result).toBe("R$26.835,67");
                });
                it('Deveria calcular a RETENÇÂO como "R$700,00"', () => {
                    var result = $(".ValorRetencao").text();
                    expect(result).toBe("R$700,00");
                });
            });
        });

        describe("Verifica se a Quarta Medição foi criado usando como base os itens da Terceira Medição", () => {
            beforeAll((done) => {
                SimulaClickEmBotao($(".btnPage3"));

                setTimeout(() => {
                    done();
                }, 500);
            });

            it("Deveria ter 2 linhas Ativas e 1 Não Ativa", () => {
                var countAtivo = 0;
                var countNaoAtivo = 0;

                $(".rowItem").each(function () {
                    if ($(this).find(".checkboxItemAtivo").is(":checked")) {
                        countAtivo++;
                    }
                    else {
                        countNaoAtivo++;
                    }
                });

                expect(countAtivo).toBe(2);
                expect(countNaoAtivo).toBe(1);

            });

            it("A DESCRICAO do item 1 Deveria ser 'Drenagem'", () => {
                var result = $(".rowItem:eq(0) .DESCRICAO").val();
                expect(result).toBe("Drenagem");
            });
            it("O VALOR UNITARIO do item 1 Deveria ser 'R$ 3.000,00'", () => {
                var result = $(".rowItem:eq(0) .valorUnitario").val();
                expect(result).toBe("R$ 3.000,00");
            });
            it('O CODUND do item 1 Deveria ser "m²"', () => {
                var result = $(".rowItem:eq(0) .CODUND").val();
                expect(result).toBe("m²");
            });

            it("A DESCRICAO do item 2 Deveria ser 'Terraplanagem'", () => {
                var result = $(".rowItem:eq(1) .DESCRICAO").val();
                expect(result).toBe("Terraplanagem");
            });
            it("O VALOR UNITARIO do item 2 Deveria ser 'R$ 2.000,00'", () => {
                var result = $(".rowItem:eq(1) .valorUnitario").val();
                expect(result).toBe("R$ 2.000,00");
            });
            it('O CODUND do item 2 Deveria ser "MES"', () => {
                var result = $(".rowItem:eq(1) .CODUND").val();
                expect(result).toBe("MES");
            });





        });
    });

    describe("Verifica o 2º Contrato", () => {
        beforeAll((done) => {
            setTimeout(async () => {
                if ($("#ViewBoletimDeMedicao").length > 0) {
                    await SimulaClickEmBotao($(".btnVoltar")[0]);
                }


                setTimeout(async () => {
                    var Medicoes = [
                        {
                            Desconto: "1380,33",
                            Itens: [
                                {
                                    DESCRICAO: "Drenagem",
                                    Quantidade: "1,0000",
                                    ValorUnitario: "7500,00",
                                    CODUND: "m²"
                                },
                                {
                                    DESCRICAO: "Terraplanagem",
                                    Quantidade: "0,774",
                                    ValorUnitario: "7500,00",
                                    CODUND: "UN"
                                },
                                {
                                    DESCRICAO: "Estudo Geologico",
                                    Quantidade: "0,065",
                                    ValorUnitario: "15000,00",
                                    CODUND: "UN"
                                }
                            ]
                        }
                    ];
                    await SimulaSelecaoDeContratoECriacaoDeMedicao("1.2.021-995/18", Medicoes);
                    done();
                }, 1000);
            }, 100);


        });

        it('Não Deveria ter o campo de RETENÇÂO', () => {
            var campo = $(".ValorRetencao");
            expect(campo.length).toBe(0);
        });



        it("Deveria Calcular o Valor Liquido como R$12.899,67", () => {
            var valor = $(".valorLiquidoMedicao").text();
            expect(valor).toBe("R$12.899,67");
        });

    });
});



// UTILS
function simulaInput(input, valor) {
    return new Promise(function (resolve) {
        try {
            const lastValue = input.value;
            input.value = valor;

            const event = new Event("change", { bubbles: true });
            const tracker = input._valueTracker;

            if (tracker) {
                tracker.setValue(lastValue);
            }

            input.dispatchEvent(event);

            setTimeout(() => {
                resolve();
            }, 50);
        } catch (error) {
            resolve();
        }
    });

}
function SimulaClickEmBotao(input) {
    return new Promise(function (resolve) {
        try {
            $(input).click();

            setTimeout(() => {
                resolve();
            }, 50);
        } catch (error) {
            resolve();
        }

    })
}
function SimulaSelect(input, value) {
    return new Promise(async (resolve, reject) => {
        await simulaInput(input, value);

        var IntervalWaiting = setInterval(async () => {
            if ($("#" + input.id + "_list").siblings(".rc-virtual-list").find(".ant-select-item-option").length > 0) {
                await SimulaClickEmBotao($("#" + input.id + "_list").siblings(".rc-virtual-list").find(".ant-select-item-option")[0]);
                clearInterval(IntervalWaiting);
                resolve();
            }
        }, 500);
    });
}
function SelecionaContrato(CODIGOCONTRATO) {
    $("#TableContratos>tbody>tr").each(function () {
        if ($(this).find("td:first").text() == CODIGOCONTRATO) {
            $(this).find(".btnSelecionaContrato").click();
        }
    });
}