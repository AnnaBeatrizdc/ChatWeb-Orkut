using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace ChatWeb.Hubs
{
    public class ChatHub : Hub
    {
        private static readonly ConcurrentDictionary<string, string> usuariosConectados = new();

        private static readonly ConcurrentDictionary<string, bool> statusUsuarios = new(StringComparer.OrdinalIgnoreCase);

        public async Task ConectarUsuario(string nomeUsuario)
        {
            nomeUsuario = nomeUsuario.Trim();

            if (string.IsNullOrWhiteSpace(nomeUsuario))
            {
                return;
            }

            usuariosConectados[Context.ConnectionId] = nomeUsuario;
            statusUsuarios[nomeUsuario] = true;

            await AtualizarListaUsuarios();
        }

        public async Task EnviarMensagemPrivada(
            string remetente,
            string destinatario,
            string mensagem)
        {
            var conexaoDestinatario =
                usuariosConectados
                    .FirstOrDefault(x =>
                        x.Value.Equals(
                            destinatario,
                            StringComparison.OrdinalIgnoreCase
                        )
                    );

            if (!string.IsNullOrEmpty(conexaoDestinatario.Key))
            {
                await Clients
                    .Client(conexaoDestinatario.Key)
                    .SendAsync(
                        "ReceberMensagem",
                        remetente,
                        mensagem
                    );
            }
        }

        public override async Task OnDisconnectedAsync(
            Exception? exception)
        {
            if (usuariosConectados.TryRemove(Context.ConnectionId,out string? nomeUsuario))
            {
                statusUsuarios[nomeUsuario] = false;
            }

            await AtualizarListaUsuarios();

            await base.OnDisconnectedAsync(exception);
        }

        private async Task AtualizarListaUsuarios()
        {
            var usuarios = statusUsuarios
                .Select(usuario => new
                {
                    nome = usuario.Key,
                    online = usuario.Value
                })
                .OrderBy(usuario => usuario.nome)
                .ToList();

            await Clients.All.SendAsync(
                "AtualizarUsuarios",
                usuarios
            );
        }
    }
}