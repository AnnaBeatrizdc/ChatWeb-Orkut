// =========================
// MODO CLARO / ESCURO
// =========================

document.addEventListener("DOMContentLoaded", function () {

    const btnTema = document.getElementById("btnTema");
    const iconeTema = document.getElementById("iconeTema");

    if (!btnTema || !iconeTema) {
        return;
    }

    function aplicarTema(tema) {

        const modoEscuro = tema === "escuro";

        document.body.classList.toggle(
            "tema-escuro",
            modoEscuro
        );

        iconeTema.textContent =
            modoEscuro ? "☀️" : "🌙";
    }

    const temaSalvo =
        localStorage.getItem("temaChat") || "claro";

    aplicarTema(temaSalvo);

    btnTema.addEventListener("click", function () {

        const estaEscuro =
            document.body.classList.contains("tema-escuro");

        const novoTema =
            estaEscuro ? "claro" : "escuro";

        aplicarTema(novoTema);

        localStorage.setItem(
            "temaChat",
            novoTema
        );
    });
});