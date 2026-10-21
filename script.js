document.addEventListener("DOMContentLoaded", () => {
    const carrossel = document.querySelector(
        "#profissionais .carrossel-profissionais"
    );

    if (!carrossel) return;

    const palco = carrossel.querySelector(".palco-profissionais");
    const anterior = carrossel.querySelector(".anterior");
    const proxima = carrossel.querySelector(".proxima");

    if (!palco || !anterior || !proxima) {
        console.error("Confira as classes do HTML do carrossel.");
        return;
    }

    const profissionais = Array.from(
        palco.querySelectorAll(".card-profissional")
    );

    if (profissionais.length < 2) return;

    const trilho = document.createElement("div");
    trilho.className = "trilho-profissionais";

    const cloneUltima = profissionais[
        profissionais.length - 1
    ].cloneNode(true);

    const clonePrimeira = profissionais[0].cloneNode(true);

    trilho.appendChild(cloneUltima);

    profissionais.forEach((card) => {
        trilho.appendChild(card);
    });

    trilho.appendChild(clonePrimeira);
    palco.replaceChildren(trilho);

    let indice = 0;
    let intervalo = null;
    let emTransicao = false;

    function atualizarDestaque() {
        Array.from(trilho.children).forEach((card) => {
            card.classList.remove("ativo");
        });

        const cardAtivo = trilho.children[indice + 1];

        if (cardAtivo) {
            cardAtivo.classList.add("ativo");
        }
    }

    function posicionar(animar) {
        const card = trilho.children[indice + 1];

        if (!card) return;

        const larguraCard = card.getBoundingClientRect().width;

        const centroPalco =
            palco.getBoundingClientRect().left +
            palco.clientWidth / 2;

        const centroCard =
            card.getBoundingClientRect().left +
            larguraCard / 2;

        const correspondencia = trilho.style.transform.match(
            /translateX\(([-\d.]+)px\)/
        );

        const deslocamentoAtual = correspondencia
            ? parseFloat(correspondencia[1])
            : 0;

        const deslocamento =
            deslocamentoAtual + centroPalco - centroCard;

        trilho.style.transition = animar
            ? "transform 0.55s ease-in-out"
            : "none";

        trilho.style.transform =
            "translateX(" + deslocamento + "px)";

        atualizarDestaque();
    }

    function mover(direcao) {
        if (emTransicao) return;

        emTransicao = true;
        indice += direcao;
        posicionar(true);
    }

    trilho.addEventListener("transitionend", (evento) => {
        if (
            evento.target !== trilho ||
            evento.propertyName !== "transform"
        ) {
            return;
        }

        if (indice >= profissionais.length) {
            indice = 0;
            posicionar(false);
        } else if (indice < 0) {
            indice = profissionais.length - 1;
            posicionar(false);
        }

        atualizarDestaque();
        void trilho.offsetWidth;

        emTransicao = false;
    });

    proxima.addEventListener("click", () => {
        pararAutomatico();
        mover(1);
        iniciarAutomatico();
    });

    anterior.addEventListener("click", () => {
        pararAutomatico();
        mover(-1);
        iniciarAutomatico();
    });

    function pararAutomatico() {
        clearInterval(intervalo);
    }

    function iniciarAutomatico() {
        pararAutomatico();

        intervalo = setInterval(() => {
            mover(1);
        }, 5000);
    }

    carrossel.addEventListener("mouseenter", pararAutomatico);
    carrossel.addEventListener("mouseleave", iniciarAutomatico);

    window.addEventListener("resize", () => {
        posicionar(false);
    });

    posicionar(false);
    iniciarAutomatico();
});


