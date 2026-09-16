import './styles.css';

const portfolio = document.querySelector<HTMLElement>('#portfolio');

if (portfolio) {
  portfolio.dataset.palette = document.documentElement.dataset.palette ?? 'dark';
}
