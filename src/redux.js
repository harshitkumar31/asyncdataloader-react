import { createActions, handleActions } from 'redux-actions';

export const COMPONENT_LOADED = 'COMPONENT_LOADED';

const defaultState = {
  components: {},
};

export default handleActions({
  [COMPONENT_LOADED]: (state, action) => Object.assign({}, state, { components: Object.assign({}, state.components, action.payload) }),
}, defaultState);

export const { componentLoaded } = createActions(COMPONENT_LOADED,
);
