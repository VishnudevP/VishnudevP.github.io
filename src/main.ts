import './styles.css';
import { initPortfolio } from './interactions';
import { initExperience } from './experience';

const portfolio = document.querySelector<HTMLElement>('#portfolio');

if (portfolio) {
  portfolio.dataset.palette = document.documentElement.dataset.palette ?? 'dark';
  initPortfolio(portfolio);
  initExperience(portfolio);
}
