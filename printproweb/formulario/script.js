document.getElementById('subscription-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Obter os valores do formulário
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const cpf = document.getElementById('cpf').value;
    const street = document.getElementById('street').value;
    const number = document.getElementById('number').value;
    const neighborhood = document.getElementById('neighborhood').value;
    const complement = document.getElementById('complement').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;

    console.log("Dados do formulário:", {
        name,
        phone,
        email,
        cpf,
        street,
        number,
        neighborhood,
        complement,
        city,
        state
    });

    // Montar o payload para a requisição GraphQL
    const query = `
        mutation {
            insert_user_printpro(objects: {
                email: "${email}",
                name: ${name ? `"${name}"` : null}, 
                phone: ${phone ? `"${phone}"` : null},
                cpf: ${cpf ? `"${cpf}"` : null},
                rua: ${street ? `"${street}"` : null},
                numero: ${number ? `"${number}"` : null},
                bairro: ${neighborhood ? `"${neighborhood}"` : null},
                complemento: ${complement ? `"${complement}"` : null},
                cidade: ${city ? `"${city}"` : null},
                estado: ${state ? `"${state}"` : null}
            }) {
                returning {
                    email
                }
            }
        }
    `;
    
    const url = 'https://backend.pedepro.com.br/v1/graphql';
    console.log("Query GraphQL:", query);

    try {
        // Fazer a requisição GraphQL
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-hasura-admin-secret': 'dz9uee0D8fyyYzQsv2piE1MLcVZklkc7'
            },
            body: JSON.stringify({ query })
        });

        const data = await response.json();

        console.log("Resposta da requisição GraphQL:", data);

        // Verificar se a requisição foi bem-sucedida
        if (data.errors) {
            alert('Ocorreu um erro ao criar o usuário');
            console.error(data.errors);
        } else {
            alert('Usuário criado com sucesso!');
            // Agora fazer a requisição para o Asaas
            console.log("Iniciando a criação do cliente no Asaas...");
            const asaasResponse = await createAsaasCustomer(name, email, cpf, phone);

            if (asaasResponse.success) {
                alert('Cliente criado no Asaas com sucesso!');
            } else {
                alert('Ocorreu um erro ao criar o cliente no Asaas');
                console.error(asaasResponse.error);
            }
        }
    } catch (error) {
        alert('Ocorreu um erro ao tentar se conectar com o servidor');
        console.error(error);
    }
});

// Função para criar o cliente no Asaas
async function createAsaasCustomer(name, email, cpf, phone) {
    const url = 'https://www.asaas.com/api/v3/customers';
    const accessToken = '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDA0MTc3OTQ6OiRhYWNoXzBlODEzYWU5LTkyMzQtNGEzZS04ZGY4LTEyYWFiMTEwOGFhYw==';
    
    const body = {
        name: name,
        email: email,
        cpfCnpj: cpf,
        mobilePhone: phone
    };

    console.log("Dados enviados para o Asaas:", body);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'access_token': accessToken
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        console.log("Resposta da requisição para o Asaas:", data);

        if (response.ok) {
            console.log("Cliente criado com sucesso no Asaas!");
            return { success: true };
        } else {
            console.error("Erro ao criar cliente no Asaas:", data);
            return { success: false, error: data };
        }
    } catch (error) {
        console.error('Erro ao criar cliente no Asaas:', error);
        return { success: false, error };
    }
}

// Função para aplicar a máscara no campo CPF
function mascaraCPF(campo) {
    var valor = campo.value.replace(/\D/g, ''); // Remove qualquer caractere não numérico
    if (valor.length <= 11) {
        // Aplica a máscara no CPF (XXX.XXX.XXX-XX)
        campo.value = valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
}
