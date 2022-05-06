import T from 'prop-types';
import { useCallback } from 'react';

import { PrimaryButton } from "../../components/buttons";
import { Checkbox } from '../../components/form';
import { H2 } from "../../components/headers";
import Panel from "../../layout/Panel";
import Section from '../../layout/Section';

import { collectionsOptions } from '../../config';

function QueryBuilder ({ setIsBboxDrawEnabled, collections, setCollections, handleSubmit }) {
  const handleEnableBbox = useCallback(() => setIsBboxDrawEnabled(true), [setIsBboxDrawEnabled]);
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
  setCollections: T.func.isRequired
}

QueryBuilder.defaultProps = {
  collections: []
}

export default QueryBuilder;
