export function valida(input) {
    const tipoDeInput = input.dataset.tipo

    if(validadores[tipoDeInput]){
        validadores[tipoDeInput](input)
    }

    if(input.validity.valid) {
        input.parentElement.classList.remove ('input-container--invalido')
        input.parentElement.querySelector('.input-mensagem-erro').innerHTML = ''
    } else {
        input.parentElement.classList.add ('input-container--invalido')
        input.parentElement.querySelector('.input-mensagem-erro').innerHTML = mostraMensagemDeErro (tipoDeInput, input)
    }
}

const tiposDeErro = [
    'valueMissing',
    'typeMismatch',
    'patternMismatch',
    'customError'
]

const mensagensErro = {
    nome: {
        valueMissing: "O campo nome não pode estar vazio"
    },
    email: {
        valueMissing: "O campo email não pode estar vazio",
        typeMismatch: 'O email digitado não é valido'
    },
    senha: {
        valueMissing: 'O campo de senha não pode estar vazio',
        patternMismatch: 'A senha deve conter entre 6 a 12 caracateres e deve conter pelo menos uma letra maiscula, uma letra minuscula, um numero e nenhum simbolo.'
    },
    dataNascimento: {
        valueMissing: 'O campo de data de nascimento não pode estar vazio',
        customError: 'Você deve ter 18 anos para se cadastrar'
    },
    cpf: {
        valueMissing: 'O campo de CPF não pode estar vazio',
        customError: 'O CPF digitado não é valido.'
    },
    cep: {
        valueMissing: 'O campo de CEP não pode estar vazio',
        patternMismatch: 'O CEP digitado não é valido',
        customError: 'Não foi possivel encontrar o CEP'
    },
    logradouro: {
        valueMissing: 'O campo de logradouro não pode estar vazio',
    },
    cidade: {
        valueMissing: 'O campo de cidade não pode estar vazio',
    },
    estado: {
        valueMissing: 'O campo de estado não pode estar vazio',
    }
}

const validadores = {
    dataNascimento:input => validaData(input),
    cpf:input => validaCPF(input),
    cep:input => recuperarCEP(input)
}

function mostraMensagemDeErro(tipoDeInput, input) {
    let mensagem = ''
    tiposDeErro.forEach(erro =>{
        if(input.validity[erro]){
            mensagem = mensagensErro[tipoDeInput][erro]
        }
    })

    return mensagem
}

function validaData (input) {
    const dataRecebida = new Date(input.value)
    let mensagem = ""

    if (!maiorQue18(dataRecebida)){
        mensagem = 'Você deve ter 18 anos para se cadastrar'
    }

    input.setCustomValidity(mensagem)
}

function maiorQue18(data) {
    const dataAtual = new Date()
    const dataMais18 = new Date (data.getUTCFullYear () +18, data.getUTCMonth(), data.getUTCDate())

    return dataMais18 <= dataAtual

}

function validaCPF(input) {
    const cpfFormatado = input.value.replace(/\D/g, '')
    let mensagem =''

    if(!checaCPFRepetido (cpfFormatado) || !checaEstruturaCPF (cpfFormatado)) {
        mensagem = 'O CPF digitado não é valido.'
    }

    input.setCustomValidity(mensagem)
    
}

function checaCPFRepetido(cpf) {
    const valoresRepetido = [
        '00000000000',
        '11111111111',
        '22222222222',
        '44444444444',
        '33333333333',
        '55555555555',
        '66666666666',
        '77777777777',
        '88888888888',
        '99999999999',
    ]

    let cpfValido = true

    valoresRepetido.forEach (valor => {
        if(valor == cpf) {
            cpfValido = false
        }
    })

    return cpfValido
}

function checaEstruturaCPF (cpf) {
    const multiplicador = 10

    return checaDigitoVerificador (cpf, multiplicador)

}

function checaDigitoVerificador (cpf, multiplicador) {
    if(multiplicador >= 12) {
        return true
    }

    let multiplicadorInicial = multiplicador
    let soma = 0
    const cpfSemDigito = cpf.substr(0, multiplicador - 1).split('')
    const digitoVerificado = cpf.charAt(multiplicador - 1)
    for(let contador=0; multiplicadorInicial > 1; multiplicadorInicial--) {
        soma = soma + cpfSemDigito[contador] * multiplicadorInicial
        contador++
    }

    if (digitoVerificado==confirmaDigito(soma)) {
        return checaDigitoVerificador(cpf,multiplicador +1)
    }

    return false
}

function confirmaDigito (soma) {
    return 11 - (soma % 11)
}

function recuperarCEP (input) {
    const cep = input.value.replace(/\D/g, '')
    const url = `https://viacep.com.br/ws/${cep}/json`
    const options = {
        method: 'GET',
        mode: 'cors',
        headers: {
            'content-type': 'application/json;charset=utf-8'
        }
    }
    
    if(!input.validity.patternMismatch && !input.validity.valueMissing) {
        fetch(url,options).then(
            response => response.json()
        ).then(
            data => {
                if(data.erro) {
                    input.setCustomValidity('Não foi possivel encontrar o CEP')
                    return
                }
                input.setCustomValidity('')
                completaCEP(data)
                return
            }
        )
    }
}

function completaCEP(data) {
    const logradouro = document.querySelector('[data-tipo="logradouro"]')
    const cidade = document.querySelector('[data-tipo="cidade"]')
    const estado = document.querySelector('[data-tipo="estado"]')

    logradouro.value = data.logradouro
    cidade.value = data.localidade
    estado.value = data.uf
}