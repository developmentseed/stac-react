import T from 'prop-types';

function Panel({ children, className }) {
  return <div className={`bg-slate-100 ${className}`}>{ children }</div>;
}

Panel.propTypes = {
  children: T.node.isRequired,
  className: T.string
};

export default Panel;
