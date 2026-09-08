const conexao = new signalR.HubConnectionBuilder()
    .withUrl("/chatHub")
    .build();

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

        console.log("Conectado ao servidor!");

        document.getElementById(
            "btnConectar"
        ).disabled = false;
    })
    .catch(function (erro) {

        console.error(
            "Erro ao conectar com o servidor:",
            erro
        );
    });


document.getElementById("btnConectar")
    .addEventListener(
        "click",
        function () {

            const usuario =
                document.getElementById("usuario")
                    .value
                    .trim();

            if (usuario === "") {

                alert("Digite seu nome.");

                return;
            }

            conexao.invoke(
                "ConectarUsuario",
                usuario
            )
                .then(function () {

                    document.getElementById(
                        "usuario"
                    ).disabled = true;

                    document.getElementById(
                        "btnConectar"
                    ).disabled = true;
                })
                .catch(function (erro) {

                    console.error(
                        "Erro ao conectar usuário:",
                        erro
                    );
                });
        }
    );


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