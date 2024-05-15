import { appStore } from "@/store/app";
import { getNode, getProperties } from "@/store/flow";
import { byIri } from "@/store/onto";
import { Dialog } from "primereact/dialog";
import PropMenu from "@/components/Prop/PropMenu";
import InstPropertyInput from "@/components/Prop/PropInput";
import InstPropertyToggle from "@/components/Prop/PropToggle";

export default function PropDialog() {
  const nodeId = appStore.use.selectedNodeId();
  const node = getNode(nodeId);
  const cls = byIri(node?.data.iri);
  const properties = getProperties(nodeId);

  const propertyFields = Object.entries(properties || {}).map(
    ([propertyId, propertyData]) => {
      if (propertyData.datatype === "boolean") {
        return (
          <InstPropertyToggle
            key={propertyId}
            nodeId={nodeId}
            propertyId={propertyId}
          />
        );
      } else {
        return (
          <InstPropertyInput
            key={propertyId}
            nodeId={nodeId}
            propertyId={propertyId}
          />
        );
      }
    },
  );

  return (
    <div className="card justify-content-center flex">
      <Dialog
        dismissableMask
        visible={nodeId !== null}
        header={cls?.name}
        className="w-1/2 h-2/3"
        onHide={() => appStore.setState({ selectedNodeId: null })}
      >
        <PropMenu />
        <div className="card my-3 mx-2">
          <div className="grid grid-cols-4 gap-4">{propertyFields}</div>
        </div>
      </Dialog>
    </div>
  );
}
