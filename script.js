// Menú móvil
const nav = document.getElementById('nav');
const toggle = document.getElementById('navToggle');
const setMenu = open => {
  nav.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', open);
  toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
};
toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
document.querySelectorAll('#navMenu a').forEach(a => a.addEventListener('click', () => setMenu(false)));

// Sombra del nav al hacer scroll
const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 10);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Enlace activo según la sección visible
const links = [...document.querySelectorAll('#navMenu a:not(.btn)')];
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(l => l.classList.toggle('is-current', l.getAttribute('href') === '#' + e.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
links.forEach(l => {
  const s = document.querySelector(l.getAttribute('href'));
  if (s) sectionObserver.observe(s);
});

// Pestañas de IA
const tabs = document.querySelectorAll('.ai__tab');
const panels = document.querySelectorAll('.ai__panel');
tabs.forEach(tab =>
  tab.addEventListener('click', () => {
    const i = Number(tab.dataset.tab);
    tabs.forEach((t, j) => {
      t.classList.toggle('is-active', j === i);
      t.setAttribute('aria-selected', j === i);
    });
    panels.forEach((p, j) => p.classList.toggle('is-active', j === i));
  })
);

// Animación de aparición
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Formulario de contacto (abre el cliente de correo con los datos)
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
form.addEventListener('submit', e => {
  e.preventDefault();
  let ok = true;
  form.querySelectorAll('[required]').forEach(f => {
    const valid = f.value.trim() && (f.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value));
    f.classList.toggle('is-invalid', !valid);
    if (!valid) ok = false;
  });
  if (!ok) {
    status.textContent = 'Por favor complete los campos obligatorios.';
    return;
  }
  const d = Object.fromEntries(new FormData(form));
  const body = `Nombre: ${d.nombre}\nEmpresa: ${d.empresa}\nCorreo: ${d.correo}\nTeléfono: ${d.telefono}\nProyecto: ${d.tipo}\n\n${d.mensaje}`;
  // TODO: reemplazar por el correo real o conectar a un servicio de formularios
  window.location.href = `mailto:contacto@marvicatta9.net?subject=${encodeURIComponent('Solicitud de asesoría: ' + d.tipo)}&body=${encodeURIComponent(body)}`;
  status.textContent = 'Gracias. Se abrirá su aplicación de correo para enviar la solicitud.';
  form.reset();
});

document.getElementById('year').textContent = new Date().getFullYear();
