import { appStore } from "@/store/app";
import { getNode } from "@/store/flow";
import PropMenu from "@/components/Prop/PropMenu";
import PropInputString from "@/components/Prop/PropInputString";
import PropInputNumber from "@/components/Prop/PropInputNumber";
import PropInputBoolean from "@/components/Prop/PropInputBoolean";
import { Sidebar } from "primereact/sidebar";
import { inputProperties } from "@/scripts/app-utils";

export default function PropPanel() {
  const showPropDialog = appStore.use.showPropDialog();
  const nodeId = appStore.use.selectedNodeId();
  const node = getNode(nodeId);
  const cls = node?.data.cls;
  const nodeProperties = node?.data.properties;

  const propertyFields = nodeProperties
    ? Object.entries(nodeProperties).map(([propertyId, nodeProperty]) => {
        if (
          nodeProperty.classProperty.datatype &&
          inputProperties.has(nodeProperty.classProperty.datatype)
        ) {
          const inputKind = inputProperties.get(
            nodeProperty.classProperty.datatype
          )!.inputKind;
          if (inputKind === "string") {
            return (
              <PropInputString
                key={propertyId}
                nodeId={nodeId!}
                propertyId={propertyId}
              />
            );
          } else if (inputKind === "number") {
            return (
              <PropInputNumber
                key={propertyId}
                nodeId={nodeId!}
                propertyId={propertyId}
              />
            );
          } else if (inputKind === "boolean") {
            return (
              <PropInputBoolean
                key={propertyId}
                nodeId={nodeId!}
                propertyId={propertyId}
              />
            );
          }
        }
      })
    : [];

  if (!cls) return;
  return (
    <div>
      <Sidebar
        visible={showPropDialog}
        position="right"
        className="w-full md:w-30rem"
        header={
          <span className="font-lato font-semibold text-lg truncate">
            {cls?.name}
          </span>
        }
        icons={
          <button
            className="flex justify-center items-center text-primary hover:text-gray-600"
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
}
