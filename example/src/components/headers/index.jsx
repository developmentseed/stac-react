import T from 'prop-types';

export function H2({ children, className }) {
  return <h2 className={`font-bold text-lg ${className}`}>{children}</h2>;
}

const Props = {
  children: T.node.isRequired,
  className: T.string,
};

H2.propTypes = Props;
