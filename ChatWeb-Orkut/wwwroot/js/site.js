const conexao = new signalR.HubConnectionBuilder()
    .withUrl("/chatHub")
    .build();

const parametros = new URLSearchParams(
    window.location.search
);

const nomeUsuario = parametros.get("nome");

if (!nomeUsuario || nomeUsuario.trim() === "") {
    window.location.href = "/";
}

document.getElementById("usuario").value =
    nomeUsuario.trim();

document.getElementById(
    "nomeUsuarioLogado"
).textContent = nomeUsuario.trim();

let destinatarioSelecionado = null;

const historicoConversas = {};

const mensagensNaoLidas = {};


conexao.on(
    "ReceberMensagem",
    function (usuario, mensagem) {

        const meuUsuario =
            document.getElementById("usuario")
                .value
                .trim();

        const conversaCom =
            usuario.toLowerCase() ===
            meuUsuario.toLowerCase()
                ? destinatarioSelecionado
                : usuario;

        if (!conversaCom) {
            return;
        }

        if (!historicoConversas[conversaCom]) {
            historicoConversas[conversaCom] = [];
        }

        historicoConversas[conversaCom].push({
            remetente: usuario,
            texto: mensagem
        });

        const conversaAberta =
            destinatarioSelecionado &&
            destinatarioSelecionado.toLowerCase() ===
            conversaCom.toLowerCase();

        if (!conversaAberta) {
            mensagensNaoLidas[conversaCom] = true;
        }

        atualizarDestaqueUsuarios();

        if (conversaAberta) {
            mostrarConversa(conversaCom);
        }
    }
);


conexao.on(
    "AtualizarUsuarios",
    function (usuarios) {

        const lista =
            document.getElementById("listaUsuarios");

        lista.innerHTML = "";

        const meuUsuario =
            document.getElementById("usuario")
                .value
                .trim();

        usuarios.forEach(function (usuario) {

            if (
                usuario.toLowerCase() ===
                meuUsuario.toLowerCase()
            ) {
                return;
            }

            const item =
                document.createElement("li");

            item.textContent = usuario;

            item.style.cursor = "pointer";

            item.addEventListener(
                "click",
                function () {

                    destinatarioSelecionado =
                        usuario;

                    mensagensNaoLidas[usuario] =
                        false;

                    mostrarConversa(usuario);

                    atualizarDestaqueUsuarios();
                }
            );

            lista.appendChild(item);
        });

        atualizarDestaqueUsuarios();
    }
);


conexao.start()
    .then(function () {

        console.log(
            "Conectado ao servidor!"
        );

        const usuario =
            document.getElementById(
                "usuario"
            ).value.trim();

        return conexao.invoke(
            "ConectarUsuario",
            usuario
        );
    })
    .then(function () {

        console.log(
            "Usuário conectado com sucesso!"
        );
    })
    .catch(function (erro) {

        console.error(
            "Erro ao conectar:",
            erro
        );
    });


document.getElementById("btnEnviar")
    .addEventListener(
        "click",
        function () {

            const remetente =
                document.getElementById("usuario")
                    .value
                    .trim();

            const mensagem =
                document.getElementById("mensagem")
                    .value
                    .trim();

            if (remetente === "") {

                alert(
                    "Primeiro conecte um usuário."
                );

                return;
            }

            if (!destinatarioSelecionado) {

                alert(
                    "Selecione um usuário."
                );

                return;
            }

            if (mensagem === "") {

                alert(
                    "Digite uma mensagem."
                );

                return;
            }

            if (
                !historicoConversas[
                    destinatarioSelecionado
                ]
            ) {

                historicoConversas[
                    destinatarioSelecionado
                ] = [];
            }

            historicoConversas[
                destinatarioSelecionado
            ].push({

                remetente: remetente,
                texto: mensagem
            });

            mostrarConversa(
                destinatarioSelecionado
            );

            conexao.invoke(
                "EnviarMensagemPrivada",
                remetente,
                destinatarioSelecionado,
                mensagem
            )
                .then(function () {

                    document.getElementById(
                        "mensagem"
                    ).value = "";
                })
                .catch(function (erro) {

                    console.error(
                        "Erro ao enviar mensagem:",
                        erro
                    );
                });
        }
    );


function mostrarConversa(usuario) {

    const listaMensagens =
        document.getElementById(
            "listaMensagens"
        );

    listaMensagens.innerHTML = "";

    const mensagens =
        historicoConversas[usuario] || [];

    mensagens.forEach(function (mensagem) {

        const item =
            document.createElement("li");

        item.textContent =
            mensagem.remetente +
            ": " +
            mensagem.texto;

        listaMensagens.appendChild(item);
    });
}


function atualizarDestaqueUsuarios() {

    const itens =
        document.querySelectorAll(
            "#listaUsuarios li"
        );

    itens.forEach(function (item) {

        const nomeUsuario =
            item.textContent.replace(
                " ●",
                ""
            );

        item.textContent =
            nomeUsuario;

        item.style.fontWeight =
            "normal";

        if (
            mensagensNaoLidas[
                nomeUsuario
            ]
        ) {

            item.textContent =
                nomeUsuario + " ●";

            item.style.fontWeight =
                "bold";
        }
    });
}


// Enviar mensagem pressionando Enter
document.getElementById("mensagem")
    .addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                document.getElementById(
                    "btnEnviar"
                ).click();
            }
        }
    );