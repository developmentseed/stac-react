import T from 'prop-types';
import { useCallback } from 'react';

import { PrimaryButton } from "../../components/buttons";
import { H2 } from "../../components/headers";
import Panel from "../../layout/Panel";

function QueryBuilder ({ setIsBboxDrawEnabled, handleSubmit }) {
  const handleEnableBbox = useCallback(() => setIsBboxDrawEnabled(true), [setIsBboxDrawEnabled]);
  return (
    <Panel>
      <H2>Query Builder</H2>
      <PrimaryButton onClick={handleEnableBbox}>Set bbox</PrimaryButton>
      <PrimaryButton onClick={handleSubmit}>Submit</PrimaryButton>
    </Panel>
  );
}

QueryBuilder.propTypes = {
  setIsBboxDrawEnabled: T.func.isRequired,
  handleSubmit: T.func.isRequired
}

export default QueryBuilder;
