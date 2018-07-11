import Test from './test'
import TestEditor from './test-editor'
import TeamAdmin from './team-admin'
import TeamJoin from './team-join'
import TeamCreate from './team-create'
import Person from './person'
import TeamDetail from './team-detail'
import Topic from './topic'
import Timeline from './timeline'  
import Member from './member'  
import Sign from './sign'
import TaskDetail from './todo'
import Files from './files'
import SearchResult from './search'
import Inform from './inform'
import Team from './team'


const routerConf = [
    { path: 'search', component: SearchResult },
    { path: 'timeline', component: Timeline },
    { path: 'member', component: Member },
    { path: 'inform', component: Inform },
    { path: 'team', component: Team },
    { path: 'team/:id', component: TeamDetail },
    { path: 'team-admin/:id', component: TeamAdmin },
    { path: 'team-join/:id', component: TeamJoin },
    { path: 'team-create', component: TeamCreate },
    { path: 'files/:id', component: Files },
    { path: 'discuss/topic/:id', component: Topic },
    { path: 'todo/:id', component: TaskDetail },
    { path: 'person', component: Person },
    { path: 'sign', component: Sign },
    { path: 'test', component: Test },
    { path: 'test-editor', component: TestEditor },
]

// const routerConf = [{
//         path: 'search',
//         getComponent: function (nextState, callback) {
//             require.ensure([], (require) => {
//                 callback(null, require('./search').default);
//             });
//         }
//     }, {
//         path: 'timeline',
//         getComponent: function (nextState, callback) {
//             require.ensure([], (require) => {
//                 callback(null, require('./timeline' ).default);
//             });
//         }
//     }, {
//         path: 'member',
//         getComponent: function (nextState, callback) {
//             require.ensure([], (require) => {
//                 callback(null, require('./member').default);
//             });
//         }
//     }, {
//         path: 'inform',
//         getComponent: function (nextState, callback) {
//             require.ensure([], (require) => {
//                 callback(null, require('./inform').default);
//             });
//         }
//     }, {
//         path: 'team',
//         getComponent: function (nextState, callback) {
//             require.ensure([], (require) => {
//                 callback(null, require('./team').default);
//             });
//         }
//     }, {
//         path: 'team/:id',
//         getComponent: function (nextState, callback) {
//             require.ensure([], (require) => {
//                 callback(null, require('./team-detail').default);
//             });
//         }
//     }, {
//         path: 'team-admin/:id',
//         getComponent: function (nextState, callback) {
//             require.ensure([], (require) => {
//                 callback(null, require('./team-admin').default);
//             });
//         }
//     }, {
//         path: 'team-join/:id',
//         getComponent: function (nextState, callback) {
//             require.ensure([], (require) => {
//                 callback(null, require('./team-join').default);
//             });
//         }
//     }, {
//         path: 'team-create',
//         getComponent: function (nextState, callback) {
//             require.ensure([], (require) => {
//                 callback(null, require('./team-create').default);
//             });
//         }
//     }, {
//         path: 'files/:id',
//         getComponent: function (nextState, callback) {
//             require.ensure([], (require) => {
//                 callback(null, require('./files').default);
//             });
//         }
//     }, {
//         path: 'discuss/topic/:id',
//         getComponent: function (nextState, callback) {
//             require.ensure([], (require) => {
//                 callback(null, require('./topic').default);
//             });
//         }
//     }, {
//         path: 'todo/:id',
//         getComponent: function (nextState, callback) {
//             require.ensure([], (require) => {
//                 callback(null, require('./todo').default);
//             });
//         }
//     }, 
//     { path: 'person', component: Person },
//     // {
//     //     path: 'person',
//     //     getComponent: function (nextState, callback) {
//     //         require.ensure([], (require) => {
//     //             callback(null, require('./person').default);
//     //         });
//     //     }
//     // }, 
//     {
//         path: 'sign',
//         getComponent: function (nextState, callback) {
//             require.ensure([], (require) => {
//                 callback(null, require('./sign').default);
//             });
//         }
//     }
// ]

export default routerConf
