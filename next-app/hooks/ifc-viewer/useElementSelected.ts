import useIfcViewerStore, {
  MaterialData,
  MaterialLayer,
  Property,
  PropertySet,
  QuantitySet,
} from "@/stores/useIfcViewerStore";
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

export function useElementSelected() {
  const highlighter = useIfcViewerStore((state) => state.highlighter);
  const models = useIfcViewerStore((state) => state.models);
  const setSelectedElement = useIfcViewerStore(
    (state) => state.actions.setSelectedElement
  );
  const components = useIfcViewerStore((state) => state.components);

  const onSelection = useCallback(
    async (fragmentIdMap: FRAGS.FragmentIdMap) => {
      console.log("Element selected");
      console.log("Fragment ID Map", fragmentIdMap);
      // Get the selected fragment id
      const fragmentId = Object.values(fragmentIdMap)[0]?.values().next().value;
      console.log("Selected fragment id", fragmentId);

      // Check to find the element in all models
      for (const model of models) {
        console.log("Checking model", model.name);

        if (!fragmentId) continue;
        const entityAttrs = await model.fragmentsGroup.getProperties(
          fragmentId
        );

        if (!entityAttrs) continue;

        const { type, Name } = entityAttrs;
        const processedAttributes = processAttributes(entityAttrs);
        console.log("Processed attributes", processedAttributes);

        // Get property sets for the element
        const { propertysets, quantitysets } = await getPropertyAndQuantitySets(
          model,
          components!,
          fragmentId
        );

        const materials = await getMaterialData(
          model.fragmentsGroup,
          components!,
          fragmentId
        );

        console.log("Property sets", propertysets);
        console.log("Quantity sets", quantitysets);

        console.log("Materials", materials);

        setSelectedElement({
          expressID: fragmentId!,
          name: Name?.value || "",
          ifcClass: OBC.IfcCategoryMap[type],
          children: [],
          psets: propertysets,
          materials: materials,
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

const getMaterialData = async (
  model: FRAGS.FragmentsGroup,
  components: OBC.Components,
  expressID: number
): Promise<MaterialData[]> => {
  const materials: MaterialData[] = [];
  const indexer = components.get(OBC.IfcRelationsIndexer);

  const associateRelations = indexer.getEntityRelations(
    model,
    expressID,
    "HasAssociations"
  );

  if (!associateRelations) return materials;

  for (const associationID of associateRelations) {
    const material = await model.getProperties(associationID);
    if (!material) continue;

    if (material.type === WEBIFC.IFCMATERIALLAYERSETUSAGE) {
      const layerSetID = material.ForLayerSet?.value;
      const layerSetAttrs = await model.getProperties(layerSetID);
      if (!layerSetAttrs) continue;

      const layers: MaterialLayer[] = [];
      for (const layerHandle of layerSetAttrs.MaterialLayers) {
        const layerID = layerHandle.value;
        const layerAttrs = await model.getProperties(layerID);
        if (!layerAttrs) continue;

        const materialAttrs = await model.getProperties(
          layerAttrs.Material?.value
        );
        if (!materialAttrs) continue;

        layers.push({
          thickness: layerAttrs.LayerThickness?.value,
          materialName: materialAttrs.Name?.value,
        });
      }

      if (layers.length > 0) {
        materials.push({
          type: "layerset",
          layers,
        });
      }
    }

    if (material.type === WEBIFC.IFCMATERIALLIST) {
      const materialNames: string[] = [];
      for (const materialHandle of material.Materials) {
        const materialID = materialHandle.value;
        const materialAttrs = await model.getProperties(materialID);
        if (!materialAttrs?.Name?.value) continue;
        materialNames.push(materialAttrs.Name.value);
      }

      if (materialNames.length > 0) {
        materials.push({
          type: "list",
          materials: materialNames,
        });
      }
    }

    if (material.type === WEBIFC.IFCMATERIAL) {
      materials.push({
        type: "single",
        name: material.Name?.value,
      });
    }
  }

  return materials;
};

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

const processPropertyValue = async (
  model: FRAGS.FragmentsGroup,
  propAttrs: any,
  displayUnits: boolean = true
): Promise<Property | null> => {
  const valueKey = Object.keys(propAttrs).find((attr) =>
    attr.includes("Value")
  );

  if (!(valueKey && propAttrs[valueKey])) return null;

  let value = propAttrs[valueKey].value;
  let symbol = "";

  if (displayUnits) {
    const { name } = propAttrs[valueKey];
    const units = await getModelUnit(model, name);
    if (units) {
      symbol = units.symbol;
      if (typeof value === "number" && units.digits !== undefined) {
        value = value.toFixed(units.digits);
      }
    }
  }

  return {
    name: propAttrs.Name?.value || "Unnamed Property",
    value: value,
    type: propAttrs[valueKey].type,
    valueType: propAttrs[valueKey].valueType,
    unit: symbol,
  };
};
const getPropertyAndQuantitySets = async (
  model: any,
  components: OBC.Components,
  expressID: number
): Promise<{ propertysets: PropertySet[]; quantitysets: QuantitySet[] }> => {
  const propertysets: PropertySet[] = [];
  const quantitysets: QuantitySet[] = [];
  const indexer = components.get(OBC.IfcRelationsIndexer);

  const definedByRelations = indexer.getEntityRelations(
    model.fragmentsGroup,
    expressID,
    "IsDefinedBy"
  );

  if (!definedByRelations) return { propertysets, quantitysets };

  for (const relationId of definedByRelations) {
    const relation = await model.fragmentsGroup.getProperties(relationId);

    if (!relation) continue;

    if (relation.type === WEBIFC.IFCPROPERTYSET) {
      const propertySet: PropertySet = {
        name: relation.Name?.value || "Unnamed PropertySet",
        properties: [],
      };

      if (relation.HasProperties) {
        for (const propHandle of relation.HasProperties) {
          const propID = propHandle.value;
          const propAttrs = await model.fragmentsGroup.getProperties(propID);

          if (!propAttrs) continue;

          const property = await processPropertyValue(
            model.fragmentsGroup,
            propAttrs
          );
          if (property) {
            propertySet.properties.push(property);
          }
        }
      }

      if (propertySet.properties.length > 0) {
        propertysets.push(propertySet);
      }
    } else if (relation.type === WEBIFC.IFCELEMENTQUANTITY) {
      const quantitySet: QuantitySet = {
        name: relation.Name?.value || "Unnamed QuantitySet",
        quantities: [],
      };

      // Handle Quantities array correctly
      if (relation.Quantities) {
        for (const qtoHandle of relation.Quantities) {
          const propID = qtoHandle.value;
          const propAttrs = await model.fragmentsGroup.getProperties(propID);

          if (!propAttrs) continue;

          const valueKey = Object.keys(propAttrs).find((attr) =>
            attr.includes("Value")
          );

          if (!(valueKey && propAttrs[valueKey])) continue;

          let value = propAttrs[valueKey].value;
          let symbol = "";

          // Get units if available
          const { name } = propAttrs[valueKey];
          const units = await getModelUnit(model.fragmentsGroup, name);
          if (units) {
            symbol = units.symbol;
            if (typeof value === "number" && units.digits !== undefined) {
              value = Number(value.toFixed(units.digits));
            }
          }

          quantitySet.quantities.push({
            name: propAttrs.Name?.value || "Unnamed Quantity",
            value: value,
            type: propAttrs[valueKey].type,
            valueType: propAttrs[valueKey].valueType,
            unit: symbol,
          });
        }
      }

      if (quantitySet.quantities.length > 0) {
        quantitysets.push(quantitySet);
      }
    }
  }

  return { propertysets, quantitysets };
};
