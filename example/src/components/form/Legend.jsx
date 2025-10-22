import T from 'prop-types';

function Legend({ children, className }) {
  return <legend className={`mb-1 font-semibold ${className}`}>{children}</legend>;
}

Legend.propTypes = {
  children: T.node.isRequired,
  className: T.string,
};

export default Legend;
