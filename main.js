// TapIdea — Orb do hero e formulário da lista do beta.

// Endereço do Google Apps Script que grava na planilha (ver README.md, "Lista do beta").
// Vazio: o formulário avisa que ainda não está configurado.
const WAITLIST_URL =
  'https://script.google.com/macros/s/AKfycbyEIEKa6cyIAmTroVXpdFVQrcmoNuRnKOvxRHMTfzWtXgOM44YNEFbGZvCIP25eU9ly2g/exec';

// ---------------------------------------------------------------------------
// Orb: a mesma esfera pontilhada (dither Bayer 4x4) do app, com a luz girando devagar.

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

function startOrb(canvas) {
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cells = 42;
  let visible = true;
  let frame = 0;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const size = canvas.clientWidth || 420;
    canvas.width = Math.round(size * ratio);
    canvas.height = Math.round(size * ratio);
  }

  function draw(time) {
    const w = canvas.width;
    const step = w / cells;
    const t = time / 1000;
    // Direção da luz e "respiração" do brilho, como o Orb ouvindo.
    const lx = Math.cos(t * 0.35) * 0.45 - 0.2;
    const ly = Math.sin(t * 0.27) * 0.35 - 0.35;
    const breath = 0.06 * Math.sin(t * 1.6) + 0.04 * Math.sin(t * 2.7);
    const radius = 0.74 + breath * 0.25;

    ctx.clearRect(0, 0, w, w);
    ctx.fillStyle = '#F5B32E';
    for (let j = 0; j < cells; j++) {
      for (let i = 0; i < cells; i++) {
        const nx = ((i + 0.5) / cells) * 2 - 1;
        const ny = ((j + 0.5) / cells) * 2 - 1;
        const r = Math.hypot(nx, ny) / radius;
        let v = 0;
        if (r <= 1) {
          const nz = Math.sqrt(1 - r * r);
          v = 0.18 + 0.82 * Math.max(0, nz * 0.55 + (nx / radius) * lx + (ny / radius) * ly + 0.25 + breath);
        } else if (r < 1.3) {
          v = (0.3 * (1.3 - r)) / 0.3;
        }
        const threshold = (BAYER[j % 4][i % 4] + 0.5) / 16;
        if (v > threshold) {
          const gap = step * 0.22;
          ctx.fillRect(i * step + gap / 2, j * step + gap / 2, step - gap, step - gap);
        }
      }
    }
  }

  function loop(time) {
    draw(time);
    if (visible && !reduced.matches) frame = requestAnimationFrame(loop);
  }

  function restart() {
    cancelAnimationFrame(frame);
    if (reduced.matches) draw(4000);
    else if (visible) frame = requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener('resize', () => {
    resize();
    restart();
  });
  reduced.addEventListener('change', restart);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      restart();
    }).observe(canvas);
  }
  restart();
}

// ---------------------------------------------------------------------------
// Lista do beta.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function startWaitlist(form) {
  const status = form.querySelector('#form-status');
  const email = form.querySelector('#f-email');
  const consent = form.querySelector('#f-ok');
  const button = form.querySelector('button[type="submit"]');

  function say(text, kind) {
    status.textContent = text;
    status.className = `status ${kind}`;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const value = email.value.trim();

    if (!EMAIL.test(value)) {
      email.setAttribute('aria-invalid', 'true');
      email.focus();
      say('Confira o e-mail: parece que falta alguma coisa.', 'error');
      return;
    }
    email.removeAttribute('aria-invalid');
    if (!consent.checked) {
      consent.focus();
      say('Marque a caixa para podermos mandar o convite.', 'error');
      return;
    }
    if (!WAITLIST_URL) {
      say('A lista ainda não está aberta. Volte em breve!', 'error');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const data = new URLSearchParams({
      nome: form.nome.value.trim(),
      email: value,
      uso: form.uso.value,
      empresa: form.empresa.value,
      origem: params.get('utm_source') || document.referrer || 'direto',
    });

    button.disabled = true;
    say('Enviando…', '');
    try {
      // O Apps Script não devolve CORS legível: "no-cors" envia e não lê a resposta.
      await fetch(WAITLIST_URL, { method: 'POST', mode: 'no-cors', body: data });
      form.reset();
      say('Pronto! Você está na lista. O convite chega por e-mail.', 'ok');
    } catch {
      say('Não deu para enviar agora. Confira a internet e tente de novo.', 'error');
    } finally {
      button.disabled = false;
    }
  });
}

const orb = document.getElementById('orb');
if (orb) startOrb(orb);
const waitlist = document.getElementById('waitlist');
if (waitlist) startWaitlist(waitlist);
