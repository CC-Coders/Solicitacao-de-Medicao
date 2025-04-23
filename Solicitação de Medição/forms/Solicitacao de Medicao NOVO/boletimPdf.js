function gerarPDF(medicao) {
	var equipamentosRows = [];
	let percentualRetencao = medicao.POSSUIRETENCAO == true ? 0.05 : 0;

	let diasMedicao = Number(obterDiferencaDias(medicao.PERIODOINICIAL, medicao.PERIODOFINAL)) + 1;
	diasMedicao = diasMedicao > 30 ? 30 : diasMedicao;

	let itensRetencao = [];
	let itensReidi = [];
	let totalNF = [];

	if (medicao.POSSUIRETENCAO) {
		itensRetencao = [
			[
				{
					colSpan: 6,
					border: [true, true, true, true],
					text: '',
					alignment: 'center',
					style: 'fontCustomTable'
				},
				'',
				'',
				'',
				'',
				'',
				{
					colSpan: 2,
					border: [true, true, true, true],
					fillColor: '#eeeeee',
					text: 'RETENÇÃO',
					alignment: 'center',
					style: 'fontCustomTable'
				},
				'',
				{
					border: [true, true, true, true],
					fillColor: '#eeeeee',
					text: toCurrency(medicao.RETENCAOANTERIOR),
					alignment: 'center',
					style: 'fontCustomTable'
				},
				{
					border: [true, true, true, true],
					fillColor: '#eeeeee',
					text: toCurrency(medicao.RETENCAOATUAL),
					alignment: 'center',
					style: 'fontCustomTable'
				},
				{
					border: [true, true, true, true],
					fillColor: '#eeeeee',
					text: toCurrency(arredondar(Number(medicao.RETENCAOANTERIOR) + Number(medicao.RETENCAOATUAL),2)),
					alignment: 'center',
					style: 'fontCustomTable'
				},
			]
		];
	}

	if (medicao.POSSUIREIDI){
		itensReidi = [
			[
				{
					colSpan: 6,
					border: [true, true, true, true],
					text: '',
					alignment: 'center',
					style: 'fontCustomTable'
				},
				'',
				'',
				'',
				'',
				'',
				{
					colSpan: 2,
					border: [true, true, true, true],
					fillColor: '#eeeeee',
					text: 'REIDI (' + medicao.TAXAREIDI + '%)',
					alignment: 'center',
					style: 'fontCustomTable'
				},
				'',
				{
					border: [true, true, true, true],
					fillColor: '#eeeeee',
					text: toCurrency(medicao.REIDIANTERIOR),
					alignment: 'center',
					style: 'fontCustomTable'
				},
				{
					border: [true, true, true, true],
					fillColor: '#eeeeee',
					text: toCurrency(medicao.REIDIATUAL),
					alignment: 'center',
					style: 'fontCustomTable'
				},
				{
					border: [true, true, true, true],
					fillColor: '#eeeeee',
					text: toCurrency(arredondar(Number(medicao.REIDIANTERIOR) + Number(medicao.REIDIATUAL),2)),
					alignment: 'center',
					style: 'fontCustomTable'
				},
			]
		];
	}

	if (medicao.POSSUIRETENCAO || medicao.POSSUIREIDI) {
		totalNF = [
			[
				{
					colSpan: 6,
					border: [true, true, true, true],
					text: '',
					alignment: 'center',
					style: 'fontCustomTable'
				},
				'',
				'',
				'',
				'',
				'',
				{
					colSpan: 2,
					border: [true, true, true, true],
					fillColor: '#eeeeee',
					text: 'VALOR NOTA FISCAL',
					alignment: 'center',
					style: 'fontCustomTable'
				},
				'',
				{
					border: [true, true, true, true],
					fillColor: '#eeeeee',
					text: toCurrency(
						arredondar(
							Number(
								Number(medicao.ACUMULADOANTERIOR) 
								- Number(medicao.DESCONTOANTERIOR)
								- Number(medicao.ACUMULADOVALORDESCONTOEXTRA)
                                - (medicao.POSSUIRETENCAO ? (medicao.RETENCAOANTERIOR) : 0)
                                - (medicao.POSSUIREIDI ? (medicao.REIDIANTERIOR) : 0)
							)
							, 2)
						),
					alignment: 'center',
					style: 'fontCustomTable'
				},
				{
					border: [true, true, true, true],
					fillColor: '#eeeeee',
					text: toCurrency(
						arredondar(
							Number(
								Number(medicao.PRESENTEMEDICAO) 
								- Number(medicao.DESCONTOATUAL)
								- Number(medicao.DESCONTOS_EXTRA)
                                - (medicao.POSSUIRETENCAO ? Number(medicao.RETENCAOATUAL) : 0)
                                - (medicao.POSSUIREIDI ? Number(medicao.REIDIATUAL) : 0)
							)
							, 2)
						),
					alignment: 'center',
					style: 'fontCustomTable'
				},
				{
					border: [true, true, true, true],
					fillColor: '#eeeeee',
					text: toCurrency(
						arredondar(
							Number(
								Number(medicao.ACUMULADOATUAL) 
								- (Number(medicao.DESCONTOANTERIOR) 
									+ Number(medicao.DESCONTOATUAL)
								) 
								- (
									Number(medicao.DESCONTOS_EXTRA + Number(medicao.ACUMULADOVALORDESCONTOEXTRA))
								)
                                - (medicao.POSSUIRETENCAO ? (Number(medicao.RETENCAOANTERIOR) + Number(medicao.RETENCAOATUAL)) : 0)
                                - (medicao.POSSUIREIDI ? (Number(medicao.REIDIANTERIOR) + Number(medicao.REIDIATUAL)) : 0))
							, 2)
						),
					alignment: 'center',
					style: 'fontCustomTable'
				},
			]
		];
	}

	medicao.Itens.forEach(item => {
		item.medicaoAtual = validarPresenteMedicao(item.DIASTRABALHADOS, item.UNIDADE)
		equipamentosRows.push([
			{
				border: [true, true, true, true],
				text: item.NSEQ,
				alignment: 'center',
				style: 'fontCustomTable'
			},
			{
				border: [true, true, true, true],
				text: item.DESCRICAO,
				alignment: 'center',
				style: 'fontCustomTable'
			},
			{
				border: [true, true, true, true],
				text: item.UNIDADE,
				alignment: 'center',
				style: 'fontCustomTable'
			},
			{
				border: [true, true, true, true],
				text: item.VALORUNITARIO,
				alignment: 'center',
				style: 'fontCustomTable'
			},
			{
				border: [true, true, true, true],
				text: arredondar(item.ACUMULADOFISICOANT,2),
				alignment: 'center',
				style: 'fontCustomTable'
			},
			{
				border: [true, true, true, true],
				text: arredondar(Number(item.DIASTRABALHADOS),2),
				alignment: 'center',
				style: 'fontCustomTable'
			},
			{
				border: [true, true, true, true],
				fillColor: '#eeeeee',
				text: arredondar(Number(item.PRESENTEFISICO), 2),
				alignment: 'center',
				style: 'fontCustomTable'
			},
			{
				border: [true, true, true, true],
				text: arredondar(Number(item.ACUMULADOFISICOATUAL),2),
				alignment: 'center',
				style: 'fontCustomTable'
			},
			{
				border: [true, true, true, true],
				text: toCurrency(item.ACUMULADOFINANCEIROANT, true),
				alignment: 'center',
				style: 'fontCustomTable'
			},
			{
				border: [true, true, true, true],
				fillColor: '#eeeeee',
				text: toCurrency(item.PRESENTEFINANCEIRO, true),
				alignment: 'center',
				style: 'fontCustomTable'
			},
			{
				border: [true, true, true, true],
				text: toCurrency(arredondar(item.ACUMULADOFINANCEIROATUAL,2), true),
				alignment: 'center',
				style: 'fontCustomTable'
			}
		]
		);
	});


	var dd = {
		pageSize: {
			height: 595.28, // Largura do papel A4 em pontos (1mm ≈ 2.835 pontos)
			width: 841.89, // Altura do papel A4 em pontos
		},
		content: [

			{
				style: 'tableExample',
				table: {
					body: [
						[
							{
								colSpan: 10,
								border: [true, true, true, true],
								text: 'Boletim de Medição',
								alignment: 'center',
								style: 'fontCustomTable'
							},
							'',
							'',
							'',
							'',
							'',
							'',
							'',
							'',
							'',
							{
								border: [true, true, true, true],
								text: 'Parcial',
								alignment: 'center',
								style: 'fontCustomTable'
							}
						],
						[
							{
								rowSpan: 2,
								colSpan: 2,
								border: [true, true, true, true],
								text: 'Centro de Custo \n ' + medicao.OBRA + '\n' + medicao.ccusto.NOME,
								alignment: 'center',
								style: 'fontCustomTable'
							},
							'',
							{
								colSpan: 2,
								border: undefined,
								text: 'Código RM \n' + medicao.fornecedor.CODCFO,
								alignment: 'center',
								style: 'fontCustomTable'
							},
							'',
							{
								rowSpan: 2,
								colSpan: 3,
								border: [true, true, true, true],
								text: 'Fornecedor \n ' + medicao.FORNECEDOR + '\n' + medicao.CNPJ,
								alignment: 'center',
								style: 'fontCustomTable'
							},
							'',
							'',
							{
								colSpan: 2,
								border: [true, true, true, true],
								text: 'Contrato.\n' + medicao.contrato.CODIGOCONTRATO,
								alignment: 'center',
								style: 'fontCustomTable'
							},
							'',
							{
								colSpan: 2,
								border: [true, true, true, true],
								text: 'Boletim Medição N°.\n' + medicao.NUMEROMEDICAO,
								alignment: 'center',
								style: 'fontCustomTable'
							},
							''
						],
						[
							'',
							'',
							{
								colSpan: 2,
								border: [true, true, true, true],
								text: 'Simples Nacional\n' + (medicao.OPTANTEPELOSIMPLES == true ? "Sim" : "Não"),
								alignment: 'center',
								style: 'fontCustomTable'
							},
							'',
							'',
							'',
							'',
							{
								colSpan: 2,
								border: [true, true, true, true],
								text: 'Período\n' + medicao.PERIODOINICIAL + ' a ' + medicao.PERIODOFINAL,
								alignment: 'center',
								style: 'fontCustomTable'
							},
							'',
							{
								colSpan: 2,
								border: [true, true, true, true],
								text: 'Data\n' + medicao.DATACOMPETENCIA,
								alignment: 'center',
								style: 'fontCustomTable'
							},
							''

						],
						[
							{
								colSpan: 11,
								border: [true, true, true, true],
								text: 'Tipo Serviço\n' + (medicao.CATEGORIAPRODUTO ?? ""),
								alignment: 'center',
								style: 'fontCustomTable'
							},
							'',
							'',
							'',
							'',
							'',
							'',
							'',
							'',
							'',
							'',
						],
						[
							{
								rowSpan: 2,
								border: [true, true, true, true],
								fillColor: '#eeeeee',
								text: 'Item',
								alignment: 'center',
								style: 'fontCustomTable'
							},
							{
								rowSpan: 2,
								border: [true, true, true, true],
								fillColor: '#eeeeee',
								text: 'Descrição dos Serviços',
								alignment: 'center',
								style: 'fontCustomTable'
							},
							{
								rowSpan: 2,
								border: [true, true, true, true],
								fillColor: '#eeeeee',
								text: 'UNID.',
								alignment: 'center',
								style: 'fontCustomTable'
							},
							{
								rowSpan: 2,
								border: [true, true, true, true],
								fillColor: '#eeeeee',
								text: 'PREÇO UNIT (R$)',
								alignment: 'center',
								style: 'fontCustomTable'
							},
							{
								colSpan: 4,
								border: [true, true, true, true],
								fillColor: '#eeeeee',
								text: 'FISICO',
								alignment: 'center',
								style: 'fontCustomTable'
							},
							'',
							'',
							'',
							{
								colSpan: 3,
								border: [true, true, true, true],
								fillColor: '#eeeeee',
								text: 'FINANCEIRO',
								alignment: 'center',
								style: 'fontCustomTable'
							},
							'',
							''
						],
						[
							'',
							'',
							'',
							'',
							{
								border: [true, true, true, true],
								fillColor: '#eeeeee',
								text: 'ACUMULADO ANTERIOR',
								alignment: 'center',
								style: 'fontCustomTable'
							},
							{
								border: [true, true, true, true],
								fillColor: '#eeeeee',
								text: 'MEDIÇÃO',
								alignment: 'center',
								style: 'fontCustomTable'
							},
							{
								border: [true, true, true, true],
								fillColor: '#eeeeee',
								text: 'PRESENTE MEDIÇÃO',
								alignment: 'center',
								style: 'fontCustomTable'
							},
							{
								border: [true, true, true, true],
								fillColor: '#eeeeee',
								text: 'ACUMULADO ATUAL',
								alignment: 'center',
								style: 'fontCustomTable'
							},
							{
								border: [true, true, true, true],
								fillColor: '#eeeeee',
								text: 'ACUMULADO ANTERIOR',
								alignment: 'center',
								style: 'fontCustomTable'
							},
							{
								border: [true, true, true, true],
								fillColor: '#eeeeee',
								text: 'PRESENTE MEDIÇÃO',
								alignment: 'center',
								style: 'fontCustomTable'
							},
							{
								border: [true, true, true, true],
								fillColor: '#eeeeee',
								text: 'ACUMULADO ATUAL',
								alignment: 'center',
								style: 'fontCustomTable'
							},
						],
						...equipamentosRows,
						[
							{
								colSpan: 6,
								border: [true, true, true, true],
								text: '',
								alignment: 'center',
								style: 'fontCustomTable'
							},
							'',
							'',
							'',
							'',
							'',
							{
								colSpan: 2,
								border: [true, true, true, true],
								fillColor: '#eeeeee',
								text: 'VALOR BRUTO MEDIÇÃO',
								alignment: 'center',
								style: 'fontCustomTable'
							},
							'',
							{
								border: [true, true, true, true],
								fillColor: '#eeeeee',
								text: toCurrency(Number(medicao.ACUMULADOANTERIOR)),
								alignment: 'center',
								style: 'fontCustomTable'
							},
							{
								border: [true, true, true, true],
								fillColor: '#eeeeee',
								text: toCurrency(Number(medicao.PRESENTEMEDICAO)),
								alignment: 'center',
								style: 'fontCustomTable'
							},
							{
								border: [true, true, true, true],
								fillColor: '#eeeeee',
								text: toCurrency(Number(medicao.ACUMULADOATUAL)),
								alignment: 'center',
								style: 'fontCustomTable'
							},
						],
						[
							{
								colSpan: 6,
								rowSpan: 3 + (medicao.POSSUIRETENCAO ? 2 : 0) + (medicao.POSSUIREIDI ? 1 : 0),
								border: [true, true, true, true],
								text: 'VALOR LIQUIDO DA MEDIÇÃO\n' + numeroPorExtenso((Number(medicao.PRESENTEMEDICAO) - Number(medicao.DESCONTOATUAL) - Number(medicao.DESCONTOS_EXTRA)) * (1 - percentualRetencao)),
								alignment: 'center',
								style: 'fontCustomTable'
							},
							'',
							'',
							'',
							'',
							'',
							{
								colSpan: 2,
								border: [true, true, true, true],
								fillColor: '#eeeeee',
								text: 'DESCONTOS',
								alignment: 'center',
								style: 'fontCustomTable'
							},
							'',
							{
								border: [true, true, true, true],
								fillColor: '#eeeeee',
								text: toCurrency(Number(medicao.DESCONTOANTERIOR)),
								alignment: 'center',
								style: 'fontCustomTable'
							},
							{
								border: [true, true, true, true],
								fillColor: '#eeeeee',
								text: toCurrency(Number(medicao.DESCONTOATUAL)),
								alignment: 'center',
								style: 'fontCustomTable'
							},
							{
								border: [true, true, true, true],
								fillColor: '#eeeeee',
								text: toCurrency(arredondar(Number(medicao.DESCONTOANTERIOR) + Number(medicao.DESCONTOATUAL),2)),
								alignment: 'center',
								style: 'fontCustomTable'
							},
						],
						[
							{
								colSpan: 6,
								border: [true, true, true, true],
								text: '',
								alignment: 'center',
								style: 'fontCustomTable'
							},
							'',
							'',
							'',
							'',
							'',
							{
								colSpan: 2,
								border: [true, true, true, true],
								fillColor: '#eeeeee',
								text: 'DESCONTOS EXTRA',
								alignment: 'center',
								style: 'fontCustomTable'
							},
							'',
							{
								border: [true, true, true, true],
								fillColor: '#eeeeee',
								text: toCurrency(arredondar(Number(medicao.ACUMULADOVALORDESCONTOEXTRA), 2)),
								alignment: 'center',
								style: 'fontCustomTable'
							},
							{
								border: [true, true, true, true],
								fillColor: '#eeeeee',
								text: toCurrency(arredondar(Number(medicao.DESCONTOS_EXTRA), 2)),
								alignment: 'center',
								style: 'fontCustomTable'
							},
							{
								border: [true, true, true, true],
								fillColor: '#eeeeee',
								text: toCurrency(arredondar(Number(medicao.ACUMULADOVALORDESCONTOEXTRA) + Number(medicao.DESCONTOS_EXTRA),2)),
								alignment: 'center',
								style: 'fontCustomTable'
							},
						],
						[
							{
								colSpan: 6,
								border: [true, true, true, true],
								text: '',
								alignment: 'center',
								style: 'fontCustomTable'
							},
							'',
							'',
							'',
							'',
							'',
							{
								colSpan: 2,
								border: [true, true, true, true],
								fillColor: '#eeeeee',
								text: (medicao.POSSUIRETENCAO ? 'TOTAL LÍQUIDO' : 'VALOR NOTA FISCAL'),
								alignment: 'center',
								style: 'fontCustomTable'
							},
							'',
							{
								border: [true, true, true, true],
								fillColor: '#eeeeee',
								text: toCurrency(arredondar(Number(medicao.ACUMULADOANTERIOR) - Number(medicao.DESCONTOANTERIOR) - Number(medicao.ACUMULADOVALORDESCONTOEXTRA), 2)),
								alignment: 'center',
								style: 'fontCustomTable'
							},
							{
								border: [true, true, true, true],
								fillColor: '#eeeeee',
								text: toCurrency(arredondar(Number(medicao.PRESENTEMEDICAO) - Number(medicao.DESCONTOATUAL) - Number(medicao.DESCONTOS_EXTRA), 2)),
								alignment: 'center',
								style: 'fontCustomTable'
							},
							{
								border: [true, true, true, true],
								fillColor: '#eeeeee',
								text: toCurrency(arredondar(Number(medicao.ACUMULADOATUAL) - (Number(medicao.DESCONTOANTERIOR) + Number(medicao.DESCONTOATUAL)) - (Number(medicao.ACUMULADOVALORDESCONTOEXTRA)+ Number(medicao.DESCONTOS_EXTRA)),2)),
								alignment: 'center',
								style: 'fontCustomTable'
							},
						],
						... itensRetencao,
						... itensReidi,
						... totalNF,
						[
							{
								colSpan: 11,
								border: [true, true, true, false],
								fillColor: '#ffffff',
								text: 'Declaro concordar com os valores e quantidades constantes nesta medição, não restando nada a medir até esta data.\n Cidade: ' + medicao.fornecedor.CIDADE + ' - ' + medicao.fornecedor.ESTADO +' \n Data: ' + medicao.DATACOMPETENCIA + ' \n De Acordo,',
								margin: [10, 10, 10, 10],
								alignment: 'left',
								style: 'fontCustomTable'
							},
							'',
							'',
							'',
							'',
							'',
							'',
							'',
							'',
							'',
							''
						],
						[
							{
								colSpan: 3,
								border: [true, false, false, true],
								fillColor: '#ffffff',
								text: '____________________________________________\n ' + medicao.fornecedor.NOME,
								margin: [10, 10, 10, 10],
								alignment: 'center',
								style: 'fontCustomTable'
							},
							'',
							'',
							{
								colSpan: 3,
								border: [false, false, false, true],
								fillColor: '#ffffff',
								text: '____________________________________________\nADMINISTRATIVO',
								margin: [10, 10, 10, 10],
								alignment: 'center',
								style: 'fontCustomTable'
							},
							'',
							'',
							{
								colSpan: 3,
								border: [false, false, false, true],
								fillColor: '#ffffff',
								text: '____________________________________________\nSEÇÃO TÉCNICA',
								margin: [10, 10, 10, 10],
								alignment: 'center',
								style: 'fontCustomTable'
							},
							'',
							'',
							{
								colSpan: 2,
								border: [false, false, true, true],
								fillColor: '#ffffff',
								text: '____________________________________________\nENGENHEIRO',
								margin: [10, 10, 10, 10],
								alignment: 'center',
								style: 'fontCustomTable'
							},
							''
						]
					]
				},
				layout: {
					defaultBorder: false,
				}
			},
		],
		styles: {
			fontCustomTable: {
				fontSize: 8 // Tamanho da fonte em pontos
			},
			header: {
				bold: true,
				margin: [0, 0, 0, 10]
			},
			subheader: {
				bold: true,
				margin: [0, 10, 0, 5]
			},
			tableExample: {
				margin: [0, 5, 0, 15]
			},
			tableHeader: {
				bold: true,
				color: 'black'
			}
		},
		defaultStyle: {
			// alignment: 'justify'
		}
	}

	let pdfName = "MedicaoGerada_Cont_" + medicao.contrato.CODIGOCONTRATO.replace(/\D/g, '') + '_id_' + medicao.MEDICAOID;
	anexarPdf(pdfName, dd);
}

function anexarPdf(name, dd){
	pdfMake.createPdf(dd).getBase64(function(base64String) {
        var fileName = name + ".pdf";
		savePdfToFluig(base64String, 1191466, fileName);//prod
        //savePdfToFluig(base64String, 32808, fileName);//homolog
	});
	downloadPdf(name, dd);
}

function downloadPdf(name, dd) {
	pdfMake.createPdf(dd).download(name + '.pdf');
}
