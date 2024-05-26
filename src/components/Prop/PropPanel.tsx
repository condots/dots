import { appStore } from "@/store/app";
import { getNode, getProperties } from "@/store/flow";
import { getItem } from "@/store/onto";
import PropMenu from "@/components/Prop/PropMenu";
import InstPropertyInput from "@/components/Prop/PropInput";
import InstPropertyToggle from "@/components/Prop/PropToggle";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";

const PropPanel = () => {
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

  return (
    <div>
      <Sidebar
        visible={showPropDialog}
        position="right"
        className="w-full md:w-30rem"
        header={
          <span className="font-lato font-semibold text-lg">{cls?.name}</span>
        }
        icons={
          <button
            className="p-sidebar-icon flex justify-center items-center text-primary hover:text-gray-600"
            onClick={() =>
              appStore.setState({
                selectedInfoIri: cls?.iri,
                showInfoDialog: true,
              })
            }
          >
            <span className="material-icons-outlined text-base">
              question_mark
            </span>
          </button>
        }
        onHide={() => appStore.setState({ showPropDialog: false })}
      >
        <PropMenu />
        <div className="card my-3 mx-2">
          <div className="grid grid-cols-4 gap-4">{propertyFields}</div>
        </div>
      </Sidebar>
    </div>
  );
};

export default PropPanel;
