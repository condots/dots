import { appStore } from "@/store/app";
import { getNode, getProperties } from "@/store/flow";
import { getItem } from "@/store/onto";
import { Dialog } from "primereact/dialog";
import PropMenu from "@/components/Prop/PropMenu";
import InstPropertyInput from "@/components/Prop/PropInput";
import InstPropertyToggle from "@/components/Prop/PropToggle";
import { Button } from "primereact/button";

export default function PropDialog() {
  const showPropDialog = appStore.use.showPropDialog();
  const nodeId = appStore.use.selectedNodeId();
  const node = getNode(nodeId);
  const cls = getItem(node?.data.iri);
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

  const Header = () => {
    return (
      <div className="flex justify-between">
        <span className="font-semibold">{cls?.name}</span>
        <Button
          icon="pi pi-question-circle"
          severity="secondary"
          unstyled
          className="p-button-icon-only p-button-rounded flex justify-center items-center text-primary hover:text-gray-600"
          onClick={() =>
            appStore.setState({
              selectedInfoIri: cls?.iri,
              showInfoDialog: true,
            })
          }
        ></Button>
      </div>
    );
  };

  return (
    <div className="card justify-content-center flex">
      <Dialog
        dismissableMask
        visible={showPropDialog}
        header={Header}
        className="w-full h-2/3 mx-12  max-w-2xl"
        headerClassName="bg-[#fcfcfc]"
        contentClassName="bg-[#fcfcfc]"
        onHide={() => appStore.setState({ showPropDialog: false })}
      >
        <PropMenu />
        <div className="card my-3 mx-2">
          <div className="grid grid-cols-4 gap-4">{propertyFields}</div>
        </div>
      </Dialog>
    </div>
  );
}
