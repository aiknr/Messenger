import React, { useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import axios from 'axios';
import { Helmet } from 'react-helmet';

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect,
    useHistory,
} from "react-router-dom";

import Signin from './Signin';
import EmailVerify from './EmailVerify';
import { hasInternetConnection } from './../util';


function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="https://material-ui.com/">
                Your Website
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(3),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

export default function SignUp() {
    const classes = useStyles();

    const history = useHistory();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNo, setPhoneNo] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [phoneNoError, setPhoneNoError] = useState('');
    const [passwordError, setpasswordError] = useState('');
    const [password2Error, setPassword2Error] = useState('');
    const [error, setError] = useState('');

    const clearAllError = () => {
        setNameError('');
        setEmailError('');
        setPhoneNoError('');
        setpasswordError('');
        setError('');
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!hasInternetConnection(true))return;

        clearAllError();
        if (isFormValid() === false) {
            return;
        }

        const baseUrl = 'http://localhost:3001/api/v1';
        //const baseUrl = 'http://f117216464b9.ngrok.io/api/v1';
        const data = {
            name: name,
            email: email,
            phoneNumber: phoneNo,
            password: password
        };
        const option = {
            method: 'post',
            url: `${baseUrl}/auth/account/verify`,
            data: data,
        };

        setIsLoading(true);
        try {
            const response = await axios(option);
            if (response.status === 200) {
                setIsLoading(false);
                history.push('/signup/email-verify', data);
                //window.location = '/signin';
            }
        } catch(error) {
            console.log(error);
            if(error.response.data) {
                console.log(error.response.data);
                findErrorFromResponse(error.response.data);
                setError(error.response.data);
            }
            setIsLoading(false);
        }
    }

    const findErrorFromResponse = (error) => {
        if (error.search(/name/i) > -1) {
            setNameError(error);
        }
        if (error.search(/email/i) > -1) {
            setEmailError(error);
        }
        if (error.search(/phone/i) > -1) {
            setPhoneNoError(error);
        }
    }

    function isFormValid() {
        if(name === '') {
            setNameError('Name field is required');
            return false;
        }

        if (email === '') {
            setEmailError('Email field is required');
            return false;
        }

        if(phoneNo === '') {
            setPhoneNoError('Phone number field is required');
            return false;
        }

        if(password === '') {
            setpasswordError('Password field is required');
            return false;
        }

        if (password !== password2) {
            setError('Password does not match');
            return false;
        }
        setError('');
        return true;
    }

    return (
        <Container component="main" maxWidth="xs">
            <Helmet>
                <title>Sign Up</title>
            </Helmet>
            <CssBaseline />
            <div className={classes.paper}>
                <Typography component="h1" variant="h5">
                    Sign up
                </Typography>
                <form className={classes.form} autoComplete='off'>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                name="name"
                                value={name}
                                variant="outlined"
                                error={nameError !== ''}
                                required
                                fullWidth
                                id="name"
                                label="Name"
                                autoFocus
                                onChange={(e) =>  {
                                    setName(e.target.value);
                                    if (e.target.value !== '')setNameError('');
                                }}
                            />
                        </Grid>
                        { nameError && 
                            <Grid item xs={12}>
                                <div style={{color: 'red'}}>{nameError}</div>
                            </Grid>
                        }
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                value={email}
                                required
                                error={emailError !== ''}
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if(e.target.value !== '')setEmailError('');
                                }}
                            />
                        </Grid>
                        { emailError && 
                            <Grid item xs={12}>
                                <div style={{color: 'red'}}>{emailError}</div>
                            </Grid>
                        }
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                value={phoneNo}
                                required
                                error={phoneNoError !== ''}
                                fullWidth
                                id="phoneNo"
                                label="Phone Number"
                                name="phoneNo"
                                onChange={(e) => {
                                    setPhoneNo(e.target.value);
                                    if(e.target.value !== '')setPhoneNoError('');
                                }}
                            />
                        </Grid>
                        { phoneNoError && 
                            <Grid item xs={12}>
                                <div style={{color: 'red'}}>{phoneNoError}</div>
                            </Grid>
                        }
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                error={passwordError !== ''}
                                fullWidth
                                value={password}
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if(e.target.value !== '')setpasswordError('');
                                }}
                            />
                        </Grid>
                        { passwordError && 
                            <Grid item xs={12}>
                                <div style={{color: 'red'}}>{passwordError}</div>
                            </Grid>
                        }
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                error={password2Error !== ''}
                                fullWidth
                                value={password2}
                                name="password2"
                                label="Repeat your Password"
                                type="password"
                                id="password2"
                                onChange={(e) => {
                                    setPassword2(e.target.value);
                                    if(e.target.value !== '')setPassword2Error('');
                                }}
                            />
                        </Grid>
                        { error && 
                            <Grid item xs={12}>
                                <div style={{color: 'red'}}>{error}</div>
                            </Grid>
                        }
                    </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                            style={{textTransform: 'none'}}
                            onClick={handleSubmit}
                        >
                            {
                                isLoading ? 'Signing Up..' : 'Sign Up'
                            }
                        </Button>
                    <Grid container justify="flex-end">
                        <Grid item>
                            <Link to="/signin" variant="body2">
                                Already have an account? Sign in
                            </Link>
                        </Grid>
                    </Grid>
                </form>
            </div>
            {/* <Box mt={5}>
                <Copyright />
            </Box> */}
        </Container>
    );
}