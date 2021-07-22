import { useState, useEffect } from "react";
import "./App.css";
import { ThemeProvider } from '@material-ui/core/styles';
import { theme } from './theme'
import ShowingsPage from "./components/ShowingsPage";
import CheckoutPage from "./components/CheckoutPage";
import DoorList from "./components/DoorList";

import CssBaseline from '@material-ui/core/CssBaseline';
import AdminPannel from "./features/admin/AdminPanel";
import EmailSubscriptions from "./features/admin/EmailSubscriptions";
import Navbar from './app/Navbar';
import {
     Switch,
     Route,
     Redirect,
} from 'react-router-dom';
import Cart from './features/cart/Cart';
import NewsletterCreate from "./features/newsletter/NewsletterCreate";
import NewsletterSignup from "./features/newsletter/NewsletterSignup";
import CheckoutSuccess from "./components/CheckoutSuccess";
import { Container } from "@material-ui/core";
import Snackbar from "@material-ui/core/Snackbar";
import { useAppDispatch, appSelector } from './app/hooks'
import { closeSnackbar, selectSnackbar } from "./features/snackbarSlice"

import AllEventsPage from './features/events/AllEventsPage'
import EventPage from "./features/events/EventPage"
import CreateEvents from "./components/CreateEvents";
import DeleteEvents from "./components/DeleteEvents";
import { fetchEventData } from "./features/events/eventsSlice";

import LoginPage from "./components/LoginPage";

function App() {

    const dispatch = useAppDispatch()
    const snackbarState = appSelector(selectSnackbar)
    const eventsStatus = appSelector(state => state.events.status)

    useEffect(() => {
        if(eventsStatus === 'idle') {
            dispatch(fetchEventData())
        }
    }, [dispatch])

    const onSnackbarClose = (_: React.SyntheticEvent | React.MouseEvent, reason?: string) => {
        if (reason === 'clickaway') return;
        dispatch(closeSnackbar())
    }

    return (
        <Container maxWidth="md">
            <ThemeProvider theme={theme}>
                <div id="maincontainer">
                    <Navbar />
                    <Switch>
                        <Route path="/events/:name">
                            <EventPage />
                        </Route>

                        <Route path="/success">
                            <CheckoutSuccess/>
                        </Route>

                        <Route path="/events">
                            <AllEventsPage />
                        </Route>

                        <Route path="/cart">
                            <Cart />
                        </Route>

                        <Route path="/completeorder">
                            <CheckoutPage/>
                        </Route>

                        <Route path="/CreateEvents">
                            <CreateEvents />
                        </Route>

                        <Route path="/DeleteEvents">
                            <DeleteEvents />
                        </Route>

                        <Route path="/admin/newsletter_create">
                            <NewsletterCreate />
                        </Route>
                        <Route path="/newsletter_signup">
                            <NewsletterSignup />
                        </Route>

                        <Route path="/admin/admin-panel">
                            <AdminPannel />
                        </Route>
                        <Route path="/admin/email_subscriptions">
                            <EmailSubscriptions />
                        </Route>

                        <Route path="/doorlist/:showid">
                            <DoorList />
                        </Route>

                        <Route exact path="/" >
                            <CssBaseline />
                            <ShowingsPage />
                        </Route>

                        <Route path="/login/:redirect?" >
                            <LoginPage />
                        </Route>
                        <Redirect to="/" />
                    </Switch>
                </div>
                <Snackbar
                    anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                    }}
                    open={snackbarState.shown}
                    autoHideDuration={6000}
                    onClose={onSnackbarClose}
                    message={snackbarState.message}/>
            </ThemeProvider>
        </Container>
    );
}

export default App;
