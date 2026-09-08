using ChatWeb.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Adiciona Razor Pages
builder.Services.AddRazorPages();

// Adiciona SignalR
builder.Services.AddSignalR();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();

// Permite acessar arquivos da pasta wwwroot
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

// Mapeia as páginas
app.MapRazorPages();

// Mapeia o Hub do SignalR
app.MapHub<ChatHub>("/chatHub");

app.Run();