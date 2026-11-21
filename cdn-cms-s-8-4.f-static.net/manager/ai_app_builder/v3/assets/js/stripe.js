const links = Object.freeze({
  "1": "https://buy.stripe.com/cNi00c6Rpfv991TbjwdjO02",
  "2": "https://buy.stripe.com/bJebIUb7F2Indi9fzMdjO0a",
  "3": "https://buy.stripe.com/9B64gs8ZxaaP0vndrEdjO09",
  "4": "https://buy.stripe.com/5kQ9AM6Rper5ba1drEdjO08",
  "5": "https://buy.stripe.com/8x214g8Zx5UzgulbjwdjO07"
});

function getStripeLink(key) {
  return links[String(key)] || null;
}

function goTo(key) {
  const destination = getStripeLink(key);
  if (destination) {
    window.location.replace(destination);
    return true;
  } else {
    console.error("Redirect key not found:", key);
    return false;
  }
}