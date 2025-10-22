import T from 'prop-types';

export const TItem = {
  id: T.string.isRequired,
};

export const TItemList = T.shape({
  features: T.arrayOf(T.shape(TItem)),
});
