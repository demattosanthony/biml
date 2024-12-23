// Imports
import { useCallback } from "react";
import * as OBC from "@thatopen/components";
import * as WEBIFC from "web-ifc";
import * as FRAGS from "@thatopen/fragments";
import {
  ElementAttributes,
  EntityNode,
  MaterialData,
  MaterialLayer,
  Property,
  PropertySet,
  QuantitySet,
} from "@/types/ifc";
import { useIfcViewer } from "./useIfcViewer";

// Constants for unit mappings
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

// Hook Implementation
export function useElementSelected() {
  const { highlighter, models, components, setSelectedElement } =
    useIfcViewer();

  // Fetch unit symbol and digits based on model and type
  const getModelUnit = useCallback(
    async (model: FRAGS.FragmentsGroup, type: string) => {
      const unitsAssignment = await model.getAllPropertiesOfType(
        WEBIFC.IFCUNITASSIGNMENT
      );
      const units = unitsAssignment
        ? Object.values(unitsAssignment)[0].Units
        : [];

      for (const handle of units) {
        const unitAttrs = await model.getProperties(handle.value);
        if (unitAttrs && unitAttrs.UnitType?.value === UNIT_TYPE_MAP[type]) {
          const prefix = unitAttrs.Prefix?.value || "";
          const name = unitAttrs.Name?.value || "";
          const unitKey = `${prefix}${name}`.toUpperCase();

          return IFC_UNIT_SYMBOLS[unitKey] || { symbol: "", digits: 0 };
        }
      }
      return { symbol: "", digits: 0 };
    },
    []
  );

  // Process property or quantity value with unit handling
  const processPropertyValue = useCallback(
    async (
      model: FRAGS.FragmentsGroup,
      propAttrs: any,
      displayUnits: boolean = true
    ): Promise<Property | null> => {
      const valueKey = Object.keys(propAttrs).find((attr) =>
        attr.includes("Value")
      );

      if (!valueKey || !propAttrs[valueKey]) return null;

      let value = propAttrs[valueKey].value;
      let unit = "";

      if (displayUnits) {
        const typeName = propAttrs[valueKey].name;
        const unitInfo = await getModelUnit(model, typeName);
        unit = unitInfo.symbol;

        if (typeof value === "number" && unitInfo.digits !== undefined) {
          value = Number(value.toFixed(unitInfo.digits));
        }
      }

      return {
        name: propAttrs.Name?.value || "Unnamed Property",
        value,
        type: propAttrs[valueKey].type,
        valueType: propAttrs[valueKey].valueType,
        unit,
      };
    },
    [getModelUnit]
  );

  // Fetch property sets and quantity sets
  const getPropertyAndQuantitySets = useCallback(
    async (
      model: FRAGS.FragmentsGroup,
      components: OBC.Components,
      expressID: number
    ): Promise<{
      propertySets: PropertySet[];
      quantitySets: QuantitySet[];
    }> => {
      const propertySets: PropertySet[] = [];
      const quantitySets: QuantitySet[] = [];
      const indexer = components.get(OBC.IfcRelationsIndexer);

      const definedByRelations = indexer.getEntityRelations(
        model,
        expressID,
        "IsDefinedBy"
      );

      if (!definedByRelations) return { propertySets, quantitySets };

      const relations = await Promise.all(
        definedByRelations.map((relationId) => model.getProperties(relationId))
      );

      await Promise.all(
        relations.map(async (relation) => {
          if (!relation) return;

          if (relation.type === WEBIFC.IFCPROPERTYSET) {
            const properties = await Promise.all(
              (relation.HasProperties || []).map(async (propHandle: any) => {
                const propAttrs = await model.getProperties(propHandle.value);
                return propAttrs
                  ? await processPropertyValue(model, propAttrs)
                  : null;
              })
            );

            const validProperties = properties.filter(
              (prop): prop is Property => prop !== null
            );

            if (validProperties.length > 0) {
              propertySets.push({
                name: relation.Name?.value || "Unnamed PropertySet",
                properties: validProperties,
              });
            }
          } else if (relation.type === WEBIFC.IFCELEMENTQUANTITY) {
            const quantities = await Promise.all(
              (relation.Quantities || []).map(async (qtoHandle: any) => {
                const propAttrs = await model.getProperties(qtoHandle.value);
                return propAttrs
                  ? await processPropertyValue(model, propAttrs)
                  : null;
              })
            );

            const validQuantities = quantities.filter(
              (qto): qto is Property => qto !== null
            );

            if (validQuantities.length > 0) {
              quantitySets.push({
                name: relation.Name?.value || "Unnamed QuantitySet",
                quantities: validQuantities,
              });
            }
          }
        })
      );

      return { propertySets, quantitySets };
    },
    [processPropertyValue]
  );

  // Fetch material data
  const getMaterialData = useCallback(
    async (
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

      const materialRelations = await Promise.all(
        associateRelations.map((assocId) => model.getProperties(assocId))
      );

      materialRelations.forEach((material) => {
        if (!material) return;

        switch (material.type) {
          case WEBIFC.IFCMATERIALLAYERSETUSAGE:
            const layers: MaterialLayer[] = (material.MaterialLayers || [])
              .map((layerHandle: any) => ({
                thickness: layerHandle.LayerThickness?.value || 0,
                materialName: layerHandle.Material?.Name?.value || "",
              }))
              .filter((layer: MaterialLayer) => layer.materialName);

            if (layers.length > 0) {
              materials.push({
                type: "layerset",
                layers,
              });
            }
            break;

          case WEBIFC.IFCMATERIALLIST:
            const materialNames: string[] = (material.Materials || [])
              .map((matHandle: any) => matHandle.Name?.value || "")
              .filter((name: string) => name);

            if (materialNames.length > 0) {
              materials.push({
                type: "list",
                materials: materialNames,
              });
            }
            break;

          case WEBIFC.IFCMATERIAL:
            materials.push({
              type: "single",
              name: material.Name?.value || "Unnamed Material",
            });
            break;

          default:
            break;
        }
      });

      return materials;
    },
    []
  );

  // Process entity attributes recursively
  const processEntityAttributes = useCallback(
    async (
      components: OBC.Components,
      model: FRAGS.FragmentsGroup,
      expressID: number,
      editable: boolean = false,
      processedIds: Set<number> = new Set()
    ): Promise<EntityNode | null> => {
      if (processedIds.has(expressID)) return null; // Prevent circular references
      processedIds.add(expressID);

      const attributes = await model.getProperties(expressID);
      if (!attributes) return null;

      const { type, Name } = attributes;
      const ifcClass = OBC.IfcCategoryMap[type] || "Unknown";
      const name = Name?.value || "Unnamed Element";

      // Process attributes
      const elementAttributes: ElementAttributes = {};
      await Promise.all(
        Object.entries(attributes).map(async ([key, attr]) => {
          if (key.startsWith("_") || typeof attr === "function") return;

          if (attr && typeof attr === "object" && "value" in attr) {
            elementAttributes[key] = {
              value: attr.value,
              type: attr.type,
              valueType: attr.valueType,
            };
          } else if (attr !== undefined && attr !== null) {
            elementAttributes[key] = { value: attr };
          }
        })
      );

      // Fetch property sets and quantity sets
      const { propertySets, quantitySets } = await getPropertyAndQuantitySets(
        model,
        components,
        expressID
      );

      // Fetch materials
      const materials = await getMaterialData(model, components, expressID);

      // Fetch related children recursively
      const indexer = components.get(OBC.IfcRelationsIndexer);
      const relatedRelations = indexer.getEntityRelations(
        model,
        expressID,
        "Decomposes" // Use a valid relation type
      );

      let children: EntityNode[] = [];
      if (relatedRelations) {
        const childElements = await Promise.all(
          relatedRelations.map(async (childId) => {
            if (typeof childId !== "number") return null; // Ensure childId is number
            return await processEntityAttributes(
              components,
              model,
              childId,
              editable,
              processedIds
            );
          })
        );
        children = childElements.filter(
          (child): child is EntityNode => child !== null
        );
      }

      return {
        expressID,
        name,
        ifcClass,
        attributes: elementAttributes,
        psets: propertySets,
        qsets: quantitySets,
        materials,
        children,
      };
    },
    [getMaterialData, getPropertyAndQuantitySets]
  );

  // Selection Callback
  const onSelection = useCallback(
    async (fragmentIdMap: FRAGS.FragmentIdMap) => {
      console.log("Element selected", fragmentIdMap);

      // Extract the first fragment ID
      const fragmentIdEntry = Object.values(fragmentIdMap)[0];
      if (!fragmentIdEntry) {
        setSelectedElement(null);
        return;
      }

      const fragmentId = fragmentIdEntry.values().next().value;
      if (typeof fragmentId !== "number") {
        console.error("Selected fragment ID is not a number:", fragmentId);
        setSelectedElement(null);
        return;
      }
      console.log("Selected fragment ID:", fragmentId);

      if (!components) {
        console.error("Components are null.");
        setSelectedElement(null);
        return;
      }

      // Process all models in parallel
      const selectedElements = await Promise.all(
        models.map(async (model) => {
          const entityAttrs = await model.fragmentsGroup.getProperties(
            fragmentId
          );
          if (!entityAttrs) return null;

          return await processEntityAttributes(
            components,
            model.fragmentsGroup,
            fragmentId
          );
        })
      );

      // Filter out null results
      const validSelectedElements = selectedElements.filter(
        (element): element is EntityNode => element !== null
      );

      if (validSelectedElements.length === 1) {
        setSelectedElement(validSelectedElements[0]);
      } else if (validSelectedElements.length > 1) {
        // Handle multiple selected elements by creating a root node
        setSelectedElement({
          expressID: -1, // Special ID for root
          name: "Multiple Selected Elements",
          ifcClass: "Multiple",
          children: validSelectedElements,
          psets: [],
          qsets: [],
          materials: [],
        });
      } else {
        setSelectedElement(null);
      }
    },
    [components, models, processEntityAttributes, setSelectedElement]
  );

  // Deselection Callback
  const onDeselection = useCallback(() => {
    setSelectedElement(null);
  }, [setSelectedElement]);

  return { onSelection, onDeselection };
}
