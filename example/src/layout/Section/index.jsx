import T from 'prop-types';

function Section({ children, className }) {
  return <div className={`my-8 ${className}`}>{ children }</div>;
}

Section.propTypes = {
  children: T.node.isRequired,
  className: T.string
};

export default Section;
