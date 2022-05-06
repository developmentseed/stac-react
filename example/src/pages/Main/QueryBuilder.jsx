import T from 'prop-types';
import { useCallback } from 'react';

import { PrimaryButton } from "../../components/buttons";
import { H2 } from "../../components/headers";
import Panel from "../../layout/Panel";
import Section from '../../layout/Section';

function QueryBuilder ({ setIsBboxDrawEnabled, handleSubmit }) {
  const handleEnableBbox = useCallback(() => setIsBboxDrawEnabled(true), [setIsBboxDrawEnabled]);
  return (
    <Panel>
      <H2>Query Builder</H2>

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
  handleSubmit: T.func.isRequired
}

export default QueryBuilder;
