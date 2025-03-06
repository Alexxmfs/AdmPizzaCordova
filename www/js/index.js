document.addEventListener("deviceready", onDeviceReady, false);

const PIZZARIA_ID = "pizzaria_do_alekinho";
let listaPizzasCadastradas = [];

const applista = document.getElementById("applista");
const appcadastro = document.getElementById("appcadastro");
const listaPizzas = document.getElementById("listaPizzas");
const pizzaInput = document.getElementById("pizza");
const precoInput = document.getElementById("preco");
const imagemDiv = document.getElementById("imagem");

let pizzaSelecionadaId = null;

function onDeviceReady() {
    console.log("Cordova está pronto!");
    cordova.plugin.http.setDataSerializer("json");
    carregarPizzas();
}

document.getElementById("btnNovo").addEventListener("click", () => {
    limparFormulario();
    alternarTelaCadastro(true);
});

document.getElementById("btnCancelar").addEventListener("click", () => {
    alternarTelaCadastro(false);
});

function alternarTelaCadastro(mostrar) {
    applista.style.display = mostrar ? "none" : "flex";
    appcadastro.style.display = mostrar ? "flex" : "none";
}

document.getElementById("btnFoto").addEventListener("click", () => {
    navigator.camera.getPicture(
        function(imageData) {
            imagemDiv.style.backgroundImage = `url(data:image/jpeg;base64,${imageData})`;
            imagemDiv.style.backgroundSize = "cover";
            imagemDiv.style.backgroundPosition = "center";
        },
        function(error) {
            alert("Erro ao tirar foto: " + error);
        },
        {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL
        }
    );
});

function carregarPizzas() {
    listaPizzas.innerHTML = "Carregando...";

    cordova.plugin.http.get(
        `https://pedidos-pizzaria.glitch.me/admin/pizzas/${PIZZARIA_ID}`,
        {},
        {},
        function(response) {
            if (response.data !== "") {
                listaPizzasCadastradas = JSON.parse(response.data);
                exibirListaPizzas();
            } else {
                listaPizzas.innerHTML = "Nenhuma pizza cadastrada.";
            }
        },
        function(error) {
            console.error("Erro ao carregar pizzas:", error);
            listaPizzas.innerHTML = "Erro ao carregar pizzas.";
        }
    );
}

function exibirListaPizzas() {
    listaPizzas.innerHTML = "";
    listaPizzasCadastradas.forEach((item, idx) => {
        const novo = document.createElement("div");
        novo.classList.add("linha");
        novo.innerHTML = item.pizza;
        novo.id = idx;
        novo.onclick = function () {
            carregarDadosPizza(novo.id);
        };
        listaPizzas.appendChild(novo);
    });
}

function carregarDadosPizza(id) {
    pizzaSelecionadaId = id;
    let pizza = listaPizzasCadastradas[id];

    imagemDiv.style.backgroundImage = `url(data:image/jpeg;base64,${pizza.imagem})`;
    imagemDiv.style.backgroundSize = "cover";
    imagemDiv.style.backgroundPosition = "center";
    
    pizzaInput.value = pizza.pizza;
    precoInput.value = pizza.preco;

    alternarTelaCadastro(true);
}

document.getElementById("btnSalvar").addEventListener("click", () => {
    const pizza = pizzaInput.value.trim();
    const preco = precoInput.value.trim();
    let imagem = imagemDiv.style.backgroundImage;

    if (!pizza || !preco || !imagem) {
        alert("Preencha todos os campos!");
        return;
    }

    imagem = imagem.replace('url("data:image/jpeg;base64,', '').replace('")', '');

    let data = {
        pizzaria: PIZZARIA_ID,
        pizza: pizza,
        preco: preco,
        imagem: imagem
    };

    if (pizzaSelecionadaId === null) {
        cordova.plugin.http.post(
            "https://pedidos-pizzaria.glitch.me/admin/pizza/",
            data,
            { "Content-Type": "application/json" },
            function(response) {
                alert("Pizza salva com sucesso!");
                alternarTelaCadastro(false);
                carregarPizzas();
            },
            function(error) {
                alert("Erro ao salvar pizza.");
            }
        );
    } else {
        data.pizzaid = listaPizzasCadastradas[pizzaSelecionadaId]._id;
        cordova.plugin.http.put(
            "https://pedidos-pizzaria.glitch.me/admin/pizza/",
            data,
            { "Content-Type": "application/json" },
            function(response) {
                alert("Pizza atualizada com sucesso!");
                alternarTelaCadastro(false);
                carregarPizzas();
            },
            function(error) {
                alert("Erro ao atualizar pizza.");
            }
        );
    }
});

document.getElementById("btnExcluir").addEventListener("click", () => {
    if (pizzaSelecionadaId === null) {
        alert("Nenhuma pizza selecionada.");
        return;
    }

    let nomePizza = listaPizzasCadastradas[pizzaSelecionadaId].pizza;

    cordova.plugin.http.delete(
        `https://pedidos-pizzaria.glitch.me/admin/pizza/${PIZZARIA_ID}/${nomePizza}`,
        {},
        {},
        function(response) {
            alert("Pizza excluída com sucesso!");
            alternarTelaCadastro(false);
            carregarPizzas();
        },
        function(error) {
            alert("Erro ao excluir pizza.");
        }
    );
});

function limparFormulario() {
    pizzaSelecionadaId = null;
    imagemDiv.style.backgroundImage = "";
    pizzaInput.value = "";
    precoInput.value = "";
}
