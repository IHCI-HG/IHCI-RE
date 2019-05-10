var _ = require('underscore'),
    resProcessor = require('../components/res-processor/res-processor'),
    proxy = require('../components/proxy/proxy'),
    conf = require('../conf');
   
import fetch from 'isomorphic-fetch';
import lo from 'lodash';
import apiAuth from '../components/auth/api-auth'

import{
    isMember,
    isAdmin,
    isCreator
}from '../middleware/auth-judge/auth-judge'

const calendar = async (req, res, next) => { 
    
}


module.exports = [
    ['POST', '/api/calendar', apiAuth, isMember, calendar]
];
