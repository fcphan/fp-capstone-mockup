// import bodyParser from 'body-parser';
import express from 'express';
import {pool} from './db';
import cors from 'cors';
import Stripe from "stripe"
import { CartItem, TicketData } from "../src/features/cart/cartSlice"
import { CheckoutFormInfo } from "../src/components/CompleteOrderForm"

let stripe = new Stripe(process.env.PRIVATE_STRIPE_KEY, {apiVersion: "2020-08-27"})

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// function getUser(req: Request, res: Response) {
//     const id = req.params.id;
//     res.send({express: `Requested data for user ID: ${id}`});
// };

// app.get('/api/users/:id', getUser);

// function postMessages(req: Request, res: Response) {
//     console.log(`I received your POST request. This is what you sent me: ${req.body.post}`)
//     res.send(
//         `I received your POST request. This is what you sent me: ${req.body.post}`
//     );
// };
// app.post('/api/messages', postMessages);

//TODO: find a way to hide api calls like this behind some kind of auth
app.get('/api/doorlist', async (req, res) => {
    try{
        const doorlist = await pool.query("SELECT * FROM exdoorlist");
        res.json(doorlist.rows);
    }
    catch(err) {
        console.error(err.message);
    }
});

app.post('/api/newsletter/count', async (req, res) => {
    try
    {
        const emails = await pool.query("SELECT COUNT(*) FROM customers WHERE email = $1", [req.body.email]);
        res.json(emails.rows);
    }
    catch(err)
    {
        console.error(err.message);
    }
});

app.post('/api/newsletter/update', async (req, res) => {
    try
    {
        var body = req.body;
        var values = [body.news_opt, body.volunteer_opt, body.email];
        const rows = await pool.query("UPDATE public.customers\
            SET newsletter=$1, \"volunteer list\"=$2\
            WHERE email = $3;", values);
        res.json(rows.rows);
    }
    catch(err)
    {
        console.error(err.message);
    }
});

app.post('/api/newsletter/insert', async (req, res) => {
    try
    {
        var body = req.body;
        var values = [body.custname, body.email,
                      body.phone, body.custaddress, body.news_opt,
                      false, false, false, body.volunteer_opt];
        const emails = await pool.query("INSERT INTO public.customers(\
            custname, email, phone, custaddress, newsletter, donorbadge, seatingaccom, vip, \"volunteer list\")\
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);", values);
        res.json(emails.rows);
    }
    catch(err)
    {
        console.error(err.message);
    }
});

// TODO: when we add confirmation emails we can do it like this:
// https://stripe.com/docs/payments/checkout/custom-success-page
app.post('/api/checkout', async (req, res) => {
    // TODO: NOT DO IT THIS WAY!!!
    // right now it gets the price info from the request made by the client.
    // THIS IS WRONG it needs to look up the price in the database given
    // the id of the show/event/whatever. PRICES CANNOT COME FROM CLIENTS!!
    const data: CartItem<TicketData>[] = req.body.cartItems;
    // TODO: submit form data to DB
    const formData: CheckoutFormInfo = req.body.formData;
    console.log(formData);
    const donation: number = req.body.donation
    const donationItem = {
        price_data: {
            currency: "usd",
            product_data: {
                name: "Donation",
                description: "A generous donation"
            },
            // the price here needs to be fetched from the DB instead
            unit_amount: donation * 100
        },
        quantity: 1
    }
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        //this is the offending area all this stuff needs to be replaced by info from DB based on play ID or something
        line_items: data.map(item => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.name,
                    description: item.description
                },
                // the price here needs to be fetched from the DB instead
                unit_amount: item.unitPrice * 100
            },
            quantity: item.quantity
        })).concat(donationItem),
        mode: "payment",
        success_url: "http://localhost:3000/success",
        cancel_url: "http://localhost:3000",
    })
    res.json({id: session.id})
});

// tslint:disable-next-line:no-console
app.listen(port, () => console.log(`Listening on port ${port}`));
