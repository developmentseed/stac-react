import { PrimaryButton } from "../../components/buttons";
import { H2 } from "../../components/headers";
import Panel from "../../layout/Panel";

function QueryBuilder () {
  return (
    <Panel>
      <H2>Query Builder</H2>
      <PrimaryButton onClick={() => console.log('click')}>Set bbox</PrimaryButton>
    </Panel>
  );
}

export default QueryBuilder;
