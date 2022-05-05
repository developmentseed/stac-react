import T from 'prop-types';

export function H2({ children }) {
  return <h2 className='font-bold text-lg'>{children}</h2>;
}

const Props = {
  children: T.node.isRequired,
}

H2.propTypes = Props;
