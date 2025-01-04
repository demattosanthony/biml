import { useCallback, useMemo } from "react";
import * as OBC from "@thatopen/components";
import * as WEBIFC from "web-ifc";
import {
  ElementAttributes,
  EntityNode,
  MaterialData,
  MaterialLayer,
  Property,
  PropertySet,
  QuantitySet,
  IFCModel,
} from "@/types/ifc";
import { FragmentIdMap } from "@thatopen/fragments";
import { useViewerStore } from "@/store/useViewerStore";

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
  const models = useViewerStore((state) => state.models);
  const components = useViewerStore((state) => state.components);
  const setSelectedElement = useViewerStore(
    (state) => state.setSelectedElement
  );
  const highlighter = useViewerStore((state) => state.highlighter);
  const world = useViewerStore((state) => state.world);

  // Assume only one model is loaded
  const model: IFCModel | null = useMemo(
    () => (models.length > 0 ? models[0] : null),
    [models]
  );

  // Cache unit mappings to avoid redundant fetching
  const unitCache = useMemo(
    () => new Map<string, { symbol: string; digits: number }>(),
    []
  );

  // Fetch unit symbol and digits based on model and type
  const getModelUnit = useCallback(
    async (type: string): Promise<{ symbol: string; digits: number }> => {
      if (!model) return { symbol: "", digits: 0 };

      // Check cache first
      if (unitCache.has(type)) {
        return unitCache.get(type)!;
      }

      try {
        const unitsAssignment =
          await model.fragmentsGroup.getAllPropertiesOfType(
            WEBIFC.IFCUNITASSIGNMENT
          );
        const units = unitsAssignment
          ? Object.values(unitsAssignment)[0]?.Units || []
          : [];

        for (const handle of units) {
          const unitAttrs = await model.fragmentsGroup.getProperties(
            handle.value
          );
          if (unitAttrs && unitAttrs.UnitType?.value === UNIT_TYPE_MAP[type]) {
            const prefix = unitAttrs.Prefix?.value || "";
            const name = unitAttrs.Name?.value || "";
            const unitKey = `${prefix}${name}`.toUpperCase();

            const unitInfo = IFC_UNIT_SYMBOLS[unitKey] || {
              symbol: "",
              digits: 0,
            };
            unitCache.set(type, unitInfo);
            return unitInfo;
          }
        }

        unitCache.set(type, { symbol: "", digits: 0 });
        return { symbol: "", digits: 0 };
      } catch (error) {
        console.error("Error fetching unit information:", error);
        return { symbol: "", digits: 0 };
      }
    },
    [model, unitCache]
  );

  // Process property or quantity value with unit handling
  const processPropertyValue = useCallback(
    async (
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
        const unitInfo = await getModelUnit(typeName);
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
      expressID: number
    ): Promise<{
      propertySets: PropertySet[];
      quantitySets: QuantitySet[];
    }> => {
      if (!model || !components) return { propertySets: [], quantitySets: [] };

      const propertySets: PropertySet[] = [];
      const quantitySets: QuantitySet[] = [];
      const indexer = components.get<OBC.IfcRelationsIndexer>(
        OBC.IfcRelationsIndexer
      );

      if (!indexer) {
        console.error("IfcRelationsIndexer component not found.");
        return { propertySets, quantitySets };
      }

      try {
        const definedByRelations = indexer.getEntityRelations(
          model.fragmentsGroup,
          expressID,
          "IsDefinedBy"
        );

        if (!definedByRelations) return { propertySets, quantitySets };

        // Batch fetch all relations
        const relations = await Promise.all(
          definedByRelations.map((relationId: number) =>
            model.fragmentsGroup.getProperties(relationId)
          )
        );

        // Process all relations concurrently
        await Promise.all(
          relations.map(async (relation) => {
            if (!relation) return;

            if (relation.type === WEBIFC.IFCPROPERTYSET) {
              const properties = await Promise.all(
                (relation.HasProperties || []).map(async (propHandle: any) => {
                  const propAttrs = await model.fragmentsGroup.getProperties(
                    propHandle.value
                  );
                  return propAttrs
                    ? await processPropertyValue(propAttrs)
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
                  const propAttrs = await model.fragmentsGroup.getProperties(
                    qtoHandle.value
                  );
                  return propAttrs
                    ? await processPropertyValue(propAttrs)
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
      } catch (error) {
        console.error("Error fetching property and quantity sets:", error);
        return { propertySets: [], quantitySets: [] };
      }
    },
    [model, components, processPropertyValue]
  );

  // Fetch material data
  const getMaterialData = useCallback(
    async (expressID: number): Promise<MaterialData[]> => {
      if (!model || !components) return [];

      const materials: MaterialData[] = [];
      const indexer = components.get<OBC.IfcRelationsIndexer>(
        OBC.IfcRelationsIndexer
      );

      if (!indexer) {
        console.error("IfcRelationsIndexer component not found.");
        return materials;
      }

      try {
        const associateRelations = indexer.getEntityRelations(
          model.fragmentsGroup,
          expressID,
          "HasAssociations"
        );

        if (!associateRelations) return materials;

        // Batch fetch all material relations
        const materialRelations = await Promise.all(
          associateRelations.map((assocId: number) =>
            model.fragmentsGroup.getProperties(assocId)
          )
        );

        // Process all material relations concurrently
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
      } catch (error) {
        console.error("Error fetching material data:", error);
        return [];
      }
    },
    [model, components]
  );

  // Process entity attributes (limited to one level of children to prevent performance issues)
  const processEntityAttributes = useCallback(
    async (expressID: number): Promise<EntityNode | null> => {
      if (!model) return null;

      try {
        const attributes = await model.fragmentsGroup.getProperties(expressID);
        if (!attributes) return null;

        const { type, Name } = attributes;
        const ifcClass = OBC.IfcCategoryMap[type] || "Unknown";
        const name = Name?.value || "Unnamed Element";

        // Process attributes
        const elementAttributes: ElementAttributes = {};
        Object.entries(attributes).forEach(([key, attr]) => {
          if (key.startsWith("_") || typeof attr === "function") return;

          if (attr && typeof attr === "object" && "value" in attr) {
            elementAttributes[key] = {
              value: attr.value,
              type: attr.type,
              valueType: attr.valueType,
              unit: attr.unit, // Ensure 'unit' is part of the attribute if available
            };
          } else if (attr !== undefined && attr !== null) {
            elementAttributes[key] = { value: attr };
          }
        });

        // Fetch property sets and quantity sets
        const { propertySets, quantitySets } = await getPropertyAndQuantitySets(
          expressID
        );

        // Fetch materials
        const materials = await getMaterialData(expressID);

        // Fetch children (limited to one level)
        const indexer = components?.get<OBC.IfcRelationsIndexer>(
          OBC.IfcRelationsIndexer
        );
        let children: EntityNode[] = [];

        if (indexer) {
          const relatedRelations = indexer.getEntityRelations(
            model.fragmentsGroup,
            expressID,
            "Decomposes"
          );

          if (relatedRelations && relatedRelations.length > 0) {
            const childNodes = await Promise.all(
              relatedRelations.map(async (childId: number) => {
                if (typeof childId !== "number") return null;
                return await processEntityAttributes(childId);
              })
            );

            children = childNodes.filter(
              (child): child is EntityNode => child !== null
            );
          }
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
      } catch (error) {
        console.error("Error processing entity attributes:", error);
        return null;
      }
    },
    [model, components, getPropertyAndQuantitySets, getMaterialData]
  );

  // Selection Callback
  const onSelection = useCallback(
    async (fragmentIdMap: FragmentIdMap) => {
      console.log("Element selected", fragmentIdMap);

      if (!model) {
        console.log("Model not found");
        setSelectedElement(null);
        return;
      }

      // Extract the first fragment ID
      const fragmentIdEntry = Object.values(fragmentIdMap)[0];
      if (!fragmentIdEntry) {
        setSelectedElement(null);
        return;
      }

      const iterator = fragmentIdEntry.values();
      const fragmentId = iterator.next().value;
      if (typeof fragmentId !== "number") {
        console.error("Selected fragment ID is not a number:", fragmentId);
        setSelectedElement(null);
        return;
      }
      console.log("Selected fragment ID:", fragmentId);

      try {
        // Process the selected element
        const selectedElement = await processEntityAttributes(fragmentId);

        // Handle multiple elements if necessary (assuming single model, this should be one)
        if (selectedElement) {
          setSelectedElement(selectedElement);
        } else {
          console.log("Selected element not found");
          setSelectedElement(null);
        }
      } catch (error) {
        console.error("Error during element selection:", error);
        setSelectedElement(null);
      }

      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
        //   world?.renderer?.resize();
        //   world?.camera?.updateAspect();
      }, 200);
    },
    [
      model,
      models,
      processEntityAttributes,
      setSelectedElement,
      getModelUnit,
      models,
      highlighter,
      world,
    ]
  );

  // Deselection Callback
  const onDeselection = useCallback(() => {
    setSelectedElement(null);
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
      //   world?.renderer?.resize();
      //   world?.camera?.updateAspect();
    }, 200);
  }, [setSelectedElement]);

  return { onSelection, onDeselection };
}
