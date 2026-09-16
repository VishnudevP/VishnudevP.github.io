import './styles.css';
import { initPortfolio } from './interactions';

const portfolio = document.querySelector<HTMLElement>('#portfolio');

if (portfolio) {
  portfolio.dataset.palette = document.documentElement.dataset.palette ?? 'dark';
  initPortfolio(portfolio);
}
