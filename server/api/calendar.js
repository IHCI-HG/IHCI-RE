var _ = require('underscore'),
    resProcessor = require('../components/res-processor/res-processor'),
    proxy = require('../components/proxy/proxy'),
    conf = require('../conf');

import fetch from 'isomorphic-fetch';
import lo from 'lodash';
import { remindSchedule } from '../components/wx-utils/wx-utils'
import apiAuth from '../components/auth/api-auth'


const remind = async (req, res, next) => {
    const target = req.body.target;
    const schedule = req.body.schedule;
    const source = req.body.source;
    remindSchedule(target, source, schedule);
}


module.exports = [
    ['POST', '/api/calendar/remind', apiAuth, remind]
];
