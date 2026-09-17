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

let usuariosOnline =[];

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
            texto: mensagem,
            horario: new Date().toLocaleTimeString(
                "pt-BR",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            )
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

        usuariosOnline = usuarios;

        const lista =
            document.getElementById("listaUsuarios");

        lista.innerHTML = "";

        const meuUsuario =
            document.getElementById("usuario")
                .value
                .trim();

        usuarios.forEach(function (usuario) {

            if (
                usuario.nome.toLowerCase() ===
                meuUsuario.toLowerCase()
            ) {
                return;
            }

            const item =
                document.createElement("li");

            item.dataset.usuario = usuario.nome;
            item.textContent = usuario.nome;

            if (usuario.online) {
                item.classList.add("usuario-online");
            } else {
                item.classList.add("usuario-offline");
            }

            item.style.cursor = "pointer";

            if (
                destinatarioSelecionado &&
                usuario.nome.toLowerCase() ===
                destinatarioSelecionado.toLowerCase()
            ) {
                item.classList.add(
                    "usuario-selecionado"
                );
            }

            item.addEventListener(
                "click",
                function () {

                    destinatarioSelecionado = usuario.nome;

                    mensagensNaoLidas[usuario.nome] = false;

                    // Destaca o usuário selecionado
                    document
                        .querySelectorAll("#listaUsuarios li")
                        .forEach(function (itemLista) {
                            itemLista.classList.remove("usuario-selecionado");
                        });

                    item.classList.add("usuario-selecionado");


                    // Mostra o nome no topo da conversa
                    document.getElementById(
                        "nomeDestinatario"
                    ).textContent = usuario.nome;



                    // Esconde a mensagem "Selecione uma conversa"
                    document.getElementById(
                        "estadoInicial"
                    ).style.display = "none";


                    // Mostra a caixa de envio
                    document.getElementById(
                        "areaEnvio"
                    ).style.display = "flex";


                    // Mostra as mensagens desse usuário
                    mostrarConversa(usuario.nome);

                    atualizarStatusDestinatario();
                    atualizarDestaqueUsuarios();
                }
            );

            lista.appendChild(item);
        });

        atualizarDestaqueUsuarios();
        atualizarStatusDestinatario(); 
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
                texto: mensagem,
                horario: new Date().toLocaleTimeString(
                    "pt-BR",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                )
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

    const meuUsuario =
        document.getElementById(
            "usuario"
        ).value.trim();

    mensagens.forEach(function (mensagem) {

        const item =
            document.createElement("li");

        const texto =
            document.createElement("span");

        texto.classList.add(
            "mensagem-texto"
        );

        texto.textContent =
            mensagem.texto;


        const horario =
            document.createElement("small");

        horario.classList.add(
            "mensagem-horario"
        );

        horario.textContent =
            mensagem.horario || "";


        item.appendChild(texto);
        item.appendChild(horario);


        if (
            mensagem.remetente.toLowerCase() ===
            meuUsuario.toLowerCase()
        ) {

            item.classList.add(
                "mensagem-minha"
            );

        } else {

            item.classList.add(
                "mensagem-outro"
            );
        }


        listaMensagens.appendChild(item);
    });


    const areaMensagens =
        document.querySelector(
            ".mensagens-area"
        );

    areaMensagens.scrollTop =
        areaMensagens.scrollHeight;
}


function atualizarDestaqueUsuarios() {

    const itens =
        document.querySelectorAll(
            "#listaUsuarios li"
        );

    itens.forEach(function (item) {

        const nomeUsuario =
            item.dataset.usuario;

        item.classList.remove(
            "usuario-nao-lido"
        );

        if (
            mensagensNaoLidas[
            nomeUsuario
            ]
        ) {
            item.classList.add(
                "usuario-nao-lido"
            );
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

function atualizarStatusDestinatario() {

    if (!destinatarioSelecionado) {
        return;
    }

    const estaOnline =
        usuariosOnline.some(function (usuario) {

            return usuario.nome.toLowerCase() ===
                destinatarioSelecionado.toLowerCase()
                && usuario.online;
        });

    const status =
        document.getElementById(
            "statusDestinatario"
        );

    if (estaOnline) {

        status.textContent =
            "● online";

        status.classList.remove(
            "status-offline"
        );

        status.classList.add(
            "status-online-destinatario"
        );

    } else {

        status.textContent =
            "● offline";

        status.classList.remove(
            "status-online-destinatario"
        );

        status.classList.add(
            "status-offline"
        );
    }
}
