import express from 'express';
import { stripe } from './stripe.config';
import { PaymentIntent } from './stripe.interface';

const app = express();
app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
  const { amount, currency, paymentMethodType }: PaymentIntent = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: [paymentMethodType],
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});

