import { useCallback } from 'react';
import T from 'prop-types';
import Legend from './Legend';

function Checkbox({ label, name, options, values, onChange }) {
  const handleChange = useCallback(
    (event) => {
      const { value } = event.target;

      const nextValues = values.includes(value)
        ? values.filter((v) => v !== value)
        : [...values, value];

      onChange(nextValues);
    },
    [values, onChange]
  );

  return (
    <fieldset>
      <Legend>{label}</Legend>
      {options.map(({ value, label: optionLabel }) => {
        const fieldId = `${name}-${value}`;

        return (
          <div className="block" key={fieldId}>
            <input
              id={fieldId}
              name={name}
              value={value}
              type="checkbox"
              onChange={handleChange}
              checked={values.includes(value)}
            />
            <label htmlFor={fieldId} className="ml-2">
              {optionLabel}
            </label>
          </div>
        );
      })}
    </fieldset>
  );
}

Checkbox.propTypes = {
  label: T.string.isRequired,
  name: T.string.isRequired,
  options: T.arrayOf(
    T.shape({
      value: T.string.isRequired,
      label: T.string.isRequired,
    })
  ).isRequired,
  values: T.arrayOf(T.string).isRequired,
  onChange: T.func.isRequired,
};

export default Checkbox;
