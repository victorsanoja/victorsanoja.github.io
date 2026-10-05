// El email y el teléfono no están escritos en la página hasta que alguien pulsa: así los bots que leen el HTML no los recogen.
export function iniciarContacto() {
  const alReves = (t) => [...t].reverse().join('');
  document.querySelectorAll('.reveal').forEach((b) => b.addEventListener('click', () => {
    const a = document.createElement('a');
    if (b.dataset.kind === 'email') {
      const v = alReves(b.dataset.a) + '@' + alReves(b.dataset.b);
      a.href = 'mailto:' + v;
      a.textContent = v;
    } else {
      const v = alReves(b.dataset.a) + alReves(b.dataset.b);
      a.href = 'tel:+34' + v;
      a.textContent = v.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
    }
    b.replaceWith(a);
    a.focus();
  }, { passive: true }));
}
