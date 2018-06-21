import shallowEqual from './shallowEqual'


function shouldComponentUpdate (nextProps, nextState) {
    return (
        !shallowEqual(this.props, nextProps) ||
        !shallowEqual(this.state, nextState)
    );
}


export default {
    shouldComponentUpdate
}

