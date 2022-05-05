import T from 'prop-types';

const ButtonType = {
  type: T.oneOf(['submit', 'button']),
  onClick: T.func.isRequired,
  children: T.node.isRequired,
}

const DefaultButtonType = {
  ...ButtonType,
  className: T.string,
}

function Button({ type, className, children, onClick }) {
  return (
    <button
      type={type}
      className={`${className} px-2 py-1 rounded`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

Button.propTypes = DefaultButtonType;
Button.defaultProps = {
  type: 'button'
}

export function PrimaryButton({ children, ...rest }) {
  return <Button {...rest} className='bg-slate-600 text-white active:bg-slate-700'>{children}</Button>;
}

PrimaryButton.propTypes = ButtonType;
