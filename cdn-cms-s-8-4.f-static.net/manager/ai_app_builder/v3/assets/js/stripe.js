const links = Object.freeze({
  "1": "https://buy.stripe.com/cNi00c6Rpfv991TbjwdjO02",
  "2": "https://buy.stripe.com/8x26oA1x51Ej3HzafsdjO03",
  "3": "https://buy.stripe.com/5kQfZa6Rp2InfqhafsdjO04",
  "4": "https://buy.stripe.com/dRm6oAa3B3Mremd4V8djO05",
  "5": "https://buy.stripe.com/5kQdR2grZaaP5PH2N0djO06"
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