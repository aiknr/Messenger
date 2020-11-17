import React, { useEffect, useRef, useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import axios from 'axios';
import { Helmet } from 'react-helmet';
import {isEmpty} from "lodash";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useHistory
} from "react-router-dom";

import chatIcon from './../static/images/chatIcon.png';
import { hasInternetConnection } from './../util';
import { isDigit } from './../util';
import Timer from './../utility/Timer';

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(10),
        //display: 'flex',
        //flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        //backgroundColor: 'red',
        width: theme.spacing(10),
        height: theme.spacing(10),
        margin: 'auto',
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

export default function EmailVerify(props) {
    const classes = useStyles();

    const history = useHistory();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState({});
    const [data, setData] = useState({});
    const [disabled, setDisabled] = useState(true);
    const [resendDisabled, setResendDisabled] = useState(true);
    const [id_otp, setId] = useState('');
    const [otp, setOtp] = useState('');

    const handleTime = (timer) => {
        if (timer === 0) {
            setResendDisabled(false);
        }
    }
    
    const handleChange = (e) => {
        setError('');
        const value = e.target.value;
        if(isDigit(value) === false) {
            setError('OTP contains only digits');
            return;
        }
        if(value.length > 0) {
            setDisabled(false);
            setOtp(value);
        } else {
            setDisabled(true);
        }
    }

    useEffect(() => {
        const data = history.location.state;
        setData(data);
        console.log('sign up data: ', data);
    }, []);

    useEffect(() => {
        if (isEmpty(data)) {
            return;
        }
        const requestForotp = async () => {
            const baseUrl = 'http://localhost:3001/api/v1';
            const option = {
                method: 'post',
                url: `${baseUrl}/auth/otps/request`,
                data: { email: 'arifurrahmansujon28@gmail.com' }
            };

            try {
                const response = await axios(option);
                if (response.status === 201) {
                    setId(response.data.id);
                }
            } catch(error) {
                console.log(error);
            }
        };
        requestForotp();
    }, [data]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!hasInternetConnection(true))return;
        setError('');
        
        const baseUrl = 'http://localhost:3001/api/v1';
        const option = {
            method: 'post',
            url: `${baseUrl}/auth/otps/verify`,
            data: {
                id: id_otp,
                otp: otp
            }
        };

        setIsLoading(true);
        try {
            const response = await axios(option);
            if (response.data) {
                console.log(response.data);
                // setData(response.data);
                // setIsLoading(false);
                // history.push('/home', response.data);
            }
        } catch(error) {
            if(error.response) {
                console.log(error.response);
                const message = error.response.data
                    ? error.response.data
                    : error.response.statusText;
                setError(message);
            }
            setIsLoading(false);
        }
    }

    const manageTimerPart = () => {
        if (resendDisabled) {
            return <span> after <Timer time={120} handleTime = { handleTime }/> s</span>;
        } else {
            return <span> now</span>;
        }
    }

    if (isEmpty(data)) {
        return <p></p>
    }

    return (
        <div>
            <Helmet>
                <title> Email Verification</title>
            </Helmet>
            <CssBaseline />
            <div
                style={{
                    marginTop: '10%',
                    marginLeft: '30%',
                    marginRight: '30%',
                    backgroundColor: 'white',
                    border: '1px solid black',
                    borderRadius: '8px',
                }}
            >
                <Grid
                    container
                    style={{padding: '20px'}}
                >
                    <Grid
                        item
                        xs={12}
                    >
                        <Typography variant='h5'>
                            Enter the code from your email
                        </Typography>
                    </Grid>
                    <Grid item xs={12} style={{marginTop: '20px'}}>
                        <Typography variant='subtitle1'>
                            {`Let us know that this email address belongs to you. Enter the code from the email sent to `}
            <span style={{fontWeight: 'bold'}}>{data.email}</span>
                        </Typography>
                    </Grid>
                    <Grid 
                        container 
                        item xs={12} 
                        style={{ margin: 'auto'}}
                        spacing={1}
                    >
                        <Grid item xs={6}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                onChange={ handleChange }
                            />
                        </Grid>
                        <Grid item xs={6} style={{margin: 'auto'}}>
                            <Button 
                                variant="contained" 
                                color='primary'
                                disabled={ resendDisabled }
                                style={{
                                    // width: '20%',
                                    textTransform: 'none'
                                }}
                                //onClick = {() =>  props.onClose(profile) }
                            >
                                Resend
                            </Button>
                            { manageTimerPart() }
                        </Grid>
                    </Grid>
                    { error && 
                            <Grid item xs={12}>
                                <div style={{color: 'red'}}>{error}</div>
                            </Grid>
                    }
                    <Grid item xs={12} style={{}}>
                        <Button 
                            variant="contained" 
                            color='primary'
                            disabled={disabled}
                            fullWidth
                            style={{
                                // width: '20%',
                                textTransform: 'none'
                            }}
                            onClick = { handleSubmit }
                        >
                            { isLoading ? 'Submitting..' : 'Submit'}
                        </Button>
                    </Grid>
                    
                </Grid>
                
            </div>
        </div>
    );
}