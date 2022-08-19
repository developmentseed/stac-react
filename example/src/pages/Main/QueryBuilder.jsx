import T from 'prop-types';
import { useCallback } from 'react';

import { PrimaryButton } from "../../components/buttons";
import { Checkbox, Legend } from '../../components/form';
import { H2 } from "../../components/headers";
import Panel from "../../layout/Panel";
import Section from '../../layout/Section';

import { collectionsOptions } from '../../config';

function QueryBuilder ({
  setIsBboxDrawEnabled,
  collections,
  setCollections,
  handleSubmit,
  dateRangeFrom,
  setDateRangeFrom,
  dateRangeTo,
  setDateRangeTo
}) {
  const handleEnableBbox = useCallback(() => setIsBboxDrawEnabled(true), [setIsBboxDrawEnabled]);

  const handleRangeFromChange = useCallback((e) => setDateRangeFrom(e.target.value), [setDateRangeFrom]);
  const handleRangeToChange = useCallback((e) => setDateRangeTo(e.target.value), [setDateRangeTo]);

  return (
    <Panel>
      <H2>Query Builder</H2>

      <Section>
        <Checkbox
          label="Select Collections"
          name="collections"
          options={collectionsOptions}
          values={collections}
          onChange={setCollections}
        />
      </Section>

      <Section>
        <fieldset>
          <Legend>Select Date Range</Legend>
          <label htmlFor='date_from'>From</label>
          <input type="date" name="date_from" id="date_from" onChange={handleRangeFromChange} value={dateRangeFrom} />
          <label htmlFor='date_to'>To</label>
          <input type="date" name="date_to" id="date_to" onChange={handleRangeToChange} value={dateRangeTo} />
        </fieldset>
      </Section>

      <Section>
        <PrimaryButton onClick={handleEnableBbox}>Set bbox</PrimaryButton>
      </Section>

      <Section>
        <PrimaryButton onClick={handleSubmit}>Submit</PrimaryButton>
      </Section>
    </Panel>
  );
}

QueryBuilder.propTypes = {
  setIsBboxDrawEnabled: T.func.isRequired,
  handleSubmit: T.func.isRequired,
  collections: T.arrayOf(T.string),
  setCollections: T.func.isRequired,
  dateRangeFrom: T.string.isRequired,
  setDateRangeFrom: T.func.isRequired,
  dateRangeTo: T.string.isRequired,
  setDateRangeTo: T.func.isRequired
}

QueryBuilder.defaultProps = {
  collections: []
}

export default QueryBuilder;
