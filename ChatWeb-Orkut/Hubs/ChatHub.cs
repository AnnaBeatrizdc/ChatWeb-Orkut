using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace ChatWeb.Hubs
{
    public class ChatHub : Hub
    {
        private static readonly ConcurrentDictionary<string, string>
            usuariosConectados = new();

        public async Task ConectarUsuario(string nomeUsuario)
        {
            nomeUsuario = nomeUsuario.Trim();

            if (string.IsNullOrWhiteSpace(nomeUsuario))
            {
                return;
            }

            usuariosConectados[Context.ConnectionId] = nomeUsuario;

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
            usuariosConectados.TryRemove(
                Context.ConnectionId,
                out _
            );

            await AtualizarListaUsuarios();

            await base.OnDisconnectedAsync(exception);
        }

        private async Task AtualizarListaUsuarios()
        {
            List<string> usuarios =
                usuariosConectados
                    .Values
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .OrderBy(nome => nome)
                    .ToList();

            await Clients.All.SendAsync(
                "AtualizarUsuarios",
                usuarios
            );
        }
    }
}