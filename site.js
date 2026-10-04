const chefButtons = document.querySelectorAll('.chef-select');
const fireChefName = document.querySelector('#fire-chef-name');

document.querySelectorAll('.character-card').forEach((card) => {
  const front = card.querySelector('.character-card-front');
  const back = card.querySelector('.character-card-back');
  back.inert = true;

  card.querySelectorAll('.card-flip-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const flipped = !card.classList.contains('is-flipped');
      card.classList.toggle('is-flipped', flipped);
      front.inert = flipped;
      back.inert = !flipped;
      front.setAttribute('aria-hidden', String(flipped));
      back.setAttribute('aria-hidden', String(!flipped));
      card.querySelectorAll('.card-flip-toggle').forEach((toggle) => {
        toggle.setAttribute('aria-expanded', String(flipped));
      });
      if (flipped) card.querySelector('.character-card-back .card-flip-toggle').focus();
      else card.querySelector('.character-card-front .card-flip-toggle').focus();
    });
  });
});

chefButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const selectedCard = button.closest('.character-card');
    const chefName = button.dataset.name;

    document.querySelectorAll('.character-card').forEach((card) => {
      const isSelected = card === selectedCard;
      card.classList.toggle('is-selected', isSelected);

      const cardButton = card.querySelector('.chef-select');
      cardButton.setAttribute('aria-pressed', String(isSelected));
      cardButton.innerHTML = isSelected
        ? 'At the fire <span aria-hidden="true">✓</span>'
        : `Choose ${cardButton.dataset.name} <span aria-hidden="true">↗</span>`;
    });

    fireChefName.textContent = chefName;
  });
});
