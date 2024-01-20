import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('La clé secrète Stripe est manquante dans les variables d\'environnement');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  
});




