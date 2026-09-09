# 💬 Chat Web — Orkut 2.0

Projeto acadêmico desenvolvido como **Fase 2 do Desafio de Chat de Mensagens**, com o objetivo de transformar a aplicação desktop criada anteriormente em uma aplicação web capaz de realizar comunicação em tempo real.

A interface foi inspirada no **Orkut**, trazendo uma identidade visual em tons de azul e rosa, mas com uma aparência mais atual.

---

## 📌 Sobre o projeto

Na primeira fase, o chat foi desenvolvido em **C# com Windows Forms e comunicação UDP**, funcionando entre computadores de uma mesma rede local.

Nesta segunda fase, o projeto foi adaptado para a Web utilizando **ASP.NET Core, Razor Pages e SignalR**.

Com isso, os usuários podem acessar o chat através do navegador e trocar mensagens em tempo real, inclusive estando em redes diferentes quando a aplicação está hospedada.

---

## 🚀 Funcionalidades

- Tela de entrada com nome de usuário
- Comunicação em tempo real com SignalR
- Lista de usuários online
- Atualização automática da lista de usuários
- Conversas privadas entre usuários
- Conversas separadas por usuário
- Histórico das mensagens durante a sessão
- Horário das mensagens
- Aviso de nova mensagem
- Destaque da conversa selecionada
- Identificação visual de mensagens enviadas e recebidas
- Remoção automática do usuário da lista ao desconectar
- Interface responsiva
- Interface inspirada no Orkut
- Aplicação publicada na Web

---

## 🛠️ Tecnologias utilizadas

- C#
- ASP.NET Core
- Razor Pages
- SignalR
- JavaScript
- HTML
- CSS
- Git
- GitHub
- Render

---

## 🧠 Como funciona

O projeto utiliza o **SignalR** para permitir a comunicação em tempo real entre o navegador e o servidor ASP.NET Core.

Quando um usuário entra no chat, o navegador estabelece uma conexão com o `ChatHub`.

O servidor associa o nome escolhido pelo usuário ao seu `ConnectionId`, identificador criado pelo SignalR para cada conexão.

```text
Usuário
   ↓
Navegador
   ↓
JavaScript
   ↓
SignalR
   ↓
ChatHub.cs
   ↓
Servidor ASP.NET Core
```

### 👤 Usuários conectados

Os usuários conectados são armazenados no servidor utilizando um `ConcurrentDictionary`.

Cada conexão relaciona:

```text
ConnectionId → Nome do usuário
```

Sempre que alguém entra ou sai, o servidor envia uma nova lista de usuários para todos os clientes conectados.

---

## 💌 Envio de mensagens

Ao selecionar um usuário e enviar uma mensagem:

1. O navegador envia as informações para o `ChatHub`.
2. O servidor procura o `ConnectionId` do destinatário.
3. O SignalR envia a mensagem somente para a conexão correspondente.
4. O navegador do destinatário recebe a mensagem em tempo real.
5. A interface atualiza a conversa.

A comunicação privada é realizada no servidor através do método:

```csharp
EnviarMensagemPrivada()
```

E o envio para o cliente utiliza:

```csharp
Clients.Client(...).SendAsync(...)
```

---

## 🟢 Conexão e desconexão

Quando um usuário entra, o método:

```csharp
ConectarUsuario()
```

registra sua conexão e atualiza a lista de usuários.

Quando a conexão é encerrada, o SignalR executa:

```csharp
OnDisconnectedAsync()
```

O usuário é removido da lista e os demais clientes recebem automaticamente a lista atualizada.

---

## 📂 Estrutura principal

```text
ChatWeb
│
├── Hubs
│   └── ChatHub.cs
│
├── Pages
│   ├── Index.cshtml
│   ├── Index.cshtml.cs
│   ├── Chat.cshtml
│   ├── Chat.cshtml.cs
│   │
│   └── Shared
│       └── _Layout.cshtml
│
├── wwwroot
│   ├── css
│   │   ├── site.css
│   │   ├── login.css
│   │   └── chat.css
│   │
│   └── js
│       └── chat.js
│
└── Program.cs
```

---

## 🖥️ Interface

### Tela de entrada

> Adicionar aqui uma imagem da tela de login.

```markdown
![Tela de Login](./imagens/login.png)
```

### Tela principal do chat

> Adicionar aqui uma imagem da tela principal.

```markdown
![Tela do Chat](./imagens/chat.png)
```

### Conversa entre usuários

> Adicionar aqui uma imagem mostrando dois usuários conversando.

```markdown
![Conversa](./imagens/conversa.png)
```

---

## 🌐 Publicação

A aplicação foi publicada utilizando o **Render** e integrada ao repositório do GitHub.

Dessa forma, a aplicação ASP.NET Core é executada em um servidor web e pode ser acessada através do navegador.

Isso permite que usuários em **redes diferentes** utilizem o chat, diferentemente da primeira fase, que dependia da comunicação pela rede local.

---

## 🔄 Evolução da Fase 1 para a Fase 2

| Fase 1 | Fase 2 |
|---|---|
| Windows Forms | Aplicação Web |
| C# Desktop | ASP.NET Core |
| UDP | SignalR |
| Rede local | Internet/Web |
| Interface WinForms | HTML + CSS + Razor |
| Cliente desktop | Navegador |
| Servidor executado localmente | Servidor hospedado na Web |

---

## 🎨 Identidade visual

A interface foi desenvolvida com inspiração no **Orkut**, utilizando principalmente tons de:

- 🩷 Rosa
- 🩵 Azul
- 🤍 Branco
- 🩶 Cinza claro

A proposta foi manter características visuais que remetessem à antiga rede social, mas adaptadas para uma interface de chat moderna.

---

## 👨‍💻 Desenvolvedores

Projeto desenvolvido para fins acadêmicos por:

**Ana Beatriz Dantas Conceição**  
**Eduardo Paiva**

---

## 🎓 Projeto acadêmico

Este projeto foi desenvolvido como parte de uma atividade acadêmica envolvendo desenvolvimento em **C#**, comunicação entre aplicações e adaptação de uma solução desktop para ambiente Web.

A Fase 2 teve como principal objetivo permitir a comunicação entre usuários através da internet utilizando tecnologias do ecossistema .NET.
