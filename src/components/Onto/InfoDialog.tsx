import { appStore } from "@/store/app";
import { byIRI } from "@/store/onto";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";

export function InfoDialog() {
  const iri = appStore.use.selectedInfoIri();
  const cmp = iri && byIRI(iri);

  return (
    <Dialog
      maximized
      visible={iri !== null}
      onHide={() => appStore.setState({ selectedInfoIri: null })}
    >
      <Card title={cmp?.name} subTitle={cmp?.summary} className="shadow-none">
        <p>{cmp?.description}</p>
      </Card>
    </Dialog>
  );
}