/* =========================================
   CARROSSEL DAS AVALIAÇÕES
   Movimento manual, um cartão por clique
   Sem rotação automática
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const secao = document.querySelector("#avaliacoes");

    if (!secao) return;

    const lista = secao.querySelector(".lista-avaliacoes");
    const anterior = secao.querySelector(".anterior-avaliacao");
    const proxima = secao.querySelector(".proxima-avaliacao");

    if (!lista || !anterior || !proxima) {
        console.error("Confira as classes do HTML das avaliações.");
        return;
    }

    let animando = false;

    function distanciaCartao() {
        const cartao = lista.querySelector(".cartao-avaliacao");

        if (!cartao) return 0;

        const estilos = getComputedStyle(lista);
        const gap = parseFloat(estilos.columnGap) || 0;

        return cartao.getBoundingClientRect().width + gap;
    }

    function avancar() {
        if (animando || lista.children.length < 2) return;

        animando = true;

        lista.style.transition = "transform 0.4s ease";
        lista.style.transform =
            `translateX(-${distanciaCartao()}px)`;
    }

    function voltar() {
        if (animando || lista.children.length < 2) return;

        animando = true;

        const ultimo = lista.lastElementChild;

        lista.style.transition = "none";
        lista.prepend(ultimo);

        lista.style.transform =
            `translateX(-${distanciaCartao()}px)`;

        void lista.offsetWidth;

        lista.style.transition = "transform 0.4s ease";
        lista.style.transform = "translateX(0)";
    }

    lista.addEventListener("transitionend", (evento) => {
        if (
            evento.target !== lista ||
            evento.propertyName !== "transform"
        ) {
            return;
        }

        const transformAtual = lista.style.transform;
        const deslocamento = transformAtual.match(
            /translateX\(([-\d.]+)px\)/
        );

        if (deslocamento && parseFloat(deslocamento[1]) < 0) {
            lista.style.transition = "none";
            lista.appendChild(lista.firstElementChild);
            lista.style.transform = "translateX(0)";
            void lista.offsetWidth;
        }

        animando = false;
    });

    proxima.addEventListener("click", avancar);
    anterior.addEventListener("click", voltar);
});

/* ==================================
   ANIMAÇÃO AO ROLAR A PÁGINA
================================== */


document.addEventListener("DOMContentLoaded", () => {
    const elementos = document.querySelectorAll(`
        .about .container-image,
        .about .row .content,
        .servicos .box,
        .cabecalho-avaliacoes,
        .cartao-avaliacao,
        .titulo-localizacao,
        .mapa-localizacao,
        .informacoes-localizacao,
        .rodape-container > div
    `);

    const movimentoReduzido = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (
        movimentoReduzido ||
        !("IntersectionObserver" in window)
    ) {
        elementos.forEach((elemento) => {
            elemento.classList.add("visivel");
        });
        return;
    }

    elementos.forEach((elemento) => {
        elemento.classList.add("animar-entrada");

        const grupo = elemento.parentElement;

        const elementosDoGrupo = grupo
            ? Array.from(grupo.children).filter((item) =>
                item.matches(`
                    .about .container-image,
                    .about .content,
                    .servicos .box,
                    #profissionais .card-profissional,
                    .cartao-avaliacao,
                    .rodape-container > div
                `)
            )
            : [];

        const posicao = elementosDoGrupo.indexOf(elemento);

        if (posicao >= 0) {
            elemento.style.setProperty(
                "--atraso",
                `${Math.min(posicao * 100, 300)}ms`
            );
        }
    });

    const observador = new IntersectionObserver(
        (entradas) => {
            entradas.forEach((entrada) => {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add("visivel");
                } else {
                    entrada.target.classList.remove("visivel");
                }
            });
        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -35px 0px"
        }
    );

    elementos.forEach((elemento) => {
        observador.observe(elemento);
    });
});

/* =========================================
   BOTÃO VER TODOS OS SERVIÇOS — CELULAR
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const secaoServicos = document.querySelector("#servicos");
    const botaoServicos = document.querySelector("#verServicos");

    if (!secaoServicos || !botaoServicos) return;

    botaoServicos.addEventListener("click", () => {
        const expandido = secaoServicos.classList.toggle(
            "servicos-expandido"
        );

        botaoServicos.textContent = expandido
            ? "Ver menos serviços"
            : "Ver todos os serviços";

        botaoServicos.setAttribute(
            "aria-expanded",
            String(expandido)
        );
    });
});






