import '../styles/globals.css';

// This is the root component that wraps all pages
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
