import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import { Avatar } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import Hidden from '@material-ui/core/Hidden';

import axios from 'axios';
import {isEmpty, isEqual } from "lodash"
import moment from 'moment';

import BadgeAvatar from './Avator';
import { lastActive } from '../util';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    paper: {

    },
    avatar: {
        margin: theme.spacing(2),
        flexGrow: 1,
    },
    title: {
        //flexGrow: 1,
    },
    list: {
        marginTop: theme.spacing(1),
        backgroundColor: '#f5f2ed',
    }
}));

function Message(props) {
    function formatTime(chatTime) {
        const chatDate = new Date(chatTime);   
        //const chatDate = new Date(2019, 9, 1);     
        const today = new Date();
        const time = moment(chatDate);
    
        if (chatDate.getDay() === today.getDay()) {
            return time.format('hh:mm a');
        } 

        const timeDifference = (Date.now() - chatDate.getTime()) / ( 24 * 60 * 60 * 1000);

        if (timeDifference < 7) {
            return time.format('ddd');
        }

        if (chatDate.getFullYear() === today.getFullYear()) {
            return time.format('MMM D');
        }
        return time.format('MMM D YYYY');
    }

    return (
        <Grid 
            container
        >
            <Grid item md={10}>
                <Typography 
                    variant="subtitle2"  
                >
                    { props.message.text.length <= 30
                    ? props.message.text
                    : props.message.text.substr(0, 30) + '...'
            }
                </Typography>
            </Grid>
            <Grid 
                item md={2} 
            >
                <Hidden smDown>
                    <Typography 
                        variant="subtitle2"  
                    >
                        { formatTime(props.message.time) }
                    </Typography>
                </Hidden>
            </Grid>
        </Grid>
    );
}

let localChatList = [];

