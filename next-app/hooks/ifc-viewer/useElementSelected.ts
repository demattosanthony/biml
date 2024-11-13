import useIfcViewerStore, { PropertySet } from "@/stores/useIfcViewerStore";
import { useCallback } from "react";
import * as OBC from "@thatopen/components";
import * as WEBIFC from "web-ifc";
import * as FRAGS from "@thatopen/fragments";

interface ElementAttributes {
  [key: string]: {
    value?: any;
    type?: number;
    valueType?: string;
  };
}

const UNIT_TYPE_MAP: Record<string, string> = {
  IFCLENGTHMEASURE: "LENGTHUNIT",
  IFCAREAMEASURE: "AREAUNIT",
  IFCVOLUMEMEASURE: "VOLUMEUNIT",
  IFCPLANEANGLEMEASURE: "PLANEANGLEUNIT",
};

const IFC_UNIT_SYMBOLS: Record<string, { symbol: string; digits: number }> = {
  MILLIMETRE: { symbol: "mm", digits: 0 },
  METRE: { symbol: "m", digits: 2 },
  KILOMETRE: { symbol: "km", digits: 2 },
  SQUARE_METRE: { symbol: "m²", digits: 2 },
  CUBIC_METRE: { symbol: "m³", digits: 2 },
  DEGREE: { symbol: "°", digits: 2 },
  RADIAN: { symbol: "rad", digits: 2 },
  GRAM: { symbol: "g", digits: 0 },
  KILOGRAM: { symbol: "kg", digits: 2 },
  MILLISECOND: { symbol: "ms", digits: 0 },
  SECOND: { symbol: "s", digits: 0 },
};

const getModelUnit = async (model: FRAGS.FragmentsGroup, type: string) => {
  const units = Object.values(
    (await model.getAllPropertiesOfType(WEBIFC.IFCUNITASSIGNMENT))!
  )[0];

  let unit: string | undefined;
  for (const handle of units.Units) {
    const unitAttrs = await model.getProperties(handle.value);
    if (unitAttrs && unitAttrs.UnitType?.value === UNIT_TYPE_MAP[type]) {
      unit = `${unitAttrs.Prefix?.value ?? ""}${unitAttrs.Name?.value ?? ""}`;
      break;
    }
  }

  if (unit) return IFC_UNIT_SYMBOLS[unit];
  return null;
};

export function useElementSelected() {
  const highlighter = useIfcViewerStore((state) => state.highlighter);
  const models = useIfcViewerStore((state) => state.models);
  const setSelectedElement = useIfcViewerStore(
    (state) => state.actions.setSelectedElement
  );
  const components = useIfcViewerStore((state) => state.components);

  const processAttributes = (entityAttrs: any): ElementAttributes => {
    const attributes: ElementAttributes = {};

    // Filter out internal properties and process the rest
    for (const key in entityAttrs) {
      // Skip internal properties and functions
      if (key.startsWith("_") || typeof entityAttrs[key] === "function") {
        continue;
      }

      const value = entityAttrs[key];
      if (value && typeof value === "object") {
        // Handle nested objects that have a 'value' property
        if ("value" in value) {
          attributes[key] = {
            value: value.value,
            type: value.type,
            valueType: value.valueType,
          };
        }
      } else if (value !== undefined && value !== null) {
        // Handle direct values
        attributes[key] = {
          value: value,
        };
      }
    }

    return attributes;
  };

  const getPropertySets = async (
    model: any,
    components: OBC.Components,
    expressID: number
  ): Promise<PropertySet[]> => {
    const propertysets: PropertySet[] = [];
    const indexer = components.get(OBC.IfcRelationsIndexer);

    const definedByRelations = indexer.getEntityRelations(
      model.fragmentsGroup,
      expressID,
      "IsDefinedBy"
    );

    if (!definedByRelations) return propertysets;

    for (const relationId of definedByRelations) {
      const pset = await model.fragmentsGroup.getProperties(relationId);

      if (pset && pset.type === WEBIFC.IFCPROPERTYSET) {
        const propertySet: PropertySet = {
          name: pset.Name?.value || "Unnamed PropertySet",
          properties: {},
        };

        if (pset.HasProperties) {
          for (const propHandle of pset.HasProperties) {
            const propID = propHandle.value || propHandle;
            const propAttrs = await model.fragmentsGroup.getProperties(propID);

            if (!propAttrs) continue;

            // Find the value key (NominalValue, LengthValue, etc.)
            const valueKey = Object.keys(propAttrs).find(
              (key) =>
                key.includes("Value") &&
                propAttrs[key] &&
                typeof propAttrs[key] === "object" &&
                "value" in propAttrs[key]
            );

            if (!valueKey || !propAttrs[valueKey]) continue;

            let value = propAttrs[valueKey].value;
            let unit = "";

            // Get units if available
            if (propAttrs[valueKey].type) {
              const units = await getModelUnit(
                model.fragmentsGroup,
                propAttrs[valueKey].type
              );

              if (units && typeof value === "number") {
                unit = units.symbol;
                value = Number(value.toFixed(units.digits));
              }
            }

            const propertyName = propAttrs.Name?.value || "Unnamed Property";
            propertySet.properties[propertyName] = {
              value: value,
              type: propAttrs[valueKey].type,
              valueType: propAttrs[valueKey].valueType,
              unit: unit,
            };
          }
        }

        propertysets.push(propertySet);
      }
    }

    return propertysets;
  };

  const onSelection = useCallback(
    async (fragmentIdMap: { [fragmentId: string]: Set<number> }) => {
      console.log("Element selected");
      // Get the selected fragment id
      const fragmentId = Object.values(fragmentIdMap)[0]?.values().next().value;
      console.log("Selected fragment id", fragmentId);

      // Check to find the element in all models
      for (const model of models) {
        console.log("Checking model", model.name);

        const entityAttrs = await model.fragmentsGroup.getProperties(
          fragmentId
        );

        if (!entityAttrs) return null;

        const { type, Name } = entityAttrs;
        const processedAttributes = processAttributes(entityAttrs);
        console.log("Processed attributes", processedAttributes);

        // Get property sets for the element
        const propertysets = await getPropertySets(
          model,
          components!,
          fragmentId
        );

        console.log("Property sets", propertysets);

        setSelectedElement({
          expressID: fragmentId!,
          name: Name?.value || "",
          ifcClass: OBC.IfcCategoryMap[type],
          children: [],
          psets: propertysets,
        });
      }
    },
    [models, highlighter, components]
  );

  const onDeselection = useCallback(() => {
    setSelectedElement(null);
  }, [models, highlighter]);

  return { onSelection, onDeselection };
}
