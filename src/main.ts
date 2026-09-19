import './styles.css';
import './decks.css';
import './cards.css';
import { initPortfolio } from './interactions';
import { initExperience } from './experience';
import { initDecks } from './decks';
import { initCards } from './cards';

const portfolio = document.querySelector<HTMLElement>('#portfolio');

if (portfolio) {
  portfolio.dataset.palette = document.documentElement.dataset.palette ?? 'dark';
  initDecks(portfolio);
  initPortfolio(portfolio);
  initExperience(portfolio);
  initCards(portfolio);
}
