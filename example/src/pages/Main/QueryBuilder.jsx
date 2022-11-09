import T from 'prop-types';
import { useCallback, useMemo } from 'react';

import { useCollections, StacApi } from "stac-react";

import { PrimaryButton } from "../../components/buttons";
import { Checkbox, Legend } from '../../components/form';
import { H2 } from "../../components/headers";
import Panel from "../../layout/Panel";
import Section from '../../layout/Section';

function QueryBuilder ({
  setIsBboxDrawEnabled,
  collections: selectedCollections,
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
  
  const stacApi = useMemo(() => new StacApi(process.env.REACT_APP_STAC_API), []);
  const { collections } = useCollections(stacApi);

  const collectionOptions = useMemo(
    () => collections ? collections.collections.map(({ id, title }) => ({ value: id, label: title})) : [],
    [collections]
  );

  return (
    <Panel className="py-4 grid grid-rows-[min-content_auto_min-content_min-content_min-content] gap-4 h-[calc(100vh_-_90px)]">
      <H2 className="px-4">Query Builder</H2>

      <Section className="px-4 overflow-x-hidden overflow-y-auto">
        <Checkbox
          label="Select Collections"
          name="collections"
          options={collectionOptions}
          values={selectedCollections}
          onChange={setCollections}
        />
      </Section>

      <Section className="px-4">
        <fieldset>
          <Legend>Select Date Range</Legend>
          <label htmlFor='date_from'>From</label>
          <input type="date" name="date_from" id="date_from" onChange={handleRangeFromChange} value={dateRangeFrom} />
          <label htmlFor='date_to'>To</label>
          <input type="date" name="date_to" id="date_to" onChange={handleRangeToChange} value={dateRangeTo} />
        </fieldset>
      </Section>

      <Section className="px-4">
        <PrimaryButton onClick={handleEnableBbox}>Set bbox</PrimaryButton>
      </Section>

      <Section className="px-4">
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
