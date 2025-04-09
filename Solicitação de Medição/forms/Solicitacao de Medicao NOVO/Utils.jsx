const useState = React.useState;
const useEffect = React.useEffect;
const useRef = React.useRef;

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.log(error, errorInfo);
        FLUIGC.toast({
            message: errorInfo,
            type: "danger",
        });
        FLUIGC.toast({
            message: error,
            type: "danger",
        });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <h1>Um erro ocorreu! Tente atualizar a pÃ¡gina, e caso o erro percista entre em contato com o Administrador do Sistema.</h1>;
        }

        return this.props.children;
    }
}

function Panel({ children, Title, HideAble = false, IniciaFechado = false }) {
    const [BodyShown, setBodyShown] = useState(!IniciaFechado);

    function handleClickDetails(e) {
        if (HideAble) {
            if (BodyShown) {
                $(e.target).closest(".panel").find(".panel-body:first").slideUp();
            } else {
                $(e.target).closest(".panel").find(".panel-body:first").slideDown();
            }

            setBodyShown(!BodyShown);
        }
    }

    return (
        <div className="panel panel-primary">
            <div
                className="panel-heading"
                onClick={(e) => {
                    if (HideAble) {
                        handleClickDetails(e);
                    }
                }}
            >
                {HideAble == true && <div className={"details " + (BodyShown ? "detailsHide" : "detailsShow")}></div>}

                <h4 className="panel-title" style={{ display: "inline-block", verticalAlign: "middle" }}>
                    {Title}
                </h4>
            </div>
            <div className="panel-body" style={{ display: IniciaFechado ? "none" : "block" }}>
                {children}
            </div>
        </div>
    );
}

function MoneySpan({ value, QuantidadeDeCasasDecimais = 2, className = "" }) {
    value = FormataValorParaMoeda(value);

    function FormataValorParaMoeda(valor) {
        if (isNaN(valor)) {
            return " - ";
        }

        if (valor) {
            valor = parseFloat(valor);
        }

        return valor.toLocaleString("pt-br", {
            minimumFractionDigits: QuantidadeDeCasasDecimais,
            maximumFractionDigits: QuantidadeDeCasasDecimais,
        });
    }

    return (
        <div style={{ display: "inline-block" }} className={className}>
            R$<span>{value.split(",")[0]},</span>
            <span style={{ fontSize: "75%" }}>{value.split(",")[1]}</span>
        </div>
    );
}
function MoneyInput({ value, onChange, QuantidadeDeCasasDecimais = 2, className, readOnly, textAlign = "center", size = "100%" }) {
    function formatValue(value) {
        value = value.toString();
        if (value) {
            value = value.split(".");
            var int = value[0].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
            var decimais = value[1] != undefined ? "," + value[1] : "";

            return "R$ " + int + decimais;
        } else {
            return "R$ ";
        }
    }

    function unformatValue(value) {
        value = value.split(".").join("").split(",");
        var inteiros = removeNaoNumericos(value[0]);
        var decimais = value[1];

        if (!inteiros && !decimais) {
            return "";
        } else {
            if (decimais != undefined) {
                decimais = "." + removeNaoNumericos(decimais);
            } else {
                decimais = "";
            }

            value = inteiros + decimais;
            return value;
        }
    }

    function removeNaoNumericos(value) {
        if (value != undefined && value != null) {
            return value.replace(/[^0-9]/g, "");
        } else {
            return false;
        }
    }

    function handleChange(e) {
        onChange(unformatValue(e.target.value));
    }

    function handleBlur(e) {
        var value = e.target.value.split(",");
        var inteiros = removeNaoNumericos(value[0]);
        var decimais = removeNaoNumericos(value[1]);

        if (!inteiros && !decimais) {
            onChange("");
        } else {
            if (decimais != false) {
                decimais = (decimais + "0000000000").substring(0, QuantidadeDeCasasDecimais);
            } else {
                decimais = "0000000000".substring(0, QuantidadeDeCasasDecimais);
            }
            value = inteiros + "." + decimais;

            onChange(value);
        }
    }

    return (
        <input 
            type="text"
            style={{ width: size, textAlign: textAlign, display: "inline" }}
            value={formatValue(value)} 
            className={"form-control " + className} 
            readOnly={readOnly} 
            placeholder="R$" 
            onChange={handleChange} 
            onBlur={handleBlur} />
    );
}
function NumberInput({ value, onChange, QuantidadeDeCasasDecimais = 2, className, readOnly, textAlign = "center", size = "100%" }) {
    function formatValue(value) {
        if (value) {
            value = value.split(".");
            var int = value[0].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
            var decimais = value[1] != undefined ? "," + value[1] : "";

            return int + decimais;
        } else {
            return "";
        }
    }

    function unformatValue(value) {
        if (value != undefined && value != null) {
            value = value.toString().replace(/[^0-9,.]/g, "");
            var splitValue = value.split(/[,.]/);
            var inteiros = removeNaoNumericos(splitValue[0]);
            var decimais = splitValue[1] !== undefined ? "." + removeNaoNumericos(splitValue[1]) : "";

            if (!inteiros && !decimais) {
                return "";
            } else {
                value = inteiros + decimais;
                return value;
            }
        } else {
            return "";
        }
    }

    function removeNaoNumericos(value) {
        if (value != undefined && value != null) {
            return value.replace(/[^0-9]/g, "");
        } else {
            return false;
        }
    }

    function handleChange(e) {
        onChange(unformatValue(e.target.value));
    }

    function handleBlur(e) {
        var value = e.target.value.split(",");
        var inteiros = removeNaoNumericos(value[0]);
        var decimais = removeNaoNumericos(value[1]);

        if (!inteiros && !decimais) {
            onChange("");
        } else {
            if (decimais != false) {
                decimais = (decimais + "0000000000").substring(0, QuantidadeDeCasasDecimais);
            } else {
                decimais = "0000000000".substring(0, QuantidadeDeCasasDecimais);
            }
            value = inteiros + "." + decimais;

            onChange(value);
        }
    }

    return (
        <input
            type="text"
            value={value}
            className={"form-control " + className}
            readOnly={readOnly}
            placeholder=""
            onChange={(ev) => handleChange(ev)}
            style={{ width: size, textAlign: textAlign, display: "inline" }}
        />
    );
}

function DatePicker({ value, onChangeValue }) {
  const inputRef = useRef(null);
  const [ID] = useState(geraId()); // Use useState para garantir que o ID não muda

  useEffect(() => {
    const input = inputRef.current;
    FLUIGC.calendar(`#${input.id}`);

    const handleChange = (e) => {
      onChangeValue(e.target.value);
    };

    $(input).on("change", handleChange);

    // Cleanup do evento ao desmontar
    return () => {
      $(input).off("change", handleChange);
    };
  }, [onChangeValue]);

  return (
    <input
      ref={inputRef}
      type="text"
      id={`DatePicker_${ID}`}
      className="form-control"
      value={value}
      onChange={(e) => onChangeValue(e.target.value)}
      style={{ width: "120px", display: "inline-flex" }}
    />
  );
}



const Modal = ({ isOpen, onClose, children, classeModal }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className={"modal-content " + classeModal}>
                <label>Descrição dos descontos</label>
                <button onClick={onClose} className="close-button">
                    <i className="flaticon flaticon-close icon-sm" aria-hidden="true"></i>
                </button>
                {children}
            </div>
        </div>
    );
};