export default function ChatList(props) {
    const classes = useStyles();
    //let localChatList = [];
    const userStatus = useRef([]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [chatList, setChatList] = useState([]);
    //const [userStatus, setUserStatus] = useState([]);

    useEffect(() => {
        if (isEmpty(props.owner)) {
            return;
        }

        const savedChatList = localStorage.getItem(`chatList-${props.owner.email}`);
        const parsedChatList = JSON.parse(savedChatList);
        console.log('parsedChatList: ', parsedChatList, typeof parsedChatList);

        if (parsedChatList !== null) {
            setChatList([...parsedChatList]);
            if (props.needToShowChatBox && parsedChatList.length > 0)  {
                props.handleUser(parsedChatList[0].to);
            }
        }
    }, [props.owner]);

    function getUser(email) {
        const userList = props.userList.filter((user) => {
            return user.email === email
        });
        //console.log('user: ', userList[0]);
        return userList[0];
    }

    function isActive(user, check = false) {
        if (userStatus.current.length === 0) {
            console.log('length: ', userStatus.current.length);
            return false;
        }
        const status = lastActive(userStatus.current, user);
        console.log('status: ', status, check);
        return status === 'Active now';
    }

    function addActiveStatusToChatList() {
        return chatList.map((chat) => {
            return {
                ...chat,
                activeStatus: isActive(chat.to)
            }
        });
    }

    useEffect(() => {
        if (userStatus.current.length === 0) {
            return;
        }
        const newList = addActiveStatusToChatList();
        setChatList([...newList]);
    }, [userStatus.current]);

    const fetchStatus = async () => {
        const baseUrl = `${process.env.REACT_APP_CHAT_BASEURL}/api/v1`;
        const option = {
            method: 'GET',
            url: `${baseUrl}/status`,
        };
        try {
            const response = await axios(option);
            if (response.data) {
                console.log(`updated status received for chat list`, response.data);
                //setUserStatus([...response.data]);
                userStatus.current = [...response.data];
            }
        } catch(error) {
            console.log(error);
        }
    }

    function addUserToChatList (chatList) {
        return chatList.map((chat) => {
            if (chat.to === props.owner.email) {
                const user = getUser(chat.from);
                return {
                    ...chat,
                    activeStatus: isActive(user, true),
                    to: user,
                }
            } else {
                const user = getUser(chat.to);
                return {
                    ...chat,
                    text: 'You: ' + chat.text,
                    activeStatus: isActive(user, true),
                    to: user,
                }
            }
        });
    }

    const fetchMessages = async () => {
        const option = {
            method: 'GET',
            url: `${process.env.REACT_APP_CHAT_BASEURL}/api/v1/lastMessages`,
            params: {
                owner: JSON.stringify(props.owner),
                userList: JSON.stringify(props.userList),
                skip: 0
            }
        };
        console.log(option);
        
        try {
            const response = await axios(option);
            if (response.data) {
                const modifiedChatList = addUserToChatList(response.data);
                if (isEqual(localChatList, modifiedChatList)) {
                    console.log('no update for recent messages');
                } else {
                    console.log('update: ', );
                    console.log(modifiedChatList);
                    localChatList = modifiedChatList;
                    setChatList([...modifiedChatList]);
                    localStorage.setItem(`chatList-${props.owner.email}`, JSON.stringify(modifiedChatList));
                    if (props.needToShowChatBox && modifiedChatList.length > 0)  {
                        props.handleUser(modifiedChatList[0].to);
                    }
                }
            }
        } catch(error) {
            console.log(error);
            if(error.response) {
                //setError('something went wrong!');
            }
        }
    }

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (props.userList.length === 0) {
            console.log('no fetch');
            return;
        }
        setTimeout(fetchMessages, 2000);
        const interval = setInterval(() => fetchMessages(), 2000);

        return () =>  {
            //setChatList([]);
            clearInterval(interval);
        }
    }, [props.userList]);

    if (isLoading) {
        return (
            <div style={{textAlign: 'center'}}><CircularProgress/></div>
        );
    }

    return (
        <div className={classes.root}>
            <Paper className={classes.paper} elevation={1}>
                <Grid container direction="col">
                    <React.Fragment>
                        {
                            chatList.map((chat, index) => 
                                <Grid
                                    key={index.toString()}
                                    container
                                    spacing = {1}
                                    item 
                                    direction="row" 
                                    className={classes.list}
                                    onClick={() => { props.handleUser(chat.to)}}// It will show details chat
                                >
                                    {/* <Grid 
                                        item xs={6} sm={4} md={2} style={{padding: 'auto'}}
                                    > 
                                        { chat.activeStatus === true
                                            ? <BadgeAvatar src = {chat.to}/>
                                            : <Avatar
                                                alt={chat.to.name}
                                                src={chat.to.profilePicUrl 
                                                    ? `http://localhost:3001/${chat.to.profilePicUrl}`
                                                    : chat.to.name
                                                }
                                              />
                                        }
                                    </Grid> */}
                                    {
                                        chat.activeStatus 
                                        ?   <Grid item xs={6} sm={4} md={2}>
                                                <BadgeAvatar src={chat.to}/>
                                            </Grid>
                                        :   <Grid
                                                item xs={6} sm={4} md={2} 
                                                style={{padding: '8px'}}
                                            >
                                                <Avatar
                                                    alt={chat.to.name}
                                                    src={chat.to.profilePicUrl 
                                                        ? `${process.env.REACT_APP_AUTH_BASEURL}/${chat.to.profilePicUrl}`
                                                        : chat.to.name
                                                    }
                                              />
                                            </Grid>

                                    }
                                    <Grid 
                                        item 
                                        container 
                                        direction="col" 
                                        xs={6} sm={8} md={10} 
                                        zeroMinWidth={true}
                                    >
                                        <Grid item xs={12}>
                                            <Typography 
                                                variant="body1"  
                                                style={{fontWeight: 'bold'}}
                                            >
                                                {chat.to.name}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Hidden xsDown>
                                                <Message message = {chat}/>
                                            </Hidden>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            )
                        }
                    </React.Fragment>
                </Grid>
                <Divider/>
            </Paper>
        </div>
    );
}