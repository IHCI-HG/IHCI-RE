import { remindSchedule } from '../components/wx-utils/wx-utils'
import apiAuth from '../components/auth/api-auth'


const remind = async (req, res, next) => {
    const target = req.body.target;
    const scheduleId = req.body.scheduleId;
    const source = req.body.source;
    remindSchedule(target, source, scheduleId);
}


module.exports = [
    ['POST', '/api/calendar/remind', apiAuth, remind]
];
