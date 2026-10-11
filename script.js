/* ===== CONFIGURACIÓN: aquí se cambian los datos del negocio ===== */
const CONFIG = {
  // Número con código de país, solo dígitos, sin "+" ni espacios.
  // Ejemplo Colombia: "573001234567"
  whatsapp: "573132505985",
  nombreNegocio: "FIXAL",
  // Horario de citas, en formato 24 h
  horaInicio: 8,
  horaFin: 17
};

/* ===== Funciones de ayuda ===== */
function enlaceWhatsApp(mensaje) {
  return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(mensaje);
}

function formatoHora(h) {
  const sufijo = h < 12 ? "a. m." : "p. m.";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return h12 + ":00 " + sufijo;
}

// "2026-10-15" se convierte en "15/10/2026"
function formatoFecha(iso) {
  const [a, m, d] = iso.split("-");
  return d + "/" + m + "/" + a;
}

function hoyISO() {
  const f = new Date();
  const mes = String(f.getMonth() + 1).padStart(2, "0");
  const dia = String(f.getDate()).padStart(2, "0");
  return f.getFullYear() + "-" + mes + "-" + dia;
}

/* ===== Enlaces generales a WhatsApp (pie, botón flotante, contacto) ===== */
document.querySelectorAll("[data-wa]").forEach(function (a) {
  a.href = enlaceWhatsApp("Hola " + CONFIG.nombreNegocio + ", quisiera información sobre sus servicios.");
  a.target = "_blank";
  a.rel = "noopener";
});

/* ===== Año del pie de página ===== */
document.getElementById("anio").textContent = new Date().getFullYear();

/* ===== Formulario de citas ===== */
const form = document.getElementById("form-cita");
const campoFecha = document.getElementById("fecha");
const campoHora = document.getElementById("hora");
const estado = document.getElementById("estado");

campoFecha.min = hoyISO();

for (let h = CONFIG.horaInicio; h < CONFIG.horaFin; h++) {
  const op = document.createElement("option");
  op.value = formatoHora(h);
  op.textContent = formatoHora(h);
  campoHora.appendChild(op);
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  estado.className = "estado";
  estado.textContent = "";

  if (!form.checkValidity()) {
    form.reportValidity();
    estado.classList.add("error");
    estado.textContent = "Revise los campos marcados: faltan datos o la fecha no es válida.";
    return;
  }

  const datos = new FormData(form);
  const lineas = [
    "Hola " + CONFIG.nombreNegocio + ", quiero agendar una cita.",
    "",
    "Nombre: " + datos.get("nombre").trim()
  ];
  const empresa = datos.get("empresa").trim();
  if (empresa) lineas.push("Empresa: " + empresa);
  lineas.push("Servicio: " + datos.get("servicio"));
  lineas.push("Fecha: " + formatoFecha(datos.get("fecha")));
  lineas.push("Hora: " + datos.get("hora"));
  const detalle = datos.get("detalle").trim();
  if (detalle) lineas.push("Detalle: " + detalle);

  const url = enlaceWhatsApp(lineas.join("\n"));
  const ventana = window.open(url, "_blank");
  if (ventana) ventana.opener = null;

  // Si el navegador bloquea la ventana, ofrecemos un enlace manual
  estado.textContent = "";
  estado.append(
    ventana ? "Abrimos WhatsApp con su solicitud. Presione enviar allí para confirmar. " : "No se pudo abrir WhatsApp automáticamente. "
  );
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.target = "_blank";
  enlace.rel = "noopener";
  enlace.className = "enlace";
  enlace.textContent = "Abrir WhatsApp con mi solicitud";
  estado.append(enlace);
});
/* ===== Animaciones ===== */
const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Encabezado que se compacta al bajar */
const encabezado = document.querySelector(".encabezado");
function actualizarEncabezado() {
  encabezado.classList.toggle("encabezado--compacto", window.scrollY > 40);
}
window.addEventListener("scroll", actualizarEncabezado, { passive: true });
actualizarEncabezado();

/* Elementos que aparecen al hacer scroll */
if (!reducirMovimiento && "IntersectionObserver" in window) {
  const objetivos = document.querySelectorAll(
    ".seccion h2, .seccion .intro, .servicio, .caso, .valor, .agenda__texto, .form, .pie__interior"
  );

  const observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visible");
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.15 });

  objetivos.forEach(function (el) {
    const hermanos = Array.from(el.parentElement.children);
    el.style.animationDelay = (hermanos.indexOf(el) % 4) * 0.1 + "s";
    el.classList.add("revelar");
    observador.observe(el);
  });
}